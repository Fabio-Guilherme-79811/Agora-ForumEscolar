export const PERFIS = ["aluno", "monitor", "professor"] as const;
export type Perfil = (typeof PERFIS)[number];

/** Payload do JWT (assinado no auth.service com JWT_SECRET). */
export interface UsuarioAutenticado {
  id: number;
  perfil: Perfil;
  /** Professor pode estar em várias turmas (RN-03), então pode ser null. */
  turma_id: number | null;
}