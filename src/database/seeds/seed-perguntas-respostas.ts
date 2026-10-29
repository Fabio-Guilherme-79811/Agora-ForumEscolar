import { Conexao } from "../config/conexao-database";

async function seedPerguntasRespostas() {
  const pool = Conexao.obterPool();

  const [[aluno]]: any = await pool.query(
    `SELECT id, turma_id FROM usuarios WHERE email = 'ana.aluna@agora.com'`
  );
  const [[materiaBD]]: any = await pool.query(
    `SELECT id FROM materias WHERE nome = 'Banco de Dados'`
  );
  const [[monitor]]: any = await pool.query(
    `SELECT id FROM usuarios WHERE email = 'fernanda.monitora@agora.com'`
  );

  const [resultadoPergunta]: any = await pool.query(
    `INSERT INTO perguntas (titulo, descricao, autor_id, materia_id, turma_id) VALUES (?, ?, ?, ?, ?)`,
    [
      "Qual a diferença entre INNER JOIN e LEFT JOIN?",
      "Não entendi quando usar cada um. Alguém pode explicar com um exemplo prático?",
      aluno.id,
      materiaBD.id,
      aluno.turma_id,
    ]
  );
  const perguntaId = resultadoPergunta.insertId;

  // a validação fica na própria resposta (validada, validada_por, validada_em); a pergunta "validada" é calculada
  const [resultadoResposta]: any = await pool.query(
    `INSERT INTO respostas (conteudo, autor_id, pergunta_id, validada, validada_por, validada_em)
     VALUES (?, ?, ?, TRUE, ?, NOW())`,
    [
      "INNER JOIN retorna só as linhas que têm correspondência nas duas tabelas. LEFT JOIN retorna todas as linhas da tabela da esquerda, mesmo sem correspondência na direita.",
      monitor.id,
      perguntaId,
      monitor.id,
    ]
  );
  const respostaId = resultadoResposta.insertId;

  // pontuação (RN-35): resposta +1 e resposta validada +10
  await pool.query(
    `INSERT INTO registropontos (usuario_id, pontos, motivo, resposta_id) VALUES (?, 1, 'resposta', ?), (?, 10, 'validacao', ?)`,
    [monitor.id, respostaId, monitor.id, respostaId]
  );

  console.log("Pergunta e resposta de demonstração inseridas.");
}

export { seedPerguntasRespostas };