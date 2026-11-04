/**
 * Respostas: publicar (RN-14), voto útil (RN-16), validar com no máximo 1 por pergunta (RN-17/18),
 * retirar validação só professor (RN-20) e pontuação associada (RN-35).
 */
import { ErroDePermissao, ErroDeRegraDeNegocio } from "../entities/erros";
import { Resposta } from "../entities/Respostas";
import { PERFIS_VALIDADORES } from "../entities/tipos";
import { VotoUtil } from "../entities/Votoutil";
import type {
  PerguntaFeed,
  RespostaDetalhe,
  RespostaRow,
} from "../entities/models/Types";
import type { IPerguntaRepository } from "../entities/models/interface/Iperguntarepository";
import type { IRespostaRepository } from "../entities/models/interface/Irespostarepository";
import type { IVotoUtilRepository } from "../entities/models/interface/Ivotoutilrepository";
import { AcessoTurmaService } from "./acesso-turma.service";
import { ErroDeNaoEncontrado } from "./erros.service";
import { respostaDeRow } from "./mapeadores.service";
import { PontuacaoService } from "./pontuacao.service";
import { Ator, exigir, exigirProfessor } from "./tipos.service";

export class RespostaService {
  constructor(
    private readonly respostaRepo: IRespostaRepository,
    private readonly perguntaRepo: IPerguntaRepository,
    private readonly votoRepo: IVotoUtilRepository,
    private readonly acesso: AcessoTurmaService,
    private readonly pontuacao: PontuacaoService,
  ) {}

  /** Carrega a pergunta, confere a turma (RN-02/RN-14) e esconde conteúdo oculto de quem não é professor. */
  private async perguntaAcessivel(
    ator: Ator,
    perguntaId: number,
  ): Promise<PerguntaFeed> {
    const pergunta = exigir(
      await this.perguntaRepo.buscarPorId(perguntaId),
      "Pergunta não encontrada.",
    );
    await this.acesso.garantirAcesso(ator, pergunta.turma_id);
    if (pergunta.oculta === 1 && ator.perfil !== "professor") {
      throw new ErroDeNaoEncontrado("Pergunta não encontrada.");
    }
    return pergunta;
  }

  private async respostaComPergunta(
    ator: Ator,
    respostaId: number,
  ): Promise<{ row: RespostaRow; pergunta: PerguntaFeed }> {
    const row = exigir(
      await this.respostaRepo.buscarPorId(respostaId),
      "Resposta não encontrada.",
    );
    if (row.oculta === 1 && ator.perfil !== "professor") {
      throw new ErroDeNaoEncontrado("Resposta não encontrada.");
    }
    return {
      row,
      pergunta: await this.perguntaAcessivel(ator, row.pergunta_id),
    };
  }

  /** RN-18: o repository já devolve a validada no topo, depois as mais úteis e mais antigas. */
  async listarPorPergunta(
    ator: Ator,
    perguntaId: number,
  ): Promise<RespostaDetalhe[]> {
    await this.perguntaAcessivel(ator, perguntaId);
    return this.respostaRepo.listarPorPergunta(perguntaId);
  }

  async votosDoUsuario(
    usuarioId: number,
    respostaIds: number[],
  ): Promise<Set<number>> {
    const votos = await Promise.all(
      respostaIds.map(async (respostaId) =>
        (await this.votoRepo.existe(usuarioId, respostaId))
          ? respostaId
          : null,
      ),
    );
    return new Set(votos.filter((id): id is number => id !== null));
  }

  async publicar(
    ator: Ator,
    perguntaId: number,
    conteudo: string,
  ): Promise<RespostaRow> {
    await this.perguntaAcessivel(ator, perguntaId);
    const entidade = new Resposta({ perguntaId, autorId: ator.id, conteudo });
    entidade.validar(); // resposta vazia não é enviada
    const id = await this.respostaRepo.criar(
      perguntaId,
      ator.id,
      entidade.conteudo,
    );
    await this.pontuacao.registrar(ator.id, "resposta", id); // +1
    return exigir(
      await this.respostaRepo.buscarPorId(id),
      "Resposta não encontrada.",
    );
  }

  /** RN-20: autor edita/apaga enquanto a resposta não estiver validada. */
  async editar(
    ator: Ator,
    respostaId: number,
    conteudo: string,
  ): Promise<RespostaRow> {
    const { row } = await this.respostaComPergunta(ator, respostaId);
    const entidade = respostaDeRow(row);
    if (!entidade.podeSerEditadaPor(ator.id)) {
      throw new ErroDePermissao(
        "Resposta validada, ou de outro autor, não pode ser editada.",
      );
    }
    entidade.conteudo = conteudo;
    entidade.validar();
    await this.respostaRepo.atualizarConteudo(respostaId, entidade.conteudo);
    return exigir(
      await this.respostaRepo.buscarPorId(respostaId),
      "Resposta não encontrada.",
    );
  }

  async excluir(ator: Ator, respostaId: number): Promise<void> {
    const { row } = await this.respostaComPergunta(ator, respostaId);
    if (!respostaDeRow(row).podeSerEditadaPor(ator.id)) {
      throw new ErroDePermissao(
        "Resposta validada, ou de outro autor, não pode ser apagada.",
      );
    }
    await this.respostaRepo.excluir(respostaId);
  }

  /** RN-16: 1 voto por usuário; repetir o voto desmarca; ninguém vota na própria resposta. */
  async alternarVotoUtil(
    ator: Ator,
    respostaId: number,
  ): Promise<{ votado: boolean; total: number }> {
    const { row } = await this.respostaComPergunta(ator, respostaId);

    let votado: boolean;
    if (await this.votoRepo.existe(ator.id, respostaId)) {
      await this.votoRepo.remover(ator.id, respostaId);
      votado = false;
    } else {
      VotoUtil.criar(ator.id, respostaId, row.autor_id); // lança se for o autor
      if (await this.votoRepo.adicionar(ator.id, respostaId)) {
        await this.pontuacao.registrar(row.autor_id, "voto_util", respostaId); // +2 ao autor
      }
      votado = true;
    }
    return { votado, total: await this.votoRepo.contarPorResposta(respostaId) };
  }

  /** RN-17/18: só Professor ou Monitor validam, no máximo 1 resposta validada por pergunta. */
  async validar(
    ator: Ator,
    respostaId: number,
    agora: Date = new Date(),
  ): Promise<RespostaRow> {
    if (!PERFIS_VALIDADORES.includes(ator.perfil)) {
      throw new ErroDePermissao(
        "Somente professor ou monitor podem validar uma resposta.",
      );
    }
    const { row } = await this.respostaComPergunta(ator, respostaId);
    respostaDeRow(row).validarPor(ator.id, ator.perfil, agora); // lança se já estiver validada

    // atômico no repository: false se a pergunta já tem outra resposta validada
    if (!(await this.respostaRepo.validar(respostaId, ator.id))) {
      throw new ErroDeRegraDeNegocio(
        "Esta pergunta já possui uma resposta validada.",
      );
    }
    await this.pontuacao.registrar(row.autor_id, "validacao", respostaId); // +10 ao autor
    return exigir(
      await this.respostaRepo.buscarPorId(respostaId),
      "Resposta não encontrada.",
    );
  }

  /** RN-20: ação exclusiva do professor. A pergunta volta ao estado "respondida". */
  async retirarValidacao(ator: Ator, respostaId: number): Promise<RespostaRow> {
    exigirProfessor(ator);
    const { row } = await this.respostaComPergunta(ator, respostaId);
    respostaDeRow(row).retirarValidacao(ator.perfil); // lança se não estiver validada
    await this.respostaRepo.retirarValidacao(respostaId);
    return exigir(
      await this.respostaRepo.buscarPorId(respostaId),
      "Resposta não encontrada.",
    );
  }
}
