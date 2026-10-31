/** Painel do professor/monitor (UC-16 a UC-19): fila, indicadores, membros, monitores e código da turma. */
import { Router } from "express";
import { idDaRota, inteiro, usuarioLogado } from "../middlewares/http";
import { apenasProfessor, escopoPainel } from "../middlewares/role.middleware";
import { ErroDeNaoEncontrado } from "../services/erros.service";
import {
  cartaoPergunta,
  indicadoresDoPainel,
  rotuloPerfil,
} from "./apresentadores";
import {
  autenticado,
  indicadoresService,
  turmaService,
  usuarioService,
} from "./container";

export const adminRoutes = Router();

/** ?turma=<id> escolhe a turma do professor (padrão: a primeira). Monitor vê só as próprias perguntas em aberto (RN-30). */
adminRoutes.get("/admin", ...autenticado, escopoPainel, async (req, res) => {
  const ator = usuarioLogado(req);
  if (req.escopoFila === "proprio") {
    const fila = await indicadoresService.filaDeValidacao(ator);
    res.render("pages/admin/painel", {
      visao: "monitor",
      perguntas: fila.map(cartaoPergunta),
    });
    return;
  }
  const turma = await turmaService.obterTurmaDoPainel(
    ator,
    inteiro(req.query["turma"]),
  );
  const [fila, indicadores, membros] = await Promise.all([
    indicadoresService.filaDeValidacao(ator),
    indicadoresService.obter(ator),
    turma ? usuarioService.listarMembros(ator, turma.id) : Promise.resolve([]),
  ]);
  res.render("pages/admin/painel", {
    visao: "professor",
    perguntas: fila
      .filter((p) => !turma || p.turma_id === turma.id)
      .map(cartaoPergunta),
    indicadores: indicadoresDoPainel(indicadores),
    membros: membros.map((m) => ({
      id: m.id,
      nome: m.nome,
      perfil: rotuloPerfil(m.perfil),
    })),
    codigoTurma: turma?.codigo ?? "",
  });
});

adminRoutes.put(
  "/admin/monitores/:id",
  ...autenticado,
  apenasProfessor,
  async (req, res) => {
    await usuarioService.promoverAMonitor(
      usuarioLogado(req),
      idDaRota(req.params["id"]),
    );
    res.json({ ok: true });
  },
);

adminRoutes.delete(
  "/admin/monitores/:id",
  ...autenticado,
  apenasProfessor,
  async (req, res) => {
    await usuarioService.rebaixarParaAluno(
      usuarioLogado(req),
      idDaRota(req.params["id"]),
    );
    res.json({ ok: true });
  },
);

adminRoutes.post(
  "/admin/turma/codigo",
  ...autenticado,
  apenasProfessor,
  async (req, res) => {
    const ator = usuarioLogado(req);
    const pedida =
      inteiro(req.query["turma"]) ??
      inteiro(typeof req.body?.turma === "string" ? req.body.turma : undefined);
    const turma = await turmaService.obterTurmaDoPainel(ator, pedida);
    if (!turma) throw new ErroDeNaoEncontrado("Nenhuma turma encontrada.");
    const { codigo } = await turmaService.gerarCodigo(ator, turma.id);
    res.json({ codigo });
  },
);