import { Conexao } from "../config/conexao-database"; 

async function seedPerguntasRespostas() {
  const [[aluno]]: any = await Conexao.obterPool().query( 
    `SELECT id FROM usuarios WHERE email = 'ana.aluna@agora.com'`
  );
  const [[materiaBD]]: any = await Conexao.obterPool().query( 
    `SELECT id FROM materias WHERE nome = 'Banco de Dados'`
  );

  const [resultadoPergunta]: any = await Conexao.obterPool().query( 
    `INSERT INTO perguntas (titulo, descricao, autor_id, materia_id) VALUES (?, ?, ?, ?)`,
    [
      "Qual a diferença entre INNER JOIN e LEFT JOIN?",
      "Não entendi quando usar cada um. Alguém pode explicar com um exemplo prático?",
      aluno.id,
      materiaBD.id,
    ]
  );
  const perguntaId = resultadoPergunta.insertId;

  const [[monitor]]: any = await Conexao.obterPool().query( 
    `SELECT id FROM usuarios WHERE email = 'fernanda.monitora@agora.com'`
  );

  await Conexao.obterPool().query( 
    `INSERT INTO respostas (conteudo, autor_id, pergunta_id, validada, validada_por) VALUES (?, ?, ?, ?, ?)`,
    [
      "INNER JOIN retorna só as linhas que têm correspondência nas duas tabelas. LEFT JOIN retorna todas as linhas da tabela da esquerda, mesmo sem correspondência na direita.",
      monitor.id,
      perguntaId,
      true,
      monitor.id,
    ]
  );

  await Conexao.obterPool().query( 
    `UPDATE perguntas SET validada = TRUE WHERE id = ?`,
    [perguntaId]
  );

  console.log("Pergunta e resposta de demonstração inseridas.");
}

export { seedPerguntasRespostas };