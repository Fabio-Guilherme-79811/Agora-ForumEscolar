import type { DecisaoDenuncia, DenunciaRow } from '../Types';

export type AlvoDenuncia = 'pergunta' | 'resposta';

export interface IDenunciaRepository {
  criar(denuncianteId: number, tipo: AlvoDenuncia, alvoId: number, motivo: string): Promise<boolean>; // false se duplicada
  contarPendentesPorAlvo(tipo: AlvoDenuncia, alvoId: number): Promise<number>; // RN-05
  listarPendentes(turmaIds: number[]): Promise<DenunciaRow[]>;
  /** pendente → revisada, gravando decisão, professor e data (só se ainda estiver pendente). */
  resolver(id: number, decisao: DecisaoDenuncia, revisorId: number): Promise<void>;
}