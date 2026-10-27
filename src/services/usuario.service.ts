/** Perfil (RN-34, RN-36, RN-37) e gestão de Monitor (UC-17, RN-32). */
import { compare, hash } from 'bcryptjs';
import { ErroDeRegraDeNegocio } from '../entities/erros';
import { Usuario } from '../entities/Usuario';
import type { IUsuarioRepository } from '../entities/models/interface/Iusuariosrepository';
import { AcessoTurmaService } from './acesso-turma.service';
import { ErroDeAutenticacao } from './erros-servico';
import { usuarioDeRow } from './mapeadores.service';
import { PontuacaoService } from './pontuacao.service';
import { Ator, exigir, exigirProfessor } from './tipos.service';

const SALT_ROUNDS = 10;

export interface EdicaoPerfil {
  nome?: string | undefined;
  foto?: string | null | undefined;
  senhaAtual?: string | undefined;
  novaSenha?: string | undefined;
}

export class UsuarioService {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly acesso: AcessoTurmaService,
    private readonly pontuacao: PontuacaoService,
  ) {}

  /** RN-36: o usuário edita apenas nome, foto e senha. Turma e papel ficam fora desta função de propósito. */
  async editarPerfil(ator: Ator, dto: EdicaoPerfil) {
    const row = exigir(await this.usuarioRepo.buscarPorId(ator.id), 'Usuário não encontrado.');
    const entidade = usuarioDeRow(row);

    const campos: Parameters<IUsuarioRepository['atualizarPerfil']>[1] = {};
    if (dto.nome !== undefined) { entidade.nome = dto.nome; campos.nome = entidade.nome; }
    if (dto.foto !== undefined) { entidade.fotoUrl = dto.foto; campos.foto = dto.foto; }
    entidade.validar();

    if (dto.novaSenha !== undefined) {
      Usuario.validarSenhaPlana(dto.novaSenha); // RN-06
      if (!dto.senhaAtual || !(await compare(dto.senhaAtual, row.senha_hash))) {
        throw new ErroDeAutenticacao('Senha atual incorreta.');
      }
      await this.usuarioRepo.atualizarSenha(ator.id, await hash(dto.novaSenha, SALT_ROUNDS));
    }
    if (Object.keys(campos).length > 0) await this.usuarioRepo.atualizarPerfil(ator.id, campos);

    return usuarioDeRow(exigir(await this.usuarioRepo.buscarPorId(ator.id), 'Usuário não encontrado.')).toJSON();
  }

  /** RN-37: perfil público de colega, sem e-mail. */
  async perfilPublico(ator: Ator, usuarioId: number) {
    const row = exigir(await this.usuarioRepo.buscarPorId(usuarioId), 'Usuário não encontrado.');
    if (row.turma_id !== null) await this.acesso.garantirAcesso(ator, row.turma_id);
    // RN-34: contagem de perguntas/respostas/validadas ainda não existe no repository (ver pendências)
    return { ...usuarioDeRow(row).toPublicJSON(), pontos: await this.pontuacao.total(usuarioId) };
  }

  async promoverAMonitor(ator: Ator, alunoId: number): Promise<void> {
    exigirProfessor(ator);
    const entidade = await this.usuarioDaTurmaDoProfessor(ator, alunoId);
    entidade.promoverAMonitor(ator.perfil);
    await this.usuarioRepo.atualizarPerfilAcesso(alunoId, entidade.perfil);
  }

  async rebaixarParaAluno(ator: Ator, monitorId: number): Promise<void> {
    exigirProfessor(ator);
    const entidade = await this.usuarioDaTurmaDoProfessor(ator, monitorId);
    entidade.rebaixarParaAluno(ator.perfil);
    await this.usuarioRepo.atualizarPerfilAcesso(monitorId, entidade.perfil);
  }

  /** UC-17 fluxo 1a: aluno de fora das turmas do professor não pode ser gerenciado. */
  private async usuarioDaTurmaDoProfessor(ator: Ator, usuarioId: number) {
    const row = exigir(await this.usuarioRepo.buscarPorId(usuarioId), 'Usuário não encontrado.');
    if (row.turma_id === null) throw new ErroDeRegraDeNegocio('Este usuário não pertence a uma turma.');
    await this.acesso.garantirAcesso(ator, row.turma_id);
    return usuarioDeRow(row);
  }
}