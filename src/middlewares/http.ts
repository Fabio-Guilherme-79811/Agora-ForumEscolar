/** Utilitários HTTP compartilhados por rotas e middlewares: JSON x HTML, leitura segura de parâmetros, cookie de sessão e resposta de erro. */
import type { Request, Response } from "express";
import { EXPIRACAO_TOKEN_SEGUNDOS } from "../services/auth.service";
import {
  ErroDeAutenticacao,
  ErroDeNaoEncontrado,
} from "../services/erros.service";
import type { UsuarioAutenticado } from "./types/auth";

export const NOME_COOKIE = "token";

/** Chamadas de fetch() enviam Accept: application/json (main.js); navegação comum não. */
export function querJson(req: Request): boolean {
  return req.xhr || (req.get("Accept") ?? "").includes("application/json");
}

export function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Inteiro positivo ou undefined (query/params vêm sempre como texto). */
export function inteiro(valor: unknown): number | undefined {
  const t = typeof valor === "string" ? valor.trim() : "";
  if (!/^\d+$/.test(t)) return undefined;
  const n = Number(t);
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
}

/** Id de rota inválido (ex.: /perguntas/abc) é tratado como "não encontrado". */
export function idDaRota(valor: unknown): number {
  const n = inteiro(valor);
  if (n === undefined) throw new ErroDeNaoEncontrado("Recurso não encontrado.");
  return n;
}

/** Usuário já validado pelo authGuard e recarregado do banco pelo carregarUsuario. */
export function usuarioLogado(req: Request): UsuarioAutenticado {
  if (!req.usuario) throw new ErroDeAutenticacao();
  return req.usuario;
}

/** JWT em cookie httpOnly: nenhum script do navegador lê o token (main.js usa credentials: same-origin). */
export function gravarSessao(res: Response, token: string): void {
  res.cookie(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: EXPIRACAO_TOKEN_SEGUNDOS * 1000,
    path: "/",
  });
}

export function encerrarSessao(res: Response): void {
  res.clearCookie(NOME_COOKIE, { path: "/" });
}

/** JSON para fetch(); página de erro para navegação. Sem a view de erro, cai num texto simples. */
export function responderErro(
  req: Request,
  res: Response,
  status: number,
  mensagem: string,
): void {
  if (querJson(req)) {
    res.status(status).json({ erro: mensagem });
    return;
  }
  const pagina = status === 404 ? "errors/404" : "errors/500";
  res.status(status).render(pagina, { status, mensagem }, (falha, html) => {
    if (falha) res.type("text/plain").send(mensagem);
    else res.send(html);
  });
}