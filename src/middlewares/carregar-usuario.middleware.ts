/**
 * Roda DEPOIS do authGuard: busca o usuário no banco a cada requisição.
 * Assim o perfil é sempre o atual (promover/rebaixar Monitor vale na hora, sem novo login) e as views
 * recebem res.locals.usuario com o nome. Usuário apagado = sessão encerrada.
 */
import type { RequestHandler } from "express";
import type { IUsuarioRepository } from "../entities/models/interface/Iusuariosrepository";
import { rotuloPerfil } from "../routes/apresentadores";
import { encerrarSessao, querJson } from "./http";

export function criarCarregarUsuario(
  usuarioRepo: IUsuarioRepository,
): RequestHandler {
  return async (req, res, next) => {
    if (!req.usuario) {
      next();
      return;
    }
    const row = await usuarioRepo.buscarPorId(req.usuario.id);
    if (!row) {
      encerrarSessao(res);
      if (querJson(req)) res.status(401).json({ erro: "Sessão inválida." });
      else res.redirect("/login");
      return;
    }
    req.usuario = { id: row.id, perfil: row.perfil, turma_id: row.turma_id };
    res.locals["usuario"] = {
      id: row.id,
      nome: row.nome,
      perfil: rotuloPerfil(row.perfil),
    };
    next();
  };
}