/** Monta repositories, services e middlewares uma única vez. As rotas importam daqui (nada de `new` dentro de rota). */
import type { RequestHandler } from "express";
import { MateriaRepository } from "../entities/models/MaterialRepository";
import { PerguntaRepository } from "../entities/models/PerguntaRepository";
import { ProfessorTurmaRepository } from "../entities/models/ProfessorTurmaRepository";
import { RegistroPontosRepository } from "../entities/models/ResgistroPontosRepository";
import { RespostaRepository } from "../entities/models/RespostaRepository";
import { TambemTenhoRepository } from "../entities/models/TambemTenhoRepository";
import { TurmaRepository } from "../entities/models/TurmaRepository";
import { UsuarioRepository } from "../entities/models/UsuarioRepository";
import { VotoUtilRepository } from "../entities/models/VotoUtilRepository";
import { authGuard } from "../middlewares/auth.middleware";
import { criarCarregarUsuario } from "../middlewares/carregar-usuario.middleware";
import { AcessoTurmaService } from "../services/acesso-turma.service";
import { AuthService } from "../services/auth.service";
import { DuvidaCompartilhadaService } from "../services/duvida-compartilhada.service";
import { IndicadoresService } from "../services/indicadores.service";
import { PerguntaService } from "../services/pergunta.service";
import { PontuacaoService } from "../services/pontuacao.service";
import { RespostaService } from "../services/resposta.service";
import { TermometroService } from "../services/termometro.service";
import { TurmaService } from "../services/turma.service";
import { UsuarioService } from "../services/usuario.service";

const usuarioRepo = new UsuarioRepository();
const turmaRepo = new TurmaRepository();
const materiaRepo = new MateriaRepository();
const perguntaRepo = new PerguntaRepository();
const respostaRepo = new RespostaRepository();

const acesso = new AcessoTurmaService(new ProfessorTurmaRepository());
const pontuacao = new PontuacaoService(new RegistroPontosRepository());

export const authService = new AuthService(usuarioRepo, turmaRepo);
export const perguntaService = new PerguntaService(
  perguntaRepo,
  materiaRepo,
  acesso,
);
export const duvidaService = new DuvidaCompartilhadaService(
  new TambemTenhoRepository(),
  perguntaRepo,
  acesso,
);
export const respostaService = new RespostaService(
  respostaRepo,
  perguntaRepo,
  new VotoUtilRepository(),
  acesso,
  pontuacao,
);
export const termometroService = new TermometroService(perguntaRepo, acesso);
export const indicadoresService = new IndicadoresService(
  perguntaRepo,
  termometroService,
  acesso,
);
export const turmaService = new TurmaService(turmaRepo, acesso);
export const usuarioService = new UsuarioService(
  usuarioRepo,
  acesso,
  pontuacao,
);

/** Rota protegida: token válido (cookie ou Bearer) e usuário recarregado do banco. */
export const autenticado: RequestHandler[] = [
  authGuard,
  criarCarregarUsuario(usuarioRepo),
];