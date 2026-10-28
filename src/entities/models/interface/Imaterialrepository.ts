import type { MateriaRow } from "../Types";

export interface IMateriaRepository {
  criar(nome: string): Promise<number>;
  buscarPorId(id: number): Promise<MateriaRow | null>;
  listar(): Promise<MateriaRow[]>;
}
