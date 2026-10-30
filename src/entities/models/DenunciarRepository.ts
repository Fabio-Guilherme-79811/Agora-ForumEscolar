import { isDuplicateError, run, select, selectOne } from './Dbconnection';
import type { AlvoDenuncia, IDenunciaRepository } from './interface/Idenunciarepository';
import type { DecisaoDenuncia, DenunciaRow } from './Types';

export class DenunciaRepository implements IDenunciaRepository {
  async criar(denuncianteId: number, tipo: AlvoDenuncia, alvoId: number, motivo: string) {
    try {
      await run('INSERT INTO denuncia (denunciante_id, alvo_tipo, alvo_id, motivo) VALUES (?, ?, ?, ?)', [denuncianteId, tipo, alvoId, motivo]);
      return true;
    } catch (e) {
      if (isDuplicateError(e)) return false; // 1 denúncia por usuário/alvo: impede "3 denúncias" forjadas por 1 pessoa
      throw e;
    }
  }
  async contarPendentesPorAlvo(tipo: AlvoDenuncia, alvoId: number) {
    const r = await selectOne<{ total: number }>(
      "SELECT COUNT(*) AS total FROM denuncia WHERE alvo_tipo = ? AND alvo_id = ? AND status = 'pendente'", [tipo, alvoId]);
    return r?.total ?? 0;
  }
  /** Fila do professor, restrita às turmas dele. */
  listarPendentes(turmaIds: number[]) {
    const t = turmaIds.length ? turmaIds : [0];
    return select<DenunciaRow>(
      `SELECT d.* FROM denuncia d
       LEFT JOIN perguntas p ON d.alvo_tipo = 'pergunta' AND p.id = d.alvo_id
       LEFT JOIN respostas r ON d.alvo_tipo = 'resposta' AND r.id = d.alvo_id
       LEFT JOIN perguntas pr ON pr.id = r.pergunta_id
       WHERE d.status = 'pendente' AND COALESCE(p.turma_id, pr.turma_id) IN (?)
       ORDER BY d.criado_em ASC`,
      [t],
    );
  }
  async resolver(id: number, decisao: DecisaoDenuncia, revisorId: number) {
    await run(
      "UPDATE denuncia SET status = 'revisada', decisao = ?, revisada_por = ?, revisada_em = NOW() WHERE id = ? AND status = 'pendente'",
      [decisao, revisorId, id],
    );
  }
}