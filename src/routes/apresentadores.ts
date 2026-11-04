/**
 * Apresentadores: única camada que traduz os dados do back-end (snake_case, perfis em minúsculas, status calculado)
 * para o formato que as views EJS e os *-fetch.js esperam (camelCase, rótulos 'Aluno', 'Validada'...).
 * Se uma view mudar de nome de campo, só este arquivo muda.
 */
import { LIMITE_TAMBEM_TENHO_DESTAQUE } from "../entities/Perguntas";
import type { PerguntaFeed, RespostaDetalhe } from "../entities/models/Types";
import type { UsuarioAutenticado } from "../middlewares/types/auth";
import type { Indicadores } from "../services/indicadores.service";
import type { ItemTermometro } from "../services/termometro.service";

export type RotuloPerfil = "Aluno" | "Monitor" | "Professor";
export type RotuloStatus = "Validada" | "Resolvida" | "Respondida" | "Aberta";

export function rotuloPerfil(
  perfil: UsuarioAutenticado["perfil"],
): RotuloPerfil {
  if (perfil === "professor") return "Professor";
  if (perfil === "monitor") return "Monitor";
  return "Aluno";
}

/** Validada vence Resolvida (RN-19: "resolvida" do autor não é validação), que vence Respondida e Aberta. */
export function rotuloStatus(
  p: Pick<PerguntaFeed, "tem_validada" | "resolvida" | "total_respostas">,
): RotuloStatus {
  if (p.tem_validada === 1) return "Validada";
  if (p.resolvida === 1) return "Resolvida";
  return p.total_respostas > 0 ? "Respondida" : "Aberta";
}

/** Caminho guardado no banco ("uploads/perguntas/x.png") vira URL da pasta public. */
export function caminhoAnexo(anexo: string | null): string {
  return anexo ? `/${anexo.replace(/^\/+/, "")}` : "";
}

function emDestaque(p: PerguntaFeed): boolean {
  return (
    p.tem_validada === 0 && p.total_tambem_tenho >= LIMITE_TAMBEM_TENHO_DESTAQUE
  ); // RN-28
}

/** components/pergunta-card.ejs (RN-12). */
export function cartaoPergunta(p: PerguntaFeed) {
  return {
    id: p.id,
    titulo: p.titulo,
    materia: p.materia_nome,
    autor: p.autor_nome,
    criadaEm: p.criado_em,
    totalRespostas: p.total_respostas,
    totalTambemTenho: p.total_tambem_tenho,
    status: rotuloStatus(p),
    destaque: emDestaque(p),
  };
}

/** pages/perguntas/detalhes.ejs: objeto `pergunta`. */
export function paginaPergunta(
  p: PerguntaFeed,
  extras: { ehAutor: boolean; jaMarcou: boolean },
) {
  return {
    ...cartaoPergunta(p),
    descricao: p.descricao,
    materiaId: p.materia_id,
    anexoUrl: caminhoAnexo(p.anexo),
    jaMarcou: extras.jaMarcou,
    ehAutor: extras.ehAutor,
  };
}

/** components/resposta-card.ejs. */
export function respostaDaTela(
  r: RespostaDetalhe,
  ator: UsuarioAutenticado,
  jaVotou: boolean,
) {
  return {
    id: r.id,
    conteudo: r.conteudo,
    autor: r.autor_nome,
    criadaEm: r.criado_em,
    totalUteis: r.total_uteis,
    jaVotou,
    ehMinha: r.autor_id === ator.id,
    validada: r.validada === 1,
    validadaPor: r.validador_nome ?? "",
  };
}

/** pages/admin/painel.ejs: objeto `indicadores` (RN-33). */
export function indicadoresDoPainel(i: Indicadores) {
  return {
    perguntasSemana: i.perguntasDaSemana,
    percentualValidadas: i.percentualValidadas,
    tempoMedioMinutos:
      i.tempoMedioAteValidacaoMin === null
        ? null
        : Number(i.tempoMedioAteValidacaoMin),
    topDisciplinas: i.topDisciplinasQuentes.map((d) => ({
      id: d.materiaId,
      nome: d.materia,
      total: d.temperatura,
    })),
  };
}

/** pages/termometro/index.ejs: Frio/Morno/Quente por disciplina (RN-26, RN-27). Só o professor recebe `detalhes` (RN-29). */
export function itensTermometro(itens: ItemTermometro[]) {
  const rotulos = { frio: "Frio", morno: "Morno", quente: "Quente" } as const;
  return itens.map((i) => ({
    id: i.materiaId,
    nome: i.materia,
    temperatura: i.temperatura,
    faixa: i.faixa,
    faixaRotulo: rotulos[i.faixa],
    ...(i.detalhes
      ? { perguntas: i.detalhes.perguntas, tambemTenho: i.detalhes.tambemTenho }
      : {}),
  }));
}

const PALAVRAS_DO_CAMPO: Array<[string, string[]]> = [
  ["titulo", ["título", "titulo"]],
  ["descricao", ["descrição", "descricao"]],
  ["materia", ["matéria", "materia", "disciplina"]],
  ["anexo", ["anexo", "arquivo"]],
  ["conteudo", ["conteúdo", "conteudo", "resposta"]],
  ["senha", ["senha"]],
  ["email", ["e-mail", "email"]],
  ["codigoTurma", ["código", "codigo", "turma"]],
  ["nome", ["nome"]],
];

/**
 * As entities lançam uma lista de mensagens sem dizer o campo. Aqui cada mensagem é ligada ao campo do formulário
 * pelas palavras-chave dela; o que não casar vai para `gerais` (aviso geral). `permitidos` limita aos campos do form.
 */
export function errosPorCampo(
  mensagens: string[],
  permitidos: readonly string[],
) {
  const campos: Record<string, string> = {};
  const gerais: string[] = [];
  for (const mensagem of mensagens) {
    const minuscula = mensagem.toLowerCase();
    const achado = PALAVRAS_DO_CAMPO.find(
      ([campo, palavras]) =>
        permitidos.includes(campo) &&
        palavras.some((p) => minuscula.includes(p)),
    );
    if (achado) campos[achado[0]] ??= mensagem;
    else gerais.push(mensagem);
  }
  return { campos, gerais };
}