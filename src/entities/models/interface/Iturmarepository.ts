import type { TurmaRow } from '../Types';

export interface ITurmaRepository {
  criar(nome: string, codigo: string): Promise<number>;
  buscarPorId(id: number): Promise<TurmaRow | null>;
  buscarPorCodigo(codigo: string): Promise<TurmaRow | null>; // RN-07
  atualizarCodigo(id: number, novoCodigo: string): Promise<void>;
  listarPorProfessor(professorId: number): Promise<TurmaRow[]>;
}