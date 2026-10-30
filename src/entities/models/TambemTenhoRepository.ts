import { isDuplicateError, run, selectOne } from "./Dbconnection";
import type { ITambemTenhoRepository } from "./interface/Itambemtenhorepository";

export class TambemTenhoRepository implements ITambemTenhoRepository {
  async adicionar(usuarioId: number, perguntaId: number) {
    try {
      await run(
        "INSERT INTO tambemtenho (usuario_id, pergunta_id) VALUES (?, ?)",
        [usuarioId, perguntaId],
      );
      return true;
    } catch (e) {
      if (isDuplicateError(e)) return false; // UNIQUE(usuario_id, pergunta_id) — RN-15
      throw e;
    }
  }
  async remover(usuarioId: number, perguntaId: number) {
    return (
      (
        await run(
          "DELETE FROM tambemtenho WHERE usuario_id = ? AND pergunta_id = ?",
          [usuarioId, perguntaId],
        )
      ).affectedRows > 0
    );
  }
  async existe(usuarioId: number, perguntaId: number) {
    return (
      (await selectOne(
        "SELECT 1 FROM tambemtenho WHERE usuario_id = ? AND pergunta_id = ?",
        [usuarioId, perguntaId],
      )) !== null
    );
  }
  async contarPorPergunta(perguntaId: number) {
    return (
      (
        await selectOne<{ total: number }>(
          "SELECT COUNT(*) AS total FROM tambemtenho WHERE pergunta_id = ?",
          [perguntaId],
        )
      )?.total ?? 0
    );
  }
}
