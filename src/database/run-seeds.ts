import { seedUsuarios } from "./seeds/seed-usuarios";  
import { seedTurmasMaterias } from "./seeds/seed-turmas-materias";
import { seedPerguntasRespostas } from "./seeds/seed-perguntas-respostas";

async function runSeeds() {
  await seedUsuarios();
  await seedTurmasMaterias();
  await seedPerguntasRespostas();

  console.log("Todos os seeds foram executados com sucesso.");
  process.exit(0);
}

runSeeds().catch((erro) => {
  console.error("Erro ao rodar seeds:", erro);
  process.exit(1);
});