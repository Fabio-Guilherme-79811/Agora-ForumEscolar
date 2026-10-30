/**
 * Autenticação: cadastro (RN-06/07/08), login com bloqueio (RN-09) e JWT.
 * Logout é responsabilidade do front-end (descartar o token); o servidor é stateless.
 */
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { ErroDeRegraDeNegocio, ErroDeValidacao } from "../entities/erros";
import {
  MAX_TENTATIVAS_LOGIN,
  MINUTOS_BLOQUEIO_LOGIN,
  Usuario,
} from "../entities/Usuario";
import type { ITurmaRepository } from "../entities/models/interface/Iturmarepository";
import type { IUsuarioRepository } from "../entities/models/interface/Iusuariosrepository";
import { PERFIS } from "../middlewares/types/auth";
import { ErroDeAutenticacao } from "./erros.service";
import { usuarioDeRow } from "./mapeadores.service";

const SALT_ROUNDS = 10;
const EXPIRACAO_TOKEN_SEGUNDOS = 8 * 60 * 60; // 8 horas
const MENSAGEM_CREDENCIAIS = "E-mail ou senha inválidos.";

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  codigoTurma: string;
}

export interface ResultadoAutenticacao {
  token: string;
  usuario: ReturnType<Usuario["toJSON"]>; // nunca contém a senha
}

function obterSegredo(): string {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) throw new Error("JWT_SECRET não configurado no .env.");
  return segredo;
}

export class AuthService {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly turmaRepo: ITurmaRepository,
  ) {}

  async cadastrar(dados: DadosCadastro): Promise<ResultadoAutenticacao> {
    const erros: string[] = [];
    if (!dados.nome?.trim()) erros.push("Informe o nome.");
    if (!dados.email?.trim()) erros.push("Informe o e-mail.");
    if (!dados.codigoTurma?.trim()) erros.push("Informe o código da turma.");
    try {
      Usuario.validarSenhaPlana(dados.senha);
    } catch (e) {
      if (e instanceof ErroDeValidacao) erros.push(...e.erros);
      else throw e;
    }
    if (erros.length > 0) throw new ErroDeValidacao(erros);

    // RN-07: código inválido bloqueia o cadastro
    const turma = await this.turmaRepo.buscarPorCodigo(
      dados.codigoTurma.trim().toUpperCase(),
    );
    if (!turma) throw new ErroDeRegraDeNegocio("Código de turma inválido.");

    const email = dados.email.trim().toLowerCase();
    if (await this.usuarioRepo.buscarPorEmail(email)) {
      throw new ErroDeRegraDeNegocio("Este e-mail já está cadastrado.");
    }

    const senhaHash = await hash(dados.senha, SALT_ROUNDS); // senha nunca é salva em texto puro
    // RN-08: todo cadastro entra como Aluno
    const novo = new Usuario({
      nome: dados.nome,
      email,
      senhaHash,
      perfil: "aluno",
      turmaId: turma.id,
    });
    novo.validar();

    const id = await this.usuarioRepo.criar({
      nome: novo.nome,
      email: novo.email,
      senha_hash: senhaHash,
      turma_id: turma.id,
      perfil: "aluno",
    });
    const criado = usuarioDeRow(
      (await this.usuarioRepo.buscarPorId(id)) as NonNullable<
        Awaited<ReturnType<IUsuarioRepository["buscarPorId"]>>
      >,
    );
    return {
      token: this.gerarToken(id, criado.perfil, criado.turmaId),
      usuario: criado.toJSON(),
    };
  }

  async login(
    email: string,
    senha: string,
    agora: Date = new Date(),
  ): Promise<ResultadoAutenticacao> {
    const row = await this.usuarioRepo.buscarPorEmail(
      (email ?? "").trim().toLowerCase(),
    );
    if (!row) throw new ErroDeAutenticacao(MENSAGEM_CREDENCIAIS);
    const usuario = usuarioDeRow(row);

    // RN-09: 5 falhas = 10 minutos bloqueado (o "timer" é a comparação com bloqueado_ate)
    if (usuario.estaBloqueado(agora)) {
      const restanteMs =
        (usuario.bloqueadoAte as Date).getTime() - agora.getTime();
      const minutos = Math.max(1, Math.ceil(restanteMs / 60_000));
      throw new ErroDeAutenticacao(
        `Acesso bloqueado por tentativas inválidas. Tente novamente em ${minutos} minuto(s).`,
      );
    }
    // bloqueio expirado: recomeça a contagem (o UPDATE do repository só incrementa)
    if (row.bloqueado_ate !== null)
      await this.usuarioRepo.zerarFalhasLogin(row.id);
    const tentativasAntes =
      row.bloqueado_ate !== null ? 0 : row.tentativas_login;

    if (!(await compare(senha ?? "", row.senha_hash))) {
      await this.usuarioRepo.registrarFalhaLogin(
        row.id,
        MAX_TENTATIVAS_LOGIN,
        MINUTOS_BLOQUEIO_LOGIN,
      );
      if (tentativasAntes + 1 >= MAX_TENTATIVAS_LOGIN) {
        throw new ErroDeAutenticacao(
          `Muitas tentativas inválidas. Acesso bloqueado por ${MINUTOS_BLOQUEIO_LOGIN} minutos.`,
        );
      }
      throw new ErroDeAutenticacao(MENSAGEM_CREDENCIAIS);
    }

    if (tentativasAntes > 0) await this.usuarioRepo.zerarFalhasLogin(row.id);
    return {
      token: this.gerarToken(row.id, usuario.perfil, usuario.turmaId),
      usuario: usuario.toJSON(),
    };
  }

  /**
   * Payload no formato que o authGuard espera (UsuarioAutenticado): { id, perfil, turma_id }.
   * O authGuard é quem valida o token (HS256) em cada requisição.
   */
  gerarToken(id: number, perfil: string, turmaId: number | null): string {
    // o authGuard só aceita aluno/monitor/professor; um perfil antigo (ex.: 'admin') não recebe token
    if (!(PERFIS as readonly string[]).includes(perfil)) {
      throw new ErroDeAutenticacao("Perfil de acesso não suportado.");
    }
    return sign({ id, perfil, turma_id: turmaId }, obterSegredo(), {
      algorithm: "HS256",
      expiresIn: EXPIRACAO_TOKEN_SEGUNDOS,
    });
  }
}
