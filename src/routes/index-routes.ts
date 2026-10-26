// TEMPORÁRIO: rotas mínimas para visualizar as páginas. Substituir pelas rotas reais.
import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => res.render('pages/home/index'));
router.get('/login', (_req, res) => res.render('pages/auth/login'));
router.get('/cadastro', (_req, res) => res.render('pages/auth/cadastro'));
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

export default router;
