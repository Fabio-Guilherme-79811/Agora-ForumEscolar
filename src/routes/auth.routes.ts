/** Login, cadastro e logout (UC-01, UC-02). Formulários comuns: o JWT vai num cookie httpOnly e o usuário é redirecionado. */
import { Router } from "express";
import { ErroDeRegraDeNegocio, ErroDeValidacao } from "../entities/erros";
import { usuarioDoToken } from "../middlewares/auth.middleware";
import { encerrarSessao, gravarSessao, texto } from "../middlewares/http";
import { ErroDeAutenticacao, ErroDeBloqueio } from "../services/erros.service";
import { errosPorCampo } from "./apresentadores";
import { authService } from "./container";

export const authRoutes = Router();

const CAMPOS_CADASTRO = ["nome", "email", "senha", "codigoTurma"] as const;

authRoutes.get("/login", (req, res) => {
  if (usuarioDoToken(req)) {
    res.redirect("/perguntas");
    return;
  }
  res.render("pages/auth/login");
});

authRoutes.post("/login", async (req, res) => {
  const email = texto(req.body?.email);
  const senha = typeof req.body?.senha === "string" ? req.body.senha : "";
  try {
    const { token } = await authService.login(email, senha);
    gravarSessao(res, token);
    res.redirect("/perguntas");
  } catch (erro) {
    if (!(erro instanceof ErroDeAutenticacao)) throw erro;
    // RN-09: bloqueio por 5 tentativas mostra aviso próprio na tela
    res
      .status(erro instanceof ErroDeBloqueio ? 429 : 401)
      .render("pages/auth/login", {
        erro: erro.message,
        bloqueado: erro instanceof ErroDeBloqueio,
        email,
      });
  }
});

authRoutes.get("/cadastro", (req, res) => {
  if (usuarioDoToken(req)) {
    res.redirect("/perguntas");
    return;
  }
  res.render("pages/auth/cadastro");
});

authRoutes.post("/cadastro", async (req, res) => {
  const valores = {
    nome: texto(req.body?.nome),
    email: texto(req.body?.email),
    codigoTurma: texto(req.body?.codigoTurma),
  };
  const senha = typeof req.body?.senha === "string" ? req.body.senha : "";
  try {
    // UC-01: cria a conta como Aluno e já autentica
    const { token } = await authService.cadastrar({ ...valores, senha });
    gravarSessao(res, token);
    res.redirect("/perguntas");
  } catch (erro) {
    const mensagens =
      erro instanceof ErroDeValidacao
        ? erro.erros
        : erro instanceof ErroDeRegraDeNegocio
          ? [erro.message]
          : null;
    if (!mensagens) throw erro;
    const { campos, gerais } = errosPorCampo(mensagens, CAMPOS_CADASTRO);
    res
      .status(erro instanceof ErroDeValidacao ? 400 : 409)
      .render("pages/auth/cadastro", {
        erros: campos,
        erro: gerais.join(" "),
        valores,
      });
  }
});

authRoutes.post("/logout", (_req, res) => {
  encerrarSessao(res); // o servidor é stateless: basta descartar o token
  res.redirect("/");
});