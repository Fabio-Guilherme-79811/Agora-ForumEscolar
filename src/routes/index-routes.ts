// TEMPORÁRIO: rotas mínimas para visualizar as páginas. Substituir pelas rotas reais.
import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => res.render('pages/home/index'));
router.get('/login', (_req, res) => res.render('pages/auth/login'));
router.get('/cadastro', (_req, res) => res.render('pages/auth/cadastro'));

export default router;
