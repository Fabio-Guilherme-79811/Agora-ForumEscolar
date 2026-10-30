import { run, select, selectOne, withTransaction } from "./Dbconnection"
import type { IUsuarioRepository } from './interface/Iusuariosrepository';
import type { EstatisticasUsuario, NovoUsuario, Perfil, ResultadoFalhaLogin, UsuarioRow } from './Types';

export class UsuarioRepository implements IUsuarioRepository {
  async criar(d: NovoUsuario): Promise<number> {
    const r = await run(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil, turma_id) VALUES (?, ?, ?, ?, ?)',
      [d.nome, d.email.toLowerCase(), d.senha_hash, d.perfil ?? 'aluno', d.turma_id], // RN-08: padrão aluno
    );
    return r.insertId;
  }

  buscarPorId(id: number) {
    return selectOne<UsuarioRow>('SELECT * FROM usuarios WHERE id = ?', [id]);
  }

  buscarPorEmail(email: string) {
    return selectOne<UsuarioRow>('SELECT * FROM usuarios WHERE email = ?', [email.toLowerCase()]);
  }

  listarPorTurma(turmaId: number) {
    return select<UsuarioRow>('SELECT * FROM usuarios WHERE turma_id = ? ORDER BY nome', [turmaId]);
  }

  async atualizarPerfil(id: number, d: { nome?: string; foto?: string | null }) {
    // RN-36: só nome e foto (senha tem método próprio). Atualiza apenas as chaves informadas; foto: null remove a foto.
    const sets: string[] = [];
    const params: unknown[] = [];
    if (d.nome !== undefined) { sets.push('nome = ?'); params.push(d.nome); }
    if (d.foto !== undefined) { sets.push('foto = ?'); params.push(d.foto); }
    if (sets.length === 0) return;
    await run(`UPDATE usuarios SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  }

  async atualizarSenha(id: number, senhaHash: string) {
    await run('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senhaHash, id]);
  }

  async atualizarPerfilAcesso(id: number, perfil: Perfil) {
    await run('UPDATE usuarios SET perfil = ? WHERE id = ?', [perfil, id]);
  }

  /**
   * RN-09: conta a falha e bloqueia ao atingir o máximo. Se um bloqueio anterior já expirou, a contagem
   * recomeça do zero. Roda em transação com trava na linha para não perder falhas simultâneas.
   */
  async registrarFalhaLogin(id: number, max: number, minutos: number): Promise<ResultadoFalhaLogin> {
    return withTransaction(async (conn) => {
      const u = await selectOne<{ tentativas_login: number; bloqueado_ate: Date | null }>(
        'SELECT tentativas_login, bloqueado_ate FROM usuarios WHERE id = ? FOR UPDATE', [id], conn);
      if (!u) return { tentativas: 0, bloqueado: false };
      const expirado = u.bloqueado_ate !== null && u.bloqueado_ate.getTime() <= Date.now();
      const tentativas = (expirado ? 0 : u.tentativas_login) + 1;
      const bloqueado = tentativas >= max;
      await run(
        'UPDATE usuarios SET tentativas_login = ?, bloqueado_ate = ? WHERE id = ?',
        [tentativas, bloqueado ? new Date(Date.now() + minutos * 60_000) : null, id],
        conn,
      );
      return { tentativas, bloqueado };
    });
  }

  async zerarFalhasLogin(id: number) {
    await run('UPDATE usuarios SET tentativas_login = 0, bloqueado_ate = NULL WHERE id = ?', [id]);
  }

  async obterEstatisticas(id: number): Promise<EstatisticasUsuario> {
    const r = await selectOne<EstatisticasUsuario>(
      `SELECT
         (SELECT COUNT(*) FROM perguntas WHERE autor_id = ? AND oculta = 0) AS perguntas,
         (SELECT COUNT(*) FROM respostas WHERE autor_id = ? AND oculta = 0) AS respostas,
         (SELECT COUNT(*) FROM respostas WHERE autor_id = ? AND oculta = 0 AND validada = 1) AS respostas_validadas`,
      [id, id, id],
    );
    return r ?? { perguntas: 0, respostas: 0, respostas_validadas: 0 };
  }
}