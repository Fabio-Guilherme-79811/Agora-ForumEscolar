import type { EstatisticasUsuario, NovoUsuario, Perfil, ResultadoFalhaLogin, UsuarioRow } from '../Types';

export interface IUsuarioRepository {
  criar(dados: NovoUsuario): Promise<number>;
  buscarPorId(id: number): Promise<UsuarioRow | null>;
  buscarPorEmail(email: string): Promise<UsuarioRow | null>;
  listarPorTurma(turmaId: number): Promise<UsuarioRow[]>;
  /** Atualiza só as chaves informadas; foto: null remove a foto. */
  atualizarPerfil(id: number, dados: { nome?: string; foto?: string | null }): Promise<void>;
  atualizarSenha(id: number, senhaHash: string): Promise<void>;
  atualizarPerfilAcesso(id: number, perfil: Perfil): Promise<void>; // promover/rebaixar Monitor
  /** RN-09: conta a falha (recomeça do zero se um bloqueio anterior já expirou) e bloqueia ao atingir o máximo. */
  registrarFalhaLogin(id: number, maxTentativas: number, bloqueioMinutos: number): Promise<ResultadoFalhaLogin>;
  zerarFalhasLogin(id: number): Promise<void>;
  /** RN-34: perguntas, respostas e respostas validadas do usuário (sem conteúdo oculto). */
  obterEstatisticas(id: number): Promise<EstatisticasUsuario>;
}