import type { ErrorRequestHandler, RequestHandler } from "express";
import { responderErro } from "./http";
import { mensagemDoErro, statusHttpDoErro } from "../services/erros.service";

export const rotaNaoEncontrada: RequestHandler = (req, res) => {
  responderErro(req, res, 404, "Página não encontrada.");
};

export const tratarErros: ErrorRequestHandler = (
  erro,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(erro);
    return;
  }

  const status = statusHttpDoErro(erro);
  if (status === 500) console.error("Erro não tratado na aplicação:", erro);
  responderErro(req, res, status, mensagemDoErro(erro));
};
