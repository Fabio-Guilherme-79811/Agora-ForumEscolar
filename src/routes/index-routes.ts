/** Agrega as rotas do MVP. A ordem importa onde há rotas dinâmicas (resolvido dentro de cada arquivo). */
import { Router } from "express";
import { adminRoutes } from "./admin.routes";
import { authRoutes } from "./auth.routes";
import { disciplinasRoutes } from "./disciplinas.routes";
import { paginasRoutes } from "./paginas.routes";
import { perguntasRoutes } from "./perguntas.routes";
import { respostasRoutes } from "./respostas.routes";

const router = Router();

router.use(paginasRoutes);
router.use(authRoutes);
router.use(perguntasRoutes);
router.use(respostasRoutes);
router.use(disciplinasRoutes);
router.use(adminRoutes);

export default router;