import 'dotenv/config';
import mysql, { Pool } from 'mysql2/promise';

export class Conexao {
  public static pool: Pool;

  static obterPool(): Pool {
    if (!Conexao.pool) {
      Conexao.pool = mysql.createPool({
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER ?? '',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? '',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    return Conexao.pool;
  }
}