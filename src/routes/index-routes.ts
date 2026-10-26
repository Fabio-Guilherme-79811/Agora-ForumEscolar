// TEMPORÁRIO: rotas mínimas para visualizar as páginas. Substituir pelas rotas reais.
import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => res.render('pages/home/index'));
router.get('/login', (_req, res) => res.render('pages/auth/login'));
router.get('/cadastro', (_req, res) => res.render('pages/auth/cadastro'));
// * Dados para teste do front-end
router.get('/perguntas', (_req, res) =>
  res.render('pages/perguntas/index', {
    usuario: { nome: 'Ana Beatriz', perfil: 'Aluno' },
    materias: [
      { id: 1, nome: 'Banco de Dados' },
      { id: 2, nome: 'Programação' },
    ],
    filtros: {},
    perguntas: [
      {
        id: 1,
        titulo: 'Qual a diferença entre INNER JOIN e LEFT JOIN?',
        materia: 'Banco de Dados',
        autor: 'Ana Beatriz',
        criadaEm: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalRespostas: 0,
        totalTambemTenho: 5,
        status: 'Aberta',
        destaque: true,
      },
      {
        id: 2,
        titulo: 'Como funciona o async/await no Node?',
        materia: 'Programação',
        autor: 'João Pedro',
        criadaEm: new Date(Date.now() - 26 * 60 * 60 * 1000),
        totalRespostas: 3,
        totalTambemTenho: 1,
        status: 'Validada',
        destaque: false,
      },
    ],
  })
);

// * MOCK: Uso simplesmente temporário de teste para o front-end

const usuarioMock = { nome: 'Ana Beatriz', perfil: 'Aluno' };
const disciplinasMock = [
  { id: 1, nome: 'Banco de Dados', totalTopicos: 2, totalAbertas: 7 },
  { id: 2, nome: 'Programação', totalTopicos: 1, totalAbertas: 4 },
];
const topicosMock = [
  { id: 1, nome: 'JOINs', totalPerguntas: 5, totalAbertas: 3 },
  { id: 2, nome: 'Modelagem', totalPerguntas: 1, totalAbertas: 1 },
];
const perguntasMock = [
  {
    id: 1,
    titulo: 'Qual a diferença entre INNER JOIN e LEFT JOIN?',
    materia: 'Banco de Dados',
    autor: 'Ana Beatriz',
    criadaEm: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalRespostas: 0,
    totalTambemTenho: 5,
    status: 'Aberta',
    destaque: true,
  },
];

router.get('/disciplinas', (_req, res) =>
  res.render('pages/disciplinas/index', { usuario: usuarioMock, disciplinas: disciplinasMock })
);

router.get('/disciplinas/:id', (req, res) =>
  res.render('pages/disciplinas/detalhes', {
    usuario: usuarioMock,
    disciplina: disciplinasMock.find((d) => d.id === Number(req.params.id)) ?? disciplinasMock[0],
    topicos: topicosMock,
  })
);

router.get('/disciplinas/:id/topicos/:topicoId', (req, res) =>
  res.render('pages/disciplinas/topico', {
    usuario: usuarioMock,
    disciplina: disciplinasMock.find((d) => d.id === Number(req.params.id)) ?? disciplinasMock[0],
    topico: topicosMock.find((t) => t.id === Number(req.params.topicoId)) ?? topicosMock[0],
    perguntas: perguntasMock,
  })
);

export default router;
