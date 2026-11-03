import bcrypt from "bcrypt";
import { Conexao } from "../config/conexao-database";

/** Senha de todos os usuários de demonstração. */
export const SENHA_DEMO = "senha123";

type Perfil = "aluno" | "monitor" | "professor";

/** [nome, e-mail, perfil]. A turma de cada aluno/monitor é definida em seed-turmas-materias.ts (RN-02). */
export const USUARIOS_DEMO: ReadonlyArray<readonly [string, string, Perfil]> = [
  // Os 4 primeiros mantêm a ordem original (ids 1 a 4).
  ["Ana Beatriz", "ana.aluna@agora.com", "aluno"],
  ["Carlos Souza", "carlos.aluno@agora.com", "aluno"],
  ["Fernanda Lima", "fernanda.monitora@agora.com", "monitor"],
  ["Prof. Ricardo", "ricardo.professor@agora.com", "professor"],
  // Professores
  ["Profa. Mariana Albuquerque", "mariana.professora@agora.com", "professor"],
  ["Prof. Paulo Henrique", "paulo.professor@agora.com", "professor"],
  // 2º Ano Informática A
  ["Davi Oliveira", "davi.aluno@agora.com", "aluno"],
  ["Eduarda Ramos", "eduarda.aluna@agora.com", "aluno"],
  ["Felipe Andrade", "felipe.aluno@agora.com", "aluno"],
  ["Gabriela Nunes", "gabriela.aluna@agora.com", "aluno"],
  ["Heitor Barbosa", "heitor.monitor@agora.com", "monitor"],
  // 2º Ano Informática B
  ["Isabela Torres", "isabela.aluna@agora.com", "aluno"],
  ["João Pedro Alves", "joao.aluno@agora.com", "aluno"],
  ["Larissa Cunha", "larissa.aluna@agora.com", "aluno"],
  ["Mateus Ferreira", "mateus.aluno@agora.com", "aluno"],
  ["Natália Rocha", "natalia.monitora@agora.com", "monitor"],
  // 1º Ano Administração A
  ["Otávio Mendes", "otavio.aluno@agora.com", "aluno"],
  ["Paula Moreira", "paula.aluna@agora.com", "aluno"],
  ["Rafael Duarte", "rafael.aluno@agora.com", "aluno"],
  ["Sofia Lacerda", "sofia.aluna@agora.com", "aluno"],
  ["Thiago Pires", "thiago.monitor@agora.com", "monitor"],
  // 3º Ano Logística A
  ["Vitória Araújo", "vitoria.aluna@agora.com", "aluno"],
  ["Wesley Macedo", "wesley.aluno@agora.com", "aluno"],
  ["Yasmin Teixeira", "yasmin.aluna@agora.com", "aluno"],
  ["Bruno Carvalho", "bruno.monitor@agora.com", "monitor"],
];

async function seedUsuarios() {
  const senhaHash = await bcrypt.hash(SENHA_DEMO, 10);
  const linhas = USUARIOS_DEMO.map(([nome, email, perfil]) => [
    nome,
    email,
    senhaHash,
    perfil,
  ]);

  await Conexao.obterPool().query(
    "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES ?",
    [linhas],
  );

  console.log(`Usuários de demonstração inseridos (${linhas.length}).`);
}

export { seedUsuarios };