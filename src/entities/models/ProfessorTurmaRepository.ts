import { run, select, selectOne } from "./Dbconnection";
import type { IProfessorTurmaRepository } from "./interface/Iprofessorturmarepository";

export class ProfessorTurmaRepository implements IProfessorTurmaRepository {
  async vincular(professorId: number, turmaId: number) {
    await run(
      "INSERT IGNORE INTO professor_turma (usuario_id, turma_id) VALUES (?, ?)",
      [professorId, turmaId],
    );
  }
  async desvincular(professorId: number, turmaId: number) {
    await run(
      "DELETE FROM professor_turma WHERE usuario_id = ? AND turma_id = ?",
      [professorId, turmaId],
    );
  }
  async listarTurmaIds(professorId: number) {
    const rows = await select<{ turma_id: number }>(
      "SELECT turma_id FROM professor_turma WHERE usuario_id = ?",
      [professorId],
    );
    return rows.map((r) => r.turma_id);
  }
  async professorEstaNaTurma(professorId: number, turmaId: number) {
    return (
      (await selectOne(
        "SELECT 1 FROM professor_turma WHERE usuario_id = ? AND turma_id = ?",
        [professorId, turmaId],
      )) !== null
    );
  }
}
