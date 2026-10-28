import { run, select, selectOne } from "./DbConnection";
import type { IMateriaRepository } from "./interface/Imaterialrepository";
import type { MateriaRow } from "./Types";

export class MateriaRepository implements IMateriaRepository {
  async criar(nome: string) {
    return (await run("INSERT INTO materias (nome) VALUES (?)", [nome]))
      .insertId;
  }
  buscarPorId(id: number) {
    return selectOne<MateriaRow>("SELECT * FROM materias WHERE id = ?", [id]);
  }
  listar() {
    return select<MateriaRow>("SELECT * FROM materias ORDER BY nome");
  }
}
