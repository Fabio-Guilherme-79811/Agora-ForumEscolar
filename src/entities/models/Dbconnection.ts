import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '..';

/** Pool ou conexão de transação: os repositories aceitam ambos. */
export type Executor = Pick<PoolConnection, 'query'>;

export async function select<T>(sql: string, params: unknown[] = [], ex: Executor = pool): Promise<T[]> {
  const [rows] = await ex.query<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

export async function selectOne<T>(sql: string, params: unknown[] = [], ex: Executor = pool): Promise<T | null> {
  const rows = await select<T>(sql, params, ex);
  return rows[0] ?? null;
}

export async function run(sql: string, params: unknown[] = [], ex: Executor = pool): Promise<ResultSetHeader> {
  const [res] = await ex.query<ResultSetHeader>(sql, params);
  return res;
}

export function isDuplicateError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'ER_DUP_ENTRY';
}

/** Executa várias operações de forma atômica (commit/rollback automáticos). */
export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}