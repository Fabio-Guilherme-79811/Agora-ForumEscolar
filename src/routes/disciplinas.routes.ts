/** Lista disciplinas disponíveis e abre o feed filtrado por disciplina. */
import { Router } from "express";
import { idDaRota, usuarioLogado } from "../middlewares/http";
import { ErroDeNaoEncontrado } from "../services/erros.service";
import { autenticado, perguntaService } from "./container";

export const disciplinasRoutes = Router();

disciplinasRoutes.get("/", ...autenticado, async (req, res) => {
  const disciplinas = await perguntaService.listarDisciplinas(usuarioLogado(req));
  res.render("pages/disciplinas/index", {
    disciplinas: disciplinas.map((disciplina) => ({
      ...disciplina,
      totalTopicos: 0,
    })),
  });
});

disciplinasRoutes.get("/:id", ...autenticado, async (req, res) => {
  const id = idDaRota(req.params["id"]);
  const disciplinas = await perguntaService.listarDisciplinas(usuarioLogado(req));
  if (!disciplinas.some((disciplina) => disciplina.id === id)) {
    throw new ErroDeNaoEncontrado("Disciplina não encontrada.");
  }
  res.redirect(`/perguntas?materia=${id}`);
});