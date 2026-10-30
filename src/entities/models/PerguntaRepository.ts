import { run, select, selectOne } from './Dbconnection';
import type { IPerguntaRepository } from './interface/Iperguntarepository';
import type { FiltroPerguntas, NovaPergunta, PerguntaFeed, PerguntaRow, StatusPergunta, TemperaturaMateria } from './Types';

/** Base do feed: pergunta + autor + matéria + contadores. O status é derivado (nunca gravado). */
const BASE = `
  SELECT p.*, u.nome AS autor_nome, m.nome AS materia_nome,
    (SELECT COUNT(*) FROM respostas r WHERE r.pergunta_id = p.id AND r.oculta = 0) AS total_respostas,
    (SELECT COUNT(*) FROM tambemtenho t WHERE t.pergunta_id = p.id) AS total_tambem_tenho,
    EXISTS(SELECT 1 FROM respostas r WHERE r.pergunta_id = p.id AND r.validada = 1) AS tem_validada
  FROM perguntas p
  JOIN usuarios u ON u.id = p.autor_id
  JOIN materias m ON m.id = p.materia_id`;

type FeedRaw = Omit<PerguntaFeed, 'status'>;

function comStatus(r: FeedRaw): PerguntaFeed {
  const status: StatusPergunta = r.tem_validada ? 'validada' : r.total_respostas > 0 ? 'respondida' : 'aberta';
  return { ...r, status };
}

const ids = (a: number[]) => (a.length ? a : [0]); // evita "IN ()" inválido

export class PerguntaRepository implements IPerguntaRepository {
  async criar(d: NovaPergunta) {
    const r = await run(
      'INSERT INTO perguntas (titulo, descricao, materia_id, turma_id, autor_id, anexo) VALUES (?, ?, ?, ?, ?, ?)',
      [d.titulo, d.descricao, d.materia_id, d.turma_id, d.autor_id, d.anexo ?? null],
    );
    return r.insertId;
  }

  async buscarPorId(id: number) {
    const r = await selectOne<FeedRaw>(`${BASE} WHERE p.id = ?`, [id]);
    return r ? comStatus(r) : null;
  }

  /** RN-02/03 (turmas), RN-10 (ordem), RN-11 (filtros), RN-13 (busca). */
  async listar(f: FiltroPerguntas) {
    const where: string[] = ['x.turma_id IN (?)'];
    const params: unknown[] = [ids(f.turmaIds)];
    if (!f.incluirOcultas) where.push('x.oculta = 0');
    if (f.materiaId) { where.push('x.materia_id = ?'); params.push(f.materiaId); }
    if (f.autorId) { where.push('x.autor_id = ?'); params.push(f.autorId); }
    if (f.busca?.trim()) {
      where.push('(x.titulo LIKE ? OR x.descricao LIKE ?)');
      const like = `%${f.busca.trim().replace(/[%_\\]/g, '\\$&')}%`;
      params.push(like, like);
    }
    if (f.status === 'validada') where.push('x.tem_validada = 1');
    if (f.status === 'respondida') where.push('x.tem_validada = 0 AND x.total_respostas > 0');
    if (f.status === 'aberta') where.push('x.total_respostas = 0');

    const limite = Math.min(Math.max(f.limite ?? 20, 1), 100);
    const offset = Math.max(f.offset ?? 0, 0);
    const rows = await select<FeedRaw>(
      `SELECT x.* FROM (${BASE}) x WHERE ${where.join(' AND ')}
       ORDER BY x.tem_validada ASC, x.criado_em DESC LIMIT ? OFFSET ?`,
      [...params, limite, offset],
    );
    return rows.map(comStatus);
  }

  /** RN-23: pontua por quantas palavras relevantes (>3 letras) do título aparecem. Sem FULLTEXT, para o MVP. */
  async buscarSimilares(turmaId: number, titulo: string, limite = 5) {
    const palavras = [...new Set(titulo.toLowerCase().split(/\W+/).filter((w) => w.length > 3))].slice(0, 6);
    if (palavras.length === 0) return [];
    const likes = palavras.map((w) => `%${w.replace(/[%_\\]/g, '\\$&')}%`);
    const score = palavras.map(() => '(x.titulo LIKE ?)').join(' + ');
    const rows = await select<FeedRaw>(
      `SELECT x.*, (${score}) AS score FROM (${BASE}) x
       WHERE x.turma_id = ? AND x.oculta = 0 HAVING score > 0
       ORDER BY score DESC, x.criado_em DESC LIMIT ?`,
      [...likes, turmaId, limite],
    );
    return rows.map(comStatus);
  }

  async contarPublicadasHoje(autorId: number) {
    const r = await selectOne<{ total: number }>(
      'SELECT COUNT(*) AS total FROM perguntas WHERE autor_id = ? AND criado_em >= CURDATE()',
      [autorId],
    );
    return r?.total ?? 0;
  }

  async atualizar(id: number, d: Partial<Pick<PerguntaRow, 'titulo' | 'descricao' | 'materia_id' | 'anexo'>>) {
    await run(
      `UPDATE perguntas SET titulo = COALESCE(?, titulo), descricao = COALESCE(?, descricao),
         materia_id = COALESCE(?, materia_id), anexo = COALESCE(?, anexo) WHERE id = ?`,
      [d.titulo ?? null, d.descricao ?? null, d.materia_id ?? null, d.anexo ?? null, id],
    );
  }

  async excluir(id: number) {
    await run('DELETE FROM perguntas WHERE id = ?', [id]);
  }

  async marcarResolvida(id: number, resolvida: boolean) {
    await run('UPDATE perguntas SET resolvida = ? WHERE id = ?', [resolvida ? 1 : 0, id]);
  }

  async definirOculta(id: number, oculta: boolean) {
    await run('UPDATE perguntas SET oculta = ? WHERE id = ?', [oculta ? 1 : 0, id]);
  }

  /** RN-31: sem validação, ordenada por nº de "também tenho" desc e depois pela mais antiga. */
  async filaSemValidacao(turmaIds: number[], limite = 50) {
    const rows = await select<FeedRaw>(
      `SELECT x.* FROM (${BASE}) x
       WHERE x.turma_id IN (?) AND x.oculta = 0 AND x.tem_validada = 0
       ORDER BY x.total_tambem_tenho DESC, x.criado_em ASC LIMIT ?`,
      [ids(turmaIds), limite],
    );
    return rows.map(comStatus);
  }

  /** RN-26: temperatura = perguntas + "também tenho" no período, por disciplina. */
  temperaturaPorMateria(turmaIds: number[], desde: Date) {
    return select<TemperaturaMateria>(
      `SELECT m.id AS materia_id, m.nome AS materia_nome,
         (SELECT COUNT(*) FROM perguntas p
           WHERE p.materia_id = m.id AND p.turma_id IN (?) AND p.oculta = 0 AND p.criado_em >= ?) AS perguntas,
         (SELECT COUNT(*) FROM tambemtenho t JOIN perguntas p ON p.id = t.pergunta_id
           WHERE p.materia_id = m.id AND p.turma_id IN (?) AND p.oculta = 0 AND t.criado_em >= ?) AS tambem_tenho
       FROM materias m ORDER BY m.nome`,
      [ids(turmaIds), desde, ids(turmaIds), desde],
    );
  }

  /** RN-33: tempo médio (min) entre publicar e validar. */
  async tempoMedioAteValidacaoMin(turmaIds: number[], desde: Date) {
    const r = await selectOne<{ media: string | null }>(
      `SELECT AVG(TIMESTAMPDIFF(MINUTE, p.criado_em, r.validada_em)) AS media
       FROM respostas r JOIN perguntas p ON p.id = r.pergunta_id
       WHERE r.validada = 1 AND p.turma_id IN (?) AND p.criado_em >= ?`,
      [ids(turmaIds), desde],
    );
    return r?.media != null ? Number(r.media) : null;
  }
}