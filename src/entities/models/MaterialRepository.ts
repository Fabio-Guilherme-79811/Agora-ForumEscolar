import { run, select, selectOne } from './Dbconnection';
import type { IMateriaRepository } from './interface/Imaterialrepository';
import type { MateriaRow } from './Types';

export class MateriaRepository implements IMateriaRepository {
  async criar(nome: string, turmaId: number) {
    return (await run('INSERT INTO materias (nome, turma_id) VALUES (?, ?)', [nome, turmaId])).insertId;
  }
  buscarPorId(id: number) {
    return selectOne<MateriaRow>('SELECT * FROM materias WHERE id = ?', [id]);
  }
  listar(turmaIds: number[]) {
    if (turmaIds.length === 0) return Promise.resolve([] as MateriaRow[]);
    return select<MateriaRow>('SELECT * FROM materias WHERE turma_id IN (?) ORDER BY nome', [turmaIds]);
  }
}