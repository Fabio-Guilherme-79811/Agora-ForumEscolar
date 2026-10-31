/** Landing, configurações e termômetro de dúvidas (UC-10, RN-26 a RN-29). */
import { Router } from "express";
import { usuarioDoToken } from "../middlewares/auth.middleware";
import { querJson, usuarioLogado } from "../middlewares/http";
import { itensTermometro } from "./apresentadores";
import { autenticado, termometroService } from "./container";

export const paginasRoutes = Router();

paginasRoutes.get("/", (req, res) => {
  if (usuarioDoToken(req)) {
    res.redirect("/perguntas");
    return;
  }
  res.render("pages/home/index");
});

paginasRoutes.get("/configuracoes", ...autenticado, (_req, res) => {
  res.render("pages/config/index");
});

/** Aluno e Monitor veem só os agregados; o Professor recebe os números detalhados (RN-29). */
paginasRoutes.get("/termometro", ...autenticado, async (req, res) => {
  const ator = usuarioLogado(req);
  const itens = itensTermometro(await termometroService.obter(ator));
  if (querJson(req)) {
    res.json({ itens });
    return;
  }
  res.render("pages/termometro/index", {
    itens,
    ehProfessor: ator.perfil === "professor",
  });
});