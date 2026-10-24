import { isDuplicateError, run, select, selectOne, withTransaction } from './DbConnection';
import type { IRespostaRepository } from './interface/Irespostarepository';
import type { RespostaDetalhe, RespostaRow } from './Types';

export class RespostaRepository implements IRespostaRepository {
  async criar(perguntaId: number, autorId: number, conteudo: string) {
    return (await run('INSERT INTO respostas (pergunta_id, autor_id, conteudo) VALUES (?, ?, ?)', [perguntaId, autorId, conteudo])).insertId;
  }

  buscarPorId(id: number) {
    return selectOne<RespostaRow>('SELECT * FROM respostas WHERE id = ?', [id]);
  }

  /** RN-18: validada fixada no topo; demais por mais úteis e depois mais antigas. */
  listarPorPergunta(perguntaId: number) {
    return select<RespostaDetalhe>(
      `SELECT r.*, a.nome AS autor_nome, v.nome AS validador_nome,
         (SELECT COUNT(*) FROM votoutil vu WHERE vu.resposta_id = r.id) AS total_uteis
       FROM respostas r
       JOIN usuarios a ON a.id = r.autor_id
       LEFT JOIN usuarios v ON v.id = r.validada_por
       WHERE r.pergunta_id = ? AND r.oculta = 0
       ORDER BY r.validada DESC, total_uteis DESC, r.criado_em ASC`,
      [perguntaId],
    );
  }

  /**
   * RN-17: transação + trava de linha da pergunta para serializar validações concorrentes.
   * A UNIQUE (pergunta_id, validada_unica) do schema é a rede de segurança final.
   */
  validar(respostaId: number, validadorId: number): Promise<boolean> {
    return withTransaction(async (conn) => {
      const resp = await selectOne<RespostaRow>('SELECT * FROM respostas WHERE id = ?', [respostaId], conn);
      if (!resp) return false;
      await select('SELECT id FROM perguntas WHERE id = ? FOR UPDATE', [resp.pergunta_id], conn);
      const outra = await selectOne(
        'SELECT 1 FROM respostas WHERE pergunta_id = ? AND validada = 1 AND id <> ?',
        [resp.pergunta_id, respostaId], conn,
      );
      if (outra) return false;
      try {
        await run('UPDATE respostas SET validada = 1, validada_por = ?, validada_em = NOW() WHERE id = ?', [validadorId, respostaId], conn);
        return true;
      } catch (e) {
        if (isDuplicateError(e)) return false;
        throw e;
      }
    });
  }

  async retirarValidacao(respostaId: number) {
    await run('UPDATE respostas SET validada = 0, validada_por = NULL, validada_em = NULL WHERE id = ?', [respostaId]);
  }

  async atualizarConteudo(id: number, conteudo: string) {
    await run('UPDATE respostas SET conteudo = ? WHERE id = ?', [conteudo, id]);
  }

  async excluir(id: number) {
    await run('DELETE FROM respostas WHERE id = ?', [id]);
  }

  async definirOculta(id: number, oculta: boolean) {
    await run('UPDATE respostas SET oculta = ? WHERE id = ?', [oculta ? 1 : 0, id]);
  }
}