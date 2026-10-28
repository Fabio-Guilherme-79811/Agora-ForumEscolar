import { run, select, selectOne } from "./DbConnection";
import type { ITurmaRepository } from "./interface/Iturmarepository";
import type { TurmaRow } from "./Types";

export class TurmaRepository implements ITurmaRepository {
  async criar(nome: string, codigo: string) {
    return (
      await run("INSERT INTO turmas (nome, codigo) VALUES (?, ?)", [
        nome,
        codigo,
      ])
    ).insertId;
  }
  buscarPorId(id: number) {
    return selectOne<TurmaRow>("SELECT * FROM turmas WHERE id = ?", [id]);
  }
  buscarPorCodigo(codigo: string) {
    return selectOne<TurmaRow>("SELECT * FROM turmas WHERE codigo = ?", [
      codigo,
    ]);
  }
  async atualizarCodigo(id: number, novoCodigo: string) {
    await run("UPDATE turmas SET codigo = ? WHERE id = ?", [novoCodigo, id]);
  }
  listarPorProfessor(professorId: number) {
    return select<TurmaRow>(
      "SELECT t.* FROM turmas t JOIN professor_turma pt ON pt.turma_id = t.id WHERE pt.usuario_id = ? ORDER BY t.nome",
      [professorId],
    );
  }
}
