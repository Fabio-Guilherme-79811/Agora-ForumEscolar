import { run, select, selectOne } from './DbConnection';
import type { IUsuarioRepository } from './interface/Iusuariosrepository';
import type { NovoUsuario, Perfil, UsuarioRow } from './Types';

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
    // RN-36: só nome e foto (senha tem método próprio)
    await run('UPDATE usuarios SET nome = COALESCE(?, nome), foto = COALESCE(?, foto) WHERE id = ?', [
      d.nome ?? null, d.foto ?? null, id,
    ]);
  }

  async atualizarSenha(id: number, senhaHash: string) {
    await run('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senhaHash, id]);
  }

  async atualizarPerfilAcesso(id: number, perfil: Perfil) {
    await run('UPDATE usuarios SET perfil = ? WHERE id = ?', [perfil, id]);
  }

  /** RN-09: incrementa falhas e, ao atingir o limite, bloqueia por N minutos (tudo em 1 UPDATE atômico). */
  async registrarFalhaLogin(id: number, max: number, minutos: number) {
    await run(
      `UPDATE usuarios SET
         tentativas_login = tentativas_login + 1,
         bloqueado_ate = IF(tentativas_login + 1 >= ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), bloqueado_ate)
       WHERE id = ?`,
      [max, minutos, id],
    );
  }

  async zerarFalhasLogin(id: number) {
    await run('UPDATE usuarios SET tentativas_login = 0, bloqueado_ate = NULL WHERE id = ?', [id]);
  }
}