/** Converte linhas cruas do banco (snake_case, Types.ts) nas entities de domínio, para reaproveitar as regras delas. */
import { Pergunta } from "../entities/Perguntas";
import { Resposta } from "../entities/Respostas";
import { Usuario } from "../entities/Usuario";
import type {
  PerguntaFeed,
  RespostaRow,
  UsuarioRow,
} from "../entities/models/Types";

export function usuarioDeRow(r: UsuarioRow): Usuario {
  return new Usuario({
    id: r.id,
    nome: r.nome,
    email: r.email,
    senhaHash: r.senha_hash,
    perfil: r.perfil,
    turmaId: r.turma_id,
    fotoUrl: r.foto,
    tentativasLogin: r.tentativas_login,
    bloqueadoAte: r.bloqueado_ate,
    criadoEm: r.criado_em,
  });
}

export function perguntaDeFeed(p: PerguntaFeed): Pergunta {
  return new Pergunta({
    id: p.id,
    titulo: p.titulo,
    descricao: p.descricao,
    materiaId: p.materia_id,
    turmaId: p.turma_id,
    autorId: p.autor_id,
    anexoUrl: p.anexo,
    resolvidaPeloAutor: p.resolvida === 1,
    oculta: p.oculta === 1,
    criadoEm: p.criado_em,
    atualizadoEm: p.atualizado_em,
    totalRespostas: p.total_respostas,
    totalDuvidaCompartilhada: p.total_tambem_tenho,
    temRespostaValidada: p.tem_validada === 1,
  });
}

export function respostaDeRow(r: RespostaRow): Resposta {
  return new Resposta({
    id: r.id,
    perguntaId: r.pergunta_id,
    autorId: r.autor_id,
    conteudo: r.conteudo,
    validada: r.validada === 1,
    validadaPorId: r.validada_por,
    validadaEm: r.validada_em,
    oculta: r.oculta === 1,
    criadoEm: r.criado_em,
  });
}
