import { NextFunction, Request, RequestHandler, Response } from "express";
import { Perfil } from "./types/auth";

/** Fábrica base: libera a rota apenas para os perfis informados. Use sempre depois do authGuard. */
export function permitirPerfis(...perfis: Perfil[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ erro: "Autenticação necessária." });
      return;
    }
    if (!perfis.includes(req.usuario.perfil)) {
      res.status(403).json({ erro: "Você não tem permissão para esta ação." });
      return;
    }
    next();
  };
}

/** RN-17: validar resposta. */
export const professorOuMonitor = permitirPerfis("professor", "monitor");

/** RN-20, RN-15/UC-15, UC-17, UC-18: retirar validação, moderar, promover Monitor, gerar código. */
export const apenasProfessor = permitirPerfis("professor");

/**
 * RN-30 / UC-16: Professor vê o painel completo; Monitor só a fila das próprias perguntas.
 * O middleware só marca o escopo; o filtro real fica no service/repository.
 */
export const escopoPainel: RequestHandler = (req, res, next) => {
  const perfil = req.usuario?.perfil;
  if (perfil === "professor") req.escopoFila = "completo";
  else if (perfil === "monitor") req.escopoFila = "proprio";
  else {
    res.status(403).json({ erro: "Você não tem permissão para esta ação." });
    return;
  }
  next();
};
