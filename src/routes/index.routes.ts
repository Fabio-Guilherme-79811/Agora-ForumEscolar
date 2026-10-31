import { Router } from "express";
import { adminRoutes } from "./admin.routes";
import { authRoutes } from "./auth.routes";
import { disciplinasRoutes } from "./disciplinas.routes";
import { paginasRoutes } from "./paginas.routes";
import { perguntasRoutes } from "./perguntas.routes";
import { respostasRoutes } from "./respostas.routes";

const routes = Router();

routes.use(authRoutes);
routes.use(paginasRoutes);
routes.use(perguntasRoutes);
routes.use(respostasRoutes);
routes.use(disciplinasRoutes);
routes.use(adminRoutes);

export default routes;
