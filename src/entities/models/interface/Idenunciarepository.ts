import type { DenunciaRow } from "../Types";

export type AlvoDenuncia = "pergunta" | "resposta";

export interface IDenunciaRepository {
  criar(
    denuncianteId: number,
    tipo: AlvoDenuncia,
    alvoId: number,
    motivo: string,
  ): Promise<boolean>; // false se duplicada
  contarPendentesPorAlvo(tipo: AlvoDenuncia, alvoId: number): Promise<number>; // RN-05
  listarPendentes(turmaIds: number[]): Promise<DenunciaRow[]>;
  resolver(id: number, status: "mantida" | "removida"): Promise<void>;
}
