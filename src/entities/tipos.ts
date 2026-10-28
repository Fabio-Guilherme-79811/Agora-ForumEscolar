export const PERFIS = ['aluno', 'monitor', 'professor', 'admin'] as const;
export type Perfil = (typeof PERFIS)[number];

/** RN-17: apenas Professor ou Monitor validam respostas. */
export const PERFIS_VALIDADORES: readonly Perfil[] = ['professor', 'monitor'];

export function paraData(valor?: Date | string | null): Date | null {
  return valor ? new Date(valor) : null;
}
