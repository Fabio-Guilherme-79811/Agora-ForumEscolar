/**
 * Configuração principal da aplicação Express.
 *
 * Este módulo é responsável por criar e configurar a instância
 * da aplicação, incluindo:
 *
 * - Configuração dos middlewares de leitura de JSON;
 * - Configuração de dados enviados por formulários;
 * - Disponibilização de arquivos estáticos da pasta public;
 * - Registro das rotas principais da aplicação;
 * - Tratamento de rota inexistente (404) e de erros.
 *
 * O servidor HTTP é iniciado separadamente no arquivo server.ts.
 */

/// <reference path="./middlewares/types/express.d.ts" />
import express, { Application } from "express";
import routes from "./routes/index.routes";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/erros.middleware";

/**
 * Instância principal da aplicação Express.
 */
const app: Application = express();

/**
 * Permite receber requisições com corpo em formato JSON.
 */
app.use(express.json());
//Vizualizar ejs//
app.set("view engine", "ejs");
app.set("views", "./src/views");
/**
 * Permite receber dados enviados por formulários HTML.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Disponibiliza arquivos estáticos da pasta public.
 *
 * Exemplo:
 * /css/style.css
 * /images/logo.png
 */
app.use(express.static("public"));

/**
 * Rotas do MVP (src/routes). Cada rota protegida usa `autenticado`, que valida o JWT
 * (cookie ou Bearer) e recarrega o usuário do banco para as views (`res.locals.usuario`).
 */
app.use("/", routes);

/** Rota inexistente (404) e tratamento central de erros: nunca expõe stack trace ao usuário. */
app.use(rotaNaoEncontrada);
app.use(tratarErros);

export default app;