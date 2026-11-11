import { NextFunction, Request, Response } from "express";
import { TokenExpiredError, verify } from "jsonwebtoken";
import { PERFIS, UsuarioAutenticado } from "./types/auth";

const NOME_COOKIE = "token";

function lerCookie(header: string | undefined, nome: string): string | null {
  if (!header) return null;
  for (const parte of header.split(";")) {
    const [chave, ...valor] = parte.trim().split("=");
    if (chave === nome) return decodeURIComponent(valor.join("="));
  }
  return null;
}

/** Aceita "Authorization: Bearer <token>" ou cookie httpOnly "token". */
export function extrairToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim() || null;
  return lerCookie(req.headers.cookie, NOME_COOKIE);
}

function payloadValido(p: unknown): p is UsuarioAutenticado {
  if (typeof p !== "object" || p === null) return false;
  const u = p as Record<string, unknown>;
  return (
    typeof u.id === "number" &&
    typeof u.perfil === "string" &&
    (PERFIS as readonly string[]).includes(u.perfil) &&
    (u.turma_id === null || typeof u.turma_id === "number")
  );
}

/** Lê o usuário do token SEM bloquear a requisição (usado na landing, login e cadastro). */
export function usuarioDoToken(req: Request): UsuarioAutenticado | null {
  const segredo = process.env.JWT_SECRET;
  const token = extrairToken(req);
  if (!segredo || !token) return null;
  try {
    const payload = verify(token, segredo, { algorithms: ["HS256"] });
    if (!payloadValido(payload)) return null;
    return {
      id: payload.id,
      perfil: payload.perfil,
      turma_id: payload.turma_id,
    };
  } catch {
    return null;
  }
}

function querJson(req: Request): boolean {
  return req.xhr || (req.get("Accept") ?? "").includes("application/json");
}

function negarAcesso(req: Request, res: Response, mensagem: string): void {
  if (querJson(req)) {
    res.status(401).json({ erro: mensagem });
    return;
  }
  res.redirect("/login"); // páginas EJS voltam ao login
}

/** RN-01: só autenticados acessam o fórum (não existe modo visitante). */
export function authGuard(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) {
    // erro de configuração do servidor, nunca do usuário
    next(new Error("JWT_SECRET não configurado"));
    return;
  }

  const token = extrairToken(req);
  if (!token) {
    negarAcesso(req, res, "Autenticação necessária.");
    return;
  }

  try {
    const payload = verify(token, segredo, { algorithms: ["HS256"] });
    if (!payloadValido(payload)) {
      negarAcesso(req, res, "Token inválido.");
      return;
    }
    req.usuario = {
      id: payload.id,
      perfil: payload.perfil,
      turma_id: payload.turma_id,
    };
    next();
  } catch (erro) {
    const msg =
      erro instanceof TokenExpiredError
        ? "Sessão expirada."
        : "Token inválido.";
    negarAcesso(req, res, msg);
  }
}