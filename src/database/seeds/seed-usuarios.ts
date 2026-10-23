import bcrypt from "bcrypt";
import { Conexao } from "../config/conexao-database";

async function seedUsuarios() {
  const senhaHash = await bcrypt.hash("senha123", 10);

  await Conexao.obterPool().query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
      ('Ana Beatriz', 'ana.aluna@agora.com', ?, 'aluno'),
      ('Carlos Souza', 'carlos.aluno@agora.com', ?, 'aluno'),
      ('Fernanda Lima', 'fernanda.monitora@agora.com', ?, 'monitor'),
      ('Prof. Ricardo', 'ricardo.professor@agora.com', ?, 'professor'),
      ('Admin Sistema', 'admin@agora.com', ?, 'admin')`,
    [senhaHash, senhaHash, senhaHash, senhaHash, senhaHash]
  );

  console.log("Usuários de demonstração inseridos.");
}

export { seedUsuarios };