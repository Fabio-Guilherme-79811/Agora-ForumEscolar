import { Conexao } from "../config/conexao-database";

/** Atalhos: nome curto -> e-mail (iguais aos de seed-usuarios.ts). */
const E = {
  ana: "ana.aluna@agora.com",
  carlos: "carlos.aluno@agora.com",
  davi: "davi.aluno@agora.com",
  eduarda: "eduarda.aluna@agora.com",
  felipe: "felipe.aluno@agora.com",
  gabriela: "gabriela.aluna@agora.com",
  fernanda: "fernanda.monitora@agora.com",
  heitor: "heitor.monitor@agora.com",
  isabela: "isabela.aluna@agora.com",
  joao: "joao.aluno@agora.com",
  larissa: "larissa.aluna@agora.com",
  mateus: "mateus.aluno@agora.com",
  natalia: "natalia.monitora@agora.com",
  otavio: "otavio.aluno@agora.com",
  paula: "paula.aluna@agora.com",
  rafael: "rafael.aluno@agora.com",
  sofia: "sofia.aluna@agora.com",
  thiago: "thiago.monitor@agora.com",
  vitoria: "vitoria.aluna@agora.com",
  wesley: "wesley.aluno@agora.com",
  yasmin: "yasmin.aluna@agora.com",
  bruno: "bruno.monitor@agora.com",
  ricardo: "ricardo.professor@agora.com",
  mariana: "mariana.professora@agora.com",
  paulo: "paulo.professor@agora.com",
};

const haHoras = (horas: number): Date =>
  new Date(Date.now() - horas * 3_600_000);

interface PerguntaDemo {
  k: string;
  autor: string;
  turma: string; // código da turma
  materia: string;
  titulo: string;
  descricao: string;
  h: number; // criada há quantas horas
  resolvida?: boolean; // selo do autor (RN-19), não é validação
  oculta?: boolean; // 3 denúncias pendentes (RN-05)
}

interface RespostaDemo {
  k: string;
  p: string;
  autor: string;
  conteudo: string;
  h: number;
  validadaPor?: string; // professor ou monitor (RN-17)
  hValidada?: number;
  oculta?: boolean;
}

// As perguntas dos últimos 7 dias alimentam o termômetro: Banco de Dados fica Quente, Desenvolvimento Web Morno
// e Programação Orientada a Objetos Fria. A p3 tem 6 "também tenho" e nenhuma validada, então entra em destaque (RN-28).
const PERGUNTAS: PerguntaDemo[] = [
  {
    k: "p1",
    autor: E.ana,
    turma: "INFO2A",
    materia: "Banco de Dados",
    titulo: "Qual a diferença entre INNER JOIN e LEFT JOIN?",
    descricao:
      "Não entendi quando usar cada um. Alguém pode explicar com um exemplo prático?",
    h: 30,
  },
  {
    k: "p2",
    autor: E.carlos,
    turma: "INFO2A",
    materia: "Banco de Dados",
    titulo: "Quando usar GROUP BY e quando usar HAVING?",
    descricao:
      "Sempre erro quando tento filtrar com WHERE depois de agrupar. Qual a regra para escolher?",
    h: 52,
  },
  {
    k: "p3",
    autor: E.davi,
    turma: "INFO2A",
    materia: "Banco de Dados",
    titulo: "Como funciona uma chave estrangeira com ON DELETE CASCADE?",
    descricao:
      "Se eu apagar um registro da tabela pai, o que acontece com os filhos? Tenho medo de perder dados.",
    h: 76,
  },
  {
    k: "p4",
    autor: E.eduarda,
    turma: "INFO2A",
    materia: "Banco de Dados",
    titulo: "O que é normalização e até que forma normal devo ir?",
    descricao:
      "O professor falou em 1FN, 2FN e 3FN, mas não sei quando parar de dividir as tabelas.",
    h: 100,
  },
  {
    k: "p5",
    autor: E.felipe,
    turma: "INFO2A",
    materia: "Banco de Dados",
    titulo: "Qual a diferença entre DELETE, TRUNCATE e DROP?",
    descricao:
      "Preciso limpar uma tabela de testes e não sei qual comando é o mais seguro para usar.",
    h: 124,
    resolvida: true,
  },
  {
    k: "p6",
    autor: E.gabriela,
    turma: "INFO2A",
    materia: "Banco de Dados",
    titulo: "Como criar um índice para acelerar consultas com LIKE?",
    descricao:
      "Minha busca por nome está lenta com muitos registros. Índice resolve mesmo com LIKE '%texto%'?",
    h: 20,
  },
  {
    k: "p7",
    autor: E.carlos,
    turma: "INFO2A",
    materia: "Banco de Dados",
    titulo: "Como instalar o MySQL Workbench no Windows?",
    descricao:
      "Baixei o instalador mas ele pede vários componentes. Quais são realmente necessários para a aula?",
    h: 300,
  },
  {
    k: "p8",
    autor: E.ana,
    turma: "INFO2A",
    materia: "Desenvolvimento Web",
    titulo: "Como centralizar uma div na horizontal e na vertical?",
    descricao:
      "Tentei margin auto e text-align, mas a div continua no canto. Qual o jeito moderno de fazer?",
    h: 50,
  },
  {
    k: "p9",
    autor: E.carlos,
    turma: "INFO2A",
    materia: "Desenvolvimento Web",
    titulo: "Qual a diferença entre GET e POST em formulários?",
    descricao:
      "Meu formulário de login mostra a senha na URL. Isso é por causa do método que escolhi?",
    h: 28,
  },
  {
    k: "p10",
    autor: E.davi,
    turma: "INFO2A",
    materia: "Desenvolvimento Web",
    titulo: "Por que meu fetch retorna Unexpected token no JSON?",
    descricao:
      "O console mostra erro de JSON, mas a rota abre normal no navegador. O que pode estar acontecendo?",
    h: 6,
  },
  {
    k: "p11",
    autor: E.felipe,
    turma: "INFO2A",
    materia: "Programação Orientada a Objetos",
    titulo: "Qual a diferença entre classe abstrata e interface?",
    descricao:
      "Nos exemplos de TypeScript as duas parecem servir para a mesma coisa. Quando uso cada uma?",
    h: 70,
  },
  {
    k: "p12",
    autor: E.heitor,
    turma: "INFO2A",
    materia: "Redes de Computadores",
    titulo: "O que é DHCP e para que serve na rede da escola?",
    descricao:
      "Percebi que o notebook pega um IP sozinho ao conectar. Quem entrega esse endereço e como?",
    h: 220,
  },
  {
    k: "p13",
    autor: E.isabela,
    turma: "INFO2B",
    materia: "Algoritmos e Lógica",
    titulo: "Como funciona o laço for em JavaScript?",
    descricao:
      "Não entendi a ordem de execução entre inicialização, condição e incremento no meu exercício.",
    h: 40,
  },
  {
    k: "p14",
    autor: E.joao,
    turma: "INFO2B",
    materia: "Desenvolvimento Web",
    titulo: "Qual a diferença entre var, let e const?",
    descricao:
      "Meu código mudou de valor sozinho quando usei var dentro de um if. Como evitar isso?",
    h: 60,
  },
  {
    k: "p15",
    autor: E.larissa,
    turma: "INFO2B",
    materia: "Sistemas Operacionais",
    titulo: "O que faz o comando chmod no Linux?",
    descricao:
      "Recebi permission denied ao rodar meu script. Como o chmod resolve isso com segurança?",
    h: 18,
  },
  {
    k: "p16",
    autor: E.mateus,
    turma: "INFO2B",
    materia: "Sistemas Operacionais",
    titulo: "Como funciona o escalonamento Round Robin?",
    descricao:
      "Não consegui montar o diagrama de Gantt do exercício com quantum igual a 4. Pode mostrar o passo a passo?",
    h: 200,
  },
  {
    k: "p17",
    autor: E.otavio,
    turma: "ADM1A",
    materia: "Matemática Financeira",
    titulo: "Como calcular juros compostos mensais?",
    descricao:
      "Tenho um capital de R$ 1.000 com taxa de 2% ao mês. Qual a fórmula para o montante em 6 meses?",
    h: 56,
  },
  {
    k: "p18",
    autor: E.paula,
    turma: "ADM1A",
    materia: "Fundamentos de Administração",
    titulo: "Qual a diferença entre missão, visão e valores?",
    descricao:
      "Estou montando o plano da empresa fictícia e confundo os três conceitos. Pode dar exemplos?",
    h: 45,
  },
  {
    k: "p19",
    autor: E.rafael,
    turma: "ADM1A",
    materia: "Comunicação Empresarial",
    titulo: "Como escrever um e-mail formal para um fornecedor?",
    descricao:
      "Preciso pedir um orçamento e não sei como começar e terminar o e-mail de forma profissional.",
    h: 90,
    resolvida: true,
  },
  {
    k: "p20",
    autor: E.sofia,
    turma: "ADM1A",
    materia: "Fundamentos de Administração",
    titulo: "O que é capital de giro?",
    descricao:
      "Vi o termo no texto da aula, mas não entendi a diferença para capital fixo e investimento.",
    h: 12,
  },
  {
    k: "p21",
    autor: E.vitoria,
    turma: "LOG3A",
    materia: "Gestão de Estoques",
    titulo: "Como aplicar o método PEPS no controle de estoque?",
    descricao:
      "Preciso montar a ficha de estoque da atividade e não entendi qual lote sai primeiro na venda.",
    h: 66,
  },
  {
    k: "p22",
    autor: E.wesley,
    turma: "LOG3A",
    materia: "Transporte e Distribuição",
    titulo: "Qual a diferença entre frete CIF e FOB?",
    descricao:
      "No contrato de exemplo aparecem as duas siglas. Quem paga o transporte em cada caso?",
    h: 36,
  },
  {
    k: "p23",
    autor: E.yasmin,
    turma: "LOG3A",
    materia: "Legislação Aduaneira",
    titulo: "O que é o regime aduaneiro de drawback?",
    descricao:
      "Meu grupo vai apresentar sobre exportação e não ficou claro como o drawback reduz os custos.",
    h: 8,
  },
  {
    k: "p24",
    autor: E.wesley,
    turma: "LOG3A",
    materia: "Gestão de Estoques",
    titulo: "Alguém me passa o gabarito da prova de amanhã?",
    descricao:
      "Se alguém tiver as respostas da avaliação de estoques pode mandar por aqui, é urgente mesmo.",
    h: 4,
    oculta: true,
  },
];

// 10 respostas validadas (no máximo 1 por pergunta, RN-17), por professor ou monitor da própria turma.
const RESPOSTAS: RespostaDemo[] = [
  {
    k: "r1",
    p: "p1",
    autor: E.fernanda,
    conteudo:
      "INNER JOIN devolve apenas as linhas que têm correspondência nas duas tabelas. LEFT JOIN devolve todas as linhas da tabela da esquerda, mesmo sem correspondência na direita (os campos da direita vêm como NULL).",
    h: 28,
    validadaPor: E.ricardo,
    hValidada: 26,
  },
  {
    k: "r2",
    p: "p1",
    autor: E.carlos,
    conteudo:
      "Pensa assim: INNER é a interseção, LEFT é tudo da esquerda mais o que casar da direita.",
    h: 27,
  },
  {
    k: "r3",
    p: "p2",
    autor: E.fernanda,
    conteudo:
      "WHERE filtra linhas antes do agrupamento; HAVING filtra os grupos depois do GROUP BY, por exemplo HAVING COUNT(*) > 3.",
    h: 50,
  },
  {
    k: "r4",
    p: "p2",
    autor: E.heitor,
    conteudo:
      "Dica: se a condição usa uma função de agregação (COUNT, SUM, AVG), ela vai no HAVING.",
    h: 49,
  },
  {
    k: "r5",
    p: "p4",
    autor: E.carlos,
    conteudo:
      "Na prática, a 3FN costuma bastar: cada coluna depende só da chave primária, sem repetir dados em várias linhas.",
    h: 96,
    validadaPor: E.ricardo,
    hValidada: 90,
  },
  {
    k: "r6",
    p: "p4",
    autor: E.heitor,
    conteudo:
      "Normalizar demais pode gerar JOINs demais. Vá até a 3FN e só desnormalize se houver problema de desempenho.",
    h: 95,
  },
  {
    k: "r7",
    p: "p5",
    autor: E.gabriela,
    conteudo:
      "DELETE remove linhas (pode usar WHERE), TRUNCATE esvazia a tabela inteira e DROP apaga a tabela junto com a estrutura.",
    h: 120,
  },
  {
    k: "r8",
    p: "p5",
    autor: E.fernanda,
    conteudo:
      "Para tabela de testes, TRUNCATE é o mais rápido. Só evite em produção, porque não dá para desfazer.",
    h: 118,
  },
  {
    k: "r9",
    p: "p7",
    autor: E.fernanda,
    conteudo:
      "Para a aula basta marcar MySQL Server e MySQL Workbench. Os demais componentes são opcionais.",
    h: 296,
    validadaPor: E.ricardo,
    hValidada: 290,
  },
  {
    k: "r10",
    p: "p8",
    autor: E.carlos,
    conteudo:
      "Use display: flex no elemento pai com justify-content: center e align-items: center. Funciona nos dois eixos.",
    h: 48,
    validadaPor: E.fernanda,
    hValidada: 46,
  },
  {
    k: "r11",
    p: "p11",
    autor: E.ana,
    conteudo:
      "Classe abstrata pode ter implementação e estado; interface só descreve o contrato. Uma classe estende uma abstrata, mas pode implementar várias interfaces.",
    h: 66,
    validadaPor: E.heitor,
    hValidada: 64,
  },
  {
    k: "r12",
    p: "p12",
    autor: E.fernanda,
    conteudo:
      "O DHCP é um serviço do roteador que entrega IP, máscara e gateway automaticamente para quem se conecta à rede.",
    h: 216,
    validadaPor: E.ricardo,
    hValidada: 210,
  },
  {
    k: "r13",
    p: "p13",
    autor: E.joao,
    conteudo:
      "O for executa a inicialização uma vez, testa a condição antes de cada volta e roda o incremento no fim de cada volta.",
    h: 38,
  },
  {
    k: "r14",
    p: "p14",
    autor: E.natalia,
    conteudo:
      "var tem escopo de função e sofre hoisting; let e const têm escopo de bloco. Prefira const e use let só quando o valor mudar.",
    h: 58,
    validadaPor: E.ricardo,
    hValidada: 55,
  },
  {
    k: "r15",
    p: "p16",
    autor: E.isabela,
    conteudo:
      "Com quantum 4, cada processo roda até 4 unidades e volta para o fim da fila se não terminar. Vá desenhando a fila a cada rodada.",
    h: 196,
    validadaPor: E.natalia,
    hValidada: 190,
  },
  {
    k: "r16",
    p: "p17",
    autor: E.thiago,
    conteudo:
      "Montante = capital × (1 + taxa)^n. Aqui: 1000 × 1,02^6 ≈ R$ 1.126,16.",
    h: 54,
    validadaPor: E.mariana,
    hValidada: 50,
  },
  {
    k: "r17",
    p: "p18",
    autor: E.rafael,
    conteudo:
      "Missão é a razão de existir da empresa, visão é onde ela quer chegar e valores são os princípios que guiam as decisões.",
    h: 44,
  },
  {
    k: "r18",
    p: "p19",
    autor: E.thiago,
    conteudo:
      "Comece com Prezado(a) [nome], diga o objetivo no primeiro parágrafo e finalize com Atenciosamente e seus dados de contato.",
    h: 88,
  },
  {
    k: "r19",
    p: "p19",
    autor: E.sofia,
    conteudo:
      "Lembre de colocar um assunto claro no e-mail, como Solicitação de orçamento.",
    h: 86,
    oculta: true,
  },
  {
    k: "r20",
    p: "p21",
    autor: E.bruno,
    conteudo:
      "PEPS é primeiro a entrar, primeiro a sair: a venda sempre baixa o lote mais antigo, então o custo sai pelo preço da compra mais antiga.",
    h: 64,
    validadaPor: E.paulo,
    hValidada: 60,
  },
  {
    k: "r21",
    p: "p22",
    autor: E.yasmin,
    conteudo:
      "No CIF o vendedor paga e responde pelo frete até o destino; no FOB o comprador assume o transporte a partir do embarque.",
    h: 34,
  },
];

// Quem marcou "também tenho essa dúvida" (1 por usuário e pergunta; o autor nunca marca a própria, RN-15).
const TAMBEM_TENHO: Record<string, string[]> = {
  p2: [E.ana, E.davi],
  p3: [E.ana, E.carlos, E.eduarda, E.felipe, E.gabriela, E.heitor],
  p6: [E.ana, E.carlos, E.davi],
  p9: [E.ana, E.davi],
  p10: [E.ana],
  p11: [E.carlos],
  p15: [E.mateus, E.natalia],
  p20: [E.paula, E.rafael, E.thiago],
  p23: [E.vitoria, E.wesley],
};

// Quem marcou a resposta como "útil" (1 por usuário; ninguém vota na própria, RN-16).
const VOTOS_UTEIS: Record<string, string[]> = {
  r1: [E.davi, E.eduarda, E.felipe, E.gabriela, E.carlos],
  r2: [E.ana],
  r3: [E.ana, E.davi],
  r4: [E.ana],
  r5: [E.ana, E.davi, E.felipe, E.heitor],
  r6: [E.eduarda, E.carlos],
  r7: [E.carlos, E.felipe],
  r8: [E.ana, E.carlos, E.davi],
  r9: [E.ana],
  r10: [E.ana, E.davi, E.eduarda, E.felipe],
  r11: [E.carlos, E.davi],
  r12: [E.davi],
  r13: [E.isabela, E.larissa, E.mateus],
  r14: [E.joao, E.larissa],
  r15: [E.mateus, E.joao],
  r16: [E.otavio, E.paula, E.rafael],
  r17: [E.paula, E.sofia],
  r18: [E.rafael, E.otavio],
  r19: [E.rafael],
  r20: [E.vitoria, E.wesley, E.yasmin],
  r21: [E.wesley, E.bruno],
};

interface DenunciaDemo {
  tipo: "pergunta" | "resposta";
  alvo: string;
  por: string;
  motivo: string;
  h: number;
  revisao?: { decisao: "mantida" | "removida"; por: string; h: number };
}

const DENUNCIAS: DenunciaDemo[] = [
  // 3 denúncias pendentes: p24 fica oculta e aguarda o professor Paulo (RN-05)
  {
    tipo: "pergunta",
    alvo: "p24",
    por: E.vitoria,
    motivo: "Pedido de cola em avaliação",
    h: 3,
  },
  {
    tipo: "pergunta",
    alvo: "p24",
    por: E.yasmin,
    motivo: "Pedido de cola em avaliação",
    h: 3,
  },
  {
    tipo: "pergunta",
    alvo: "p24",
    por: E.thiago,
    motivo: "Incentiva fraude na prova",
    h: 2,
  },
  // revisada e mantida: a resposta continua visível
  {
    tipo: "resposta",
    alvo: "r2",
    por: E.davi,
    motivo: "Resposta informal demais",
    h: 26,
    revisao: { decisao: "mantida", por: E.ricardo, h: 20 },
  },
  // revisada e removida: a resposta continua oculta
  {
    tipo: "resposta",
    alvo: "r19",
    por: E.paula,
    motivo: "Conteúdo repetido e sem utilidade",
    h: 80,
    revisao: { decisao: "removida", por: E.mariana, h: 70 },
  },
];

function obter<T>(mapa: Map<string, T>, chave: string, o: string): T {
  const valor = mapa.get(chave);
  if (valor === undefined)
    throw new Error(`Seed: ${o} "${chave}" não encontrado(a).`);
  return valor;
}

async function seedPerguntasRespostas() {
  const pool = Conexao.obterPool();

  const [usuarios]: any = await pool.query("SELECT id, email FROM usuarios");
  const usuarioPorEmail = new Map<string, number>(
    usuarios.map((u: any) => [u.email, u.id]),
  );
  const usuario = (email: string) => obter(usuarioPorEmail, email, "usuário");

  const [materias]: any = await pool.query(
    "SELECT m.id, m.nome, m.turma_id, t.codigo FROM materias m JOIN turmas t ON t.id = m.turma_id",
  );
  const materiaPorChave = new Map<string, { id: number; turmaId: number }>(
    materias.map((m: any) => [
      `${m.codigo}|${m.nome}`,
      { id: m.id, turmaId: m.turma_id },
    ]),
  );

  // ---- Perguntas
  const perguntaId = new Map<string, number>();
  const horasDaPergunta = new Map<string, number>();
  for (const p of PERGUNTAS) {
    const materia = obter(
      materiaPorChave,
      `${p.turma}|${p.materia}`,
      "matéria",
    );
    const [r]: any = await pool.query(
      `INSERT INTO perguntas (titulo, descricao, autor_id, materia_id, turma_id, resolvida, oculta, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.titulo,
        p.descricao,
        usuario(p.autor),
        materia.id,
        materia.turmaId,
        p.resolvida ?? false,
        p.oculta ?? false,
        haHoras(p.h),
      ],
    );
    perguntaId.set(p.k, r.insertId);
    horasDaPergunta.set(p.k, p.h);
  }

  // ---- Respostas (a validação fica na própria resposta; a pergunta "validada" é calculada)
  const respostaId = new Map<string, number>();
  const horasDaResposta = new Map<string, number>();
  for (const r of RESPOSTAS) {
    const validada = r.validadaPor !== undefined;
    const [res]: any = await pool.query(
      `INSERT INTO respostas (conteudo, autor_id, pergunta_id, validada, validada_por, validada_em, oculta, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.conteudo,
        usuario(r.autor),
        obter(perguntaId, r.p, "pergunta"),
        validada,
        r.validadaPor ? usuario(r.validadaPor) : null,
        validada ? haHoras(r.hValidada ?? r.h) : null,
        r.oculta ?? false,
        haHoras(r.h),
      ],
    );
    respostaId.set(r.k, res.insertId);
    horasDaResposta.set(r.k, r.h);
  }

  // ---- "Também tenho essa dúvida"
  const marcacoes: Array<[number, number, Date]> = [];
  for (const [p, quem] of Object.entries(TAMBEM_TENHO)) {
    const horas = Math.max(1, obter(horasDaPergunta, p, "pergunta") - 2);
    for (const email of quem)
      marcacoes.push([
        usuario(email),
        obter(perguntaId, p, "pergunta"),
        haHoras(horas),
      ]);
  }
  await pool.query(
    "INSERT INTO tambemtenho (usuario_id, pergunta_id, criado_em) VALUES ?",
    [marcacoes],
  );

  // ---- Votos "útil"
  const votos: Array<[number, number, Date]> = [];
  for (const [r, quem] of Object.entries(VOTOS_UTEIS)) {
    const horas = Math.max(1, obter(horasDaResposta, r, "resposta") - 1);
    for (const email of quem)
      votos.push([
        usuario(email),
        obter(respostaId, r, "resposta"),
        haHoras(horas),
      ]);
  }
  await pool.query(
    "INSERT INTO votoutil (usuario_id, resposta_id, criado_em) VALUES ?",
    [votos],
  );

  // ---- Denúncias (pendente -> revisada, com decisão final mantida ou removida)
  const denuncias = DENUNCIAS.map((d) => {
    const alvo = obter(
      d.tipo === "pergunta" ? perguntaId : respostaId,
      d.alvo,
      d.tipo,
    );
    return [
      usuario(d.por),
      d.tipo,
      alvo,
      d.motivo,
      d.revisao ? "revisada" : "pendente",
      d.revisao ? d.revisao.decisao : null,
      d.revisao ? usuario(d.revisao.por) : null,
      d.revisao ? haHoras(d.revisao.h) : null,
      haHoras(d.h),
    ];
  });
  await pool.query(
    `INSERT INTO denuncia (denunciante_id, alvo_tipo, alvo_id, motivo, status, decisao, revisada_por, revisada_em, criado_em)
     VALUES ?`,
    [denuncias],
  );

  // ---- Pontuação (RN-35), calculada a partir dos eventos acima para ficar sempre coerente:
  // resposta +1, voto útil recebido +2, resposta validada +10
  await pool.query(
    `INSERT INTO registropontos (usuario_id, pontos, motivo, resposta_id, criado_em)
     SELECT autor_id, 1, 'resposta', id, criado_em FROM respostas`,
  );
  await pool.query(
    `INSERT INTO registropontos (usuario_id, pontos, motivo, resposta_id, criado_em)
     SELECT r.autor_id, 2, 'voto_util', r.id, v.criado_em
       FROM votoutil v JOIN respostas r ON r.id = v.resposta_id`,
  );
  await pool.query(
    `INSERT INTO registropontos (usuario_id, pontos, motivo, resposta_id, criado_em)
     SELECT autor_id, 10, 'validacao', id, validada_em FROM respostas WHERE validada = 1`,
  );

  console.log(
    `Perguntas (${PERGUNTAS.length}), respostas (${RESPOSTAS.length}), também tenho (${marcacoes.length}), ` +
      `votos úteis (${votos.length}), denúncias (${denuncias.length}) e pontuação inseridos.`,
  );
}

export { seedPerguntasRespostas };