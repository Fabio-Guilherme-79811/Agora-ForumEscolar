/** Voto "útil" e validação de respostas (UC-07, UC-13, UC-14). */
import { Router } from "express";
import { idDaRota, usuarioLogado } from "../middlewares/http";
import {
  apenasProfessor,
  professorOuMonitor,
} from "../middlewares/role.middleware";
import { autenticado, respostaService } from "./container";

export const respostasRoutes = Router();

respostasRoutes.post(
  "/respostas/:id/util",
  ...autenticado,
  async (req, res) => {
    const r = await respostaService.alternarVotoUtil(
      usuarioLogado(req),
      idDaRota(req.params["id"]),
    );
    res.json({ ativo: r.votado, total: r.total });
  },
);

/** RN-17: só Professor ou Monitor validam, no máximo 1 por pergunta. */
respostasRoutes.put(
  "/respostas/:id/validacao",
  ...autenticado,
  professorOuMonitor,
  async (req, res) => {
    await respostaService.validar(
      usuarioLogado(req),
      idDaRota(req.params["id"]),
    );
    res.json({ ok: true });
  },
);

/** RN-20: só o Professor retira a validação. */
respostasRoutes.delete(
  "/respostas/:id/validacao",
  ...autenticado,
  apenasProfessor,
  async (req, res) => {
    await respostaService.retirarValidacao(
      usuarioLogado(req),
      idDaRota(req.params["id"]),
    );
    res.json({ ok: true });
  },
);