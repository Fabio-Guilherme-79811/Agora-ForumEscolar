import { isDuplicateError, run, selectOne } from "./Dbconnection";
import type { IVotoUtilRepository } from "./interface/Ivotoutilrepository";

export class VotoUtilRepository implements IVotoUtilRepository {
  async adicionar(usuarioId: number, respostaId: number) {
    try {
      await run(
        "INSERT INTO votoutil (usuario_id, resposta_id) VALUES (?, ?)",
        [usuarioId, respostaId],
      );
      return true;
    } catch (e) {
      if (isDuplicateError(e)) return false; // UNIQUE(usuario_id, resposta_id) — RN-16
      throw e;
    }
  }
  async remover(usuarioId: number, respostaId: number) {
    return (
      (
        await run(
          "DELETE FROM votoutil WHERE usuario_id = ? AND resposta_id = ?",
          [usuarioId, respostaId],
        )
      ).affectedRows > 0
    );
  }
  async existe(usuarioId: number, respostaId: number) {
    return (
      (await selectOne(
        "SELECT 1 FROM votoutil WHERE usuario_id = ? AND resposta_id = ?",
        [usuarioId, respostaId],
      )) !== null
    );
  }
  async contarPorResposta(respostaId: number) {
    return (
      (
        await selectOne<{ total: number }>(
          "SELECT COUNT(*) AS total FROM votoutil WHERE resposta_id = ?",
          [respostaId],
        )
      )?.total ?? 0
    );
  }
}
