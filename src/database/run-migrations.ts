import fs from "fs";
import path from "path";
import { Conexao } from "./config/conexao-database"; 

async function runMigrations() {
  const dir = path.join(__dirname, "migrations");
  const arquivos = fs.readdirSync(dir).sort();

  for (const arquivo of arquivos) {
    const sql = fs.readFileSync(path.join(dir, arquivo), "utf-8");
    console.log(`Executando ${arquivo}...`);
    await Conexao.obterPool().query(sql); 
  }

  console.log("Todas as migrations foram executadas.");
  process.exit(0);
}

runMigrations().catch((erro) => {
  console.error("Erro ao rodar migrations:", erro);
  process.exit(1);
});