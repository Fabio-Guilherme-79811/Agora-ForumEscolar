/** Feed, nova pergunta, perguntas parecidas, tela da pergunta e "também tenho essa dúvida" (UC-03 a UC-06). */
import { unlink } from "node:fs/promises";
import { Router } from "express";
import type { Request, Response } from "express";
import {
  ErroDePermissao,
  ErroDeRegraDeNegocio,
  ErroDeValidacao,
} from "../entities/erros";
import type { StatusPergunta } from "../entities/models/Types";
import {
  idDaRota,
  inteiro,
  querJson,
  texto,
  usuarioLogado,
} from "../middlewares/http";
import { uploadAnexoPergunta } from "../middlewares/upload.middleware";
import { ErroDeNaoEncontrado } from "../services/erros.service";
import {
  cartaoPergunta,
  errosPorCampo,
  paginaPergunta,
  respostaDaTela,
} from "./apresentadores";
import {
  autenticado,
  duvidaService,
  perguntaService,
  respostaService,
} from "./container";

export const perguntasRoutes = Router();

const CAMPOS_PERGUNTA = ["titulo", "materia", "descricao", "anexo"] as const;
const STATUS_VALIDOS: readonly string[] = ["aberta", "respondida", "validada"]; // RN-11

function statusValido(valor: unknown): StatusPergunta | undefined {
  const t = texto(valor);
  return STATUS_VALIDOS.includes(t) ? (t as StatusPergunta) : undefined;
}

// ---- Feed (UC-04)
perguntasRoutes.get("/perguntas", ...autenticado, async (req, res) => {
  const ator = usuarioLogado(req);
  const q = texto(req.query["q"]);
  const materia = inteiro(req.query["materia"]);
  const status = statusValido(req.query["status"]);
  const minhas = req.query["minhas"] === "1";

  const [perguntas, materias] = await Promise.all([
    perguntaService.listarFeed(ator, {
      materiaId: materia,
      status,
      minhas,
      busca: q,
    }),
    perguntaService.listarMaterias(ator),
  ]);
  res.render("pages/perguntas/index", {
    materias: materias.map((m) => ({ id: m.id, nome: m.nome })),
    filtros: { q, materia: materia ?? "", status: status ?? "", minhas },
    perguntas: perguntas.map(cartaoPergunta),
  });
});

// ---- Nova pergunta (UC-03). /nova e /similares precisam vir antes de /:id.
perguntasRoutes.get("/perguntas/nova", ...autenticado, async (req, res) => {
  const materias = await perguntaService.listarMaterias(usuarioLogado(req));
  res.render("pages/perguntas/criar", {
    materias: materias.map((m) => ({ id: m.id, nome: m.nome })),
    valores: {
      titulo: "",
      materia: texto(req.query["materia"]),
      descricao: "",
      topico: "",
    },
  });
});

/** RN-23: sugestões enquanto o aluno digita o título (pergunta-fetch.js). */
perguntasRoutes.get(
  "/perguntas/similares",
  ...autenticado,
  async (req, res) => {
    const ator = usuarioLogado(req);
    const titulo = texto(req.query["titulo"]);
    const materiaId = inteiro(req.query["materia"]);
    const materias = await perguntaService.listarMaterias(ator);
    // a turma vem da matéria escolhida; sem matéria, só o aluno/monitor (que têm uma turma) recebe sugestões
    const turmaId =
      materias.find((m) => m.id === materiaId)?.turma_id ??
      (ator.perfil === "professor" ? undefined : (ator.turma_id ?? undefined));
    if (!titulo || turmaId === undefined) {
      res.json({ similares: [] });
      return;
    }
    const similares = await perguntaService.buscarSimilares(
      ator,
      titulo,
      turmaId,
    );
    res.json({
      similares: similares.map((p) => ({
        id: p.id,
        titulo: p.titulo,
        materia: p.materia_nome,
        totalTambemTenho: p.total_tambem_tenho,
      })),
    });
  },
);

async function falhaAoPublicar(
  req: Request,
  res: Response,
  erro: unknown,
  valores: Record<string, string>,
): Promise<void> {
  let status: number;
  let erros: Record<string, string> = {};
  let aviso = "";
  if (erro instanceof ErroDeValidacao) {
    status = 400;
    const r = errosPorCampo(erro.erros, CAMPOS_PERGUNTA);
    erros = r.campos;
    aviso = r.gerais.join(" ");
  } else if (erro instanceof ErroDeNaoEncontrado) {
    status = 400;
    erros = { materia: "Escolha a disciplina." };
  } else if (erro instanceof ErroDeRegraDeNegocio) {
    status = 409; // ex.: limite de 5 perguntas por dia (RN-24)
    aviso = erro.message;
  } else if (erro instanceof ErroDePermissao) {
    status = 403;
    aviso = erro.message;
  } else {
    throw erro;
  }
  if (querJson(req)) {
    const corpo: { erros?: Record<string, string>; erro?: string } = {};
    if (Object.keys(erros).length > 0) corpo.erros = erros;
    if (aviso || !corpo.erros)
      corpo.erro = aviso || "Não foi possível publicar a pergunta.";
    res.status(status).json(corpo);
    return;
  }
  const materias = await perguntaService.listarMaterias(usuarioLogado(req));
  res.status(status).render("pages/perguntas/criar", {
    materias: materias.map((m) => ({ id: m.id, nome: m.nome })),
    valores: { ...valores, topico: "" },
    erros,
    erro: aviso,
  });
}

perguntasRoutes.post(
  "/perguntas",
  ...autenticado,
  uploadAnexoPergunta,
  async (req, res) => {
    const ator = usuarioLogado(req);
    const valores = {
      titulo: texto(req.body?.titulo),
      materia: texto(req.body?.materia),
      descricao: texto(req.body?.descricao),
    };
    const arquivo = req.file;
    try {
      const criada = await perguntaService.publicar(ator, {
        titulo: valores.titulo,
        descricao: valores.descricao,
        materiaId: inteiro(valores.materia) ?? 0,
        anexo: arquivo ? `uploads/perguntas/${arquivo.filename}` : null,
      });
      const destino = `/perguntas/${criada.id}`;
      if (querJson(req)) res.status(201).json({ redirect: destino });
      else res.redirect(destino);
    } catch (erro) {
      if (arquivo) await unlink(arquivo.path).catch(() => undefined); // não deixa anexo órfão no disco
      await falhaAoPublicar(req, res, erro, valores);
    }
  },
);

// ---- Tela da pergunta (UC-05/06/07/13)
perguntasRoutes.get("/perguntas/:id", ...autenticado, async (req, res) => {
  const ator = usuarioLogado(req);
  const id = idDaRota(req.params["id"]);
  let pergunta;
  try {
    pergunta = await perguntaService.obter(ator, id);
  } catch (erro) {
    // pergunta de outra turma não revela que existe (RN-02)
    if (erro instanceof ErroDePermissao)
      throw new ErroDeNaoEncontrado("Pergunta não encontrada.");
    throw erro;
  }
  const respostas = await respostaService.listarPorPergunta(ator, id);
  const [jaMarcou, votos] = await Promise.all([
    duvidaService.jaMarcou(ator.id, id),
    respostaService.votosDoUsuario(
      ator.id,
      respostas.map((r) => r.id),
    ),
  ]);
  res.render("pages/perguntas/detalhes", {
    pergunta: paginaPergunta(pergunta, {
      ehAutor: pergunta.autor_id === ator.id,
      jaMarcou,
    }),
    respostas: respostas.map((r) => respostaDaTela(r, ator, votos.has(r.id))),
    podeValidar:
      (ator.perfil === "professor" || ator.perfil === "monitor") &&
      pergunta.tem_validada === 0, // RN-17
    podeRetirarValidacao: ator.perfil === "professor", // RN-20
  });
});

perguntasRoutes.post(
  "/perguntas/:id/tambem-tenho",
  ...autenticado,
  async (req, res) => {
    const r = await duvidaService.alternar(
      usuarioLogado(req),
      idDaRota(req.params["id"]),
    );
    res.json({ ativo: r.marcado, total: r.total, destaque: r.destaque });
  },
);

perguntasRoutes.post(
  "/perguntas/:id/respostas",
  ...autenticado,
  async (req, res) => {
    const ator = usuarioLogado(req);
    const id = idDaRota(req.params["id"]);
    try {
      const criada = await respostaService.publicar(
        ator,
        id,
        typeof req.body?.conteudo === "string" ? req.body.conteudo : "",
      );
      if (querJson(req)) res.status(201).json({ ok: true, id: criada.id });
      else res.redirect(`/perguntas/${id}`);
    } catch (erro) {
      if (!(erro instanceof ErroDeValidacao)) throw erro;
      if (querJson(req))
        res
          .status(400)
          .json({
            erros: { conteudo: erro.erros[0] ?? "Escreva a resposta." },
          });
      else res.redirect(`/perguntas/${id}`);
    }
  },
);