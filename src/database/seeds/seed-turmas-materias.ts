import { Conexao } from "../config/conexao-database"; 

async function seedTurmasMaterias() {
  const [resultadoTurma]: any = await Conexao.obterPool().query( 
    `INSERT INTO turmas (nome, ano_letivo, codigo) VALUES ('2º Ano Informática A', 2026, 'INFO2A')`
  );
  const turmaId = resultadoTurma.insertId;

  await Conexao.obterPool().query(
    `INSERT INTO materias (nome, turma_id) VALUES
      ('Banco de Dados', ?),
      ('Desenvolvimento Web', ?),
      ('Programação Orientada a Objetos', ?)`,
    [turmaId, turmaId, turmaId]
  );

  const [[professor]]: any = await Conexao.obterPool().query( 
    `SELECT id FROM usuarios WHERE email = 'ricardo.professor@agora.com'`
  );
  await Conexao.obterPool().query( 
    `INSERT INTO professor_turma (usuario_id, turma_id) VALUES (?, ?)`,
    [professor.id, turmaId]
  );

  console.log("Turma, matérias e vínculo de professor inseridos.");
}

export { seedTurmasMaterias };