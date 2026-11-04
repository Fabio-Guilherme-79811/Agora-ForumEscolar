import { Conexao } from "../config/conexao-database";

interface TurmaDemo {
  nome: string;
  anoLetivo: number;
  codigo: string;
  materias: string[];
  /** E-mails dos alunos e monitores que pertencem à turma. */
  membros: string[];
  /** E-mails dos professores que lecionam na turma (tabela professor_turma, RN-03). */
  professores: string[];
}

// Cada turma representa um curso técnico/módulo. A 1ª mantém o código INFO2A usado nos testes de cadastro.
export const TURMAS_DEMO: TurmaDemo[] = [
  {
    nome: "2º Ano Informática A",
    anoLetivo: 2026,
    codigo: "INFO2A",
    materias: [
      "Banco de Dados",
      "Desenvolvimento Web",
      "Programação Orientada a Objetos",
      "Redes de Computadores",
    ],
    membros: [
      "ana.aluna@agora.com",
      "carlos.aluno@agora.com",
      "davi.aluno@agora.com",
      "eduarda.aluna@agora.com",
      "felipe.aluno@agora.com",
      "gabriela.aluna@agora.com",
      "fernanda.monitora@agora.com",
      "heitor.monitor@agora.com",
    ],
    professores: [
      "ricardo.professor@agora.com",
      "mariana.professora@agora.com",
    ],
  },
  {
    nome: "2º Ano Informática B",
    anoLetivo: 2026,
    codigo: "INFO2B",
    materias: [
      "Algoritmos e Lógica",
      "Desenvolvimento Web",
      "Sistemas Operacionais",
    ],
    membros: [
      "isabela.aluna@agora.com",
      "joao.aluno@agora.com",
      "larissa.aluna@agora.com",
      "mateus.aluno@agora.com",
      "natalia.monitora@agora.com",
    ],
    professores: ["ricardo.professor@agora.com"],
  },
  {
    nome: "1º Ano Administração A",
    anoLetivo: 2026,
    codigo: "ADM1A",
    materias: [
      "Fundamentos de Administração",
      "Matemática Financeira",
      "Comunicação Empresarial",
    ],
    membros: [
      "otavio.aluno@agora.com",
      "paula.aluna@agora.com",
      "rafael.aluno@agora.com",
      "sofia.aluna@agora.com",
      "thiago.monitor@agora.com",
    ],
    professores: ["mariana.professora@agora.com", "paulo.professor@agora.com"],
  },
  {
    nome: "3º Ano Logística A",
    anoLetivo: 2026,
    codigo: "LOG3A",
    materias: [
      "Gestão de Estoques",
      "Transporte e Distribuição",
      "Legislação Aduaneira",
    ],
    membros: [
      "vitoria.aluna@agora.com",
      "wesley.aluno@agora.com",
      "yasmin.aluna@agora.com",
      "bruno.monitor@agora.com",
    ],
    professores: ["paulo.professor@agora.com"],
  },
];

async function seedTurmasMaterias() {
  const pool = Conexao.obterPool();
  const [usuarios]: any = await pool.query("SELECT id, email FROM usuarios");
  const idPorEmail = new Map<string, number>(
    usuarios.map((u: { id: number; email: string }) => [u.email, u.id]),
  );
  const idDe = (email: string): number => {
    const id = idPorEmail.get(email);
    if (id === undefined)
      throw new Error(`Seed: usuário ${email} não encontrado.`);
    return id;
  };

  let totalMaterias = 0;
  let totalVinculos = 0;

  for (const turma of TURMAS_DEMO) {
    const [resultado]: any = await pool.query(
      "INSERT INTO turmas (nome, ano_letivo, codigo) VALUES (?, ?, ?)",
      [turma.nome, turma.anoLetivo, turma.codigo],
    );
    const turmaId: number = resultado.insertId;

    await pool.query("INSERT INTO materias (nome, turma_id) VALUES ?", [
      turma.materias.map((nome) => [nome, turmaId]),
    ]);
    totalMaterias += turma.materias.length;

    // aluno e monitor pertencem à turma (RN-02); o professor entra pela tabela professor_turma
    await pool.query("UPDATE usuarios SET turma_id = ? WHERE id IN (?)", [
      turmaId,
      turma.membros.map(idDe),
    ]);

    await pool.query(
      "INSERT INTO professor_turma (usuario_id, turma_id) VALUES ?",
      [turma.professores.map((email) => [idDe(email), turmaId])],
    );
    totalVinculos += turma.professores.length;
  }

  console.log(
    `Turmas (${TURMAS_DEMO.length}), matérias (${totalMaterias}) e vínculos de professor (${totalVinculos}) inseridos.`,
  );
}

export { seedTurmasMaterias };