import type { MateriaRow } from '../Types';

export interface IMateriaRepository {
  criar(nome: string, turmaId: number): Promise<number>;
  buscarPorId(id: number): Promise<MateriaRow | null>;
  /** Só as matérias das turmas informadas (RN-02). */
  listar(turmaIds: number[]): Promise<MateriaRow[]>;
}