import type { NovoUsuario, Perfil, UsuarioRow } from '../Types';

export interface IUsuarioRepository {
  criar(dados: NovoUsuario): Promise<number>;
  buscarPorId(id: number): Promise<UsuarioRow | null>;
  buscarPorEmail(email: string): Promise<UsuarioRow | null>;
  listarPorTurma(turmaId: number): Promise<UsuarioRow[]>;
  atualizarPerfil(id: number, dados: { nome?: string; foto?: string | null }): Promise<void>;
  atualizarSenha(id: number, senhaHash: string): Promise<void>;
  atualizarPerfilAcesso(id: number, perfil: Perfil): Promise<void>; // promover/rebaixar Monitor
  registrarFalhaLogin(id: number, maxTentativas: number, bloqueioMinutos: number): Promise<void>; // RN-09
  zerarFalhasLogin(id: number): Promise<void>;
}