/**
 * Perguntas: publicar (RN-21, RN-24), perguntas parecidas (RN-23), feed (RN-10, RN-11, RN-13),
 * editar/excluir (RN-25) e marcar como resolvida (RN-19). A ordenação do feed e a busca ficam no repository.
 */
import {
  ErroDePermissao,
  ErroDeRegraDeNegocio,
  ErroDeValidacao,
} from "../entities/erros";
import { LIMITE_PERGUNTAS_POR_DIA, Pergunta } from "../entities/Perguntas";
import type {
  FiltroPerguntas,
  MateriaRow,
  PerguntaFeed,
  StatusPergunta,
} from "../entities/models/Types";
import type { IMateriaRepository } from "../entities/models/interface/Imaterialrepository";
import type { IPerguntaRepository } from "../entities/models/interface/Iperguntarepository";
import { AcessoTurmaService } from "./acesso-turma.service";
import { ErroDeNaoEncontrado } from "./erros.service";
import { perguntaDeFeed } from "./mapeadores.service";
import { Ator, exigir } from "./tipos.service";

export interface NovaPerguntaDto {
  titulo: string;
  descricao: string;
  materiaId: number;
  anexo?: string | null | undefined;
}

export interface EdicaoPerguntaDto {
  titulo?: string | undefined;
  descricao?: string | undefined;
  materiaId?: number | undefined;
  /** null remove o anexo. */
  anexo?: string | null | undefined;
}

export interface FiltrosFeed {
  materiaId?: number | undefined;
  status?: StatusPergunta | undefined;
  minhas?: boolean | undefined;
  busca?: string | undefined;
  limite?: number | undefined;
  offset?: number | undefined;
}

export class PerguntaService {
  constructor(
    private readonly perguntaRepo: IPerguntaRepository,
    private readonly materiaRepo: IMateriaRepository,
    private readonly acesso: AcessoTurmaService,
  ) {}

  /** Aluno/monitor: a própria turma. Professor: precisa informar qual das suas turmas. */
  private async turmaDeAtuacao(
    ator: Ator,
    turmaInformada?: number,
  ): Promise<number> {
    const turmaId =
      ator.perfil === "professor"
        ? turmaInformada
        : (ator.turma_id ?? undefined);
    if (turmaId === undefined) throw new ErroDeValidacao(["Informe a turma."]);
    await this.acesso.garantirAcesso(ator, turmaId); // RN-02
    return turmaId;
  }

  /** Matérias das turmas que o usuário enxerga (RN-02, RN-04). */
  async listarMaterias(ator: Ator): Promise<MateriaRow[]> {
    return this.materiaRepo.listar(await this.acesso.turmasVisiveis(ator));
  }

  /** Matérias com a contagem de dúvidas abertas (perguntas sem resposta validada). */
  async listarDisciplinas(
    ator: Ator,
  ): Promise<Array<{ id: number; nome: string; totalAbertas: number }>> {
    const turmaIds = await this.acesso.turmasVisiveis(ator);
    if (turmaIds.length === 0) return [];
    const [materias, abertas] = await Promise.all([
      this.materiaRepo.listar(turmaIds),
      this.perguntaRepo.filaSemValidacao(turmaIds, 500),
    ]);
    return materias.map((m) => ({
      id: m.id,
      nome: m.nome,
      totalAbertas: abertas.filter((p) => p.materia_id === m.id).length,
    }));
  }

  async publicar(ator: Ator, dto: NovaPerguntaDto): Promise<PerguntaFeed> {
    // a turma da pergunta é a da matéria escolhida; o usuário precisa ter acesso a ela (RN-02)
    const materia = exigir(
      await this.materiaRepo.buscarPorId(dto.materiaId),
      "Matéria não encontrada.",
    );
    await this.acesso.garantirAcesso(ator, materia.turma_id);
    const turmaId = materia.turma_id;

    const entidade = new Pergunta({
      titulo: dto.titulo,
      descricao: dto.descricao,
      materiaId: dto.materiaId,
      turmaId,
      autorId: ator.id,
      anexoUrl: dto.anexo ?? null,
    });
    entidade.validar(); // RN-21

    // RN-24: antispam de 5 perguntas por dia (professor não é limitado)
    if (
      ator.perfil !== "professor" &&
      (await this.perguntaRepo.contarPublicadasHoje(ator.id)) >=
        LIMITE_PERGUNTAS_POR_DIA
    ) {
      throw new ErroDeRegraDeNegocio(
        `Você já publicou ${LIMITE_PERGUNTAS_POR_DIA} perguntas hoje. Tente novamente amanhã.`,
      );
    }

    const id = await this.perguntaRepo.criar({
      titulo: entidade.titulo,
      descricao: entidade.descricao,
      materia_id: dto.materiaId,
      turma_id: turmaId,
      autor_id: ator.id,
      anexo: dto.anexo ?? null,
    });
    return exigir(
      await this.perguntaRepo.buscarPorId(id),
      "Pergunta não encontrada.",
    );
  }

  /** RN-23: chamada enquanto o aluno digita o título. */
  async buscarSimilares(
    ator: Ator,
    titulo: string,
    turmaId?: number,
  ): Promise<PerguntaFeed[]> {
    return this.perguntaRepo.buscarSimilares(
      await this.turmaDeAtuacao(ator, turmaId),
      titulo,
    );
  }

  async listarFeed(
    ator: Ator,
    filtros: FiltrosFeed = {},
  ): Promise<PerguntaFeed[]> {
    const turmaIds = await this.acesso.turmasVisiveis(ator); // RN-02
    if (turmaIds.length === 0) return []; // IN () vazio é erro de SQL
    const filtro: FiltroPerguntas = {
      turmaIds,
      incluirOcultas: ator.perfil === "professor", // conteúdo denunciado só o professor enxerga
    };
    if (filtros.materiaId !== undefined) filtro.materiaId = filtros.materiaId;
    if (filtros.status !== undefined) filtro.status = filtros.status;
    if (filtros.minhas) filtro.autorId = ator.id;
    if (filtros.busca?.trim()) filtro.busca = filtros.busca;
    if (filtros.limite !== undefined) filtro.limite = filtros.limite;
    if (filtros.offset !== undefined) filtro.offset = filtros.offset;
    return this.perguntaRepo.listar(filtro);
  }

  async obter(ator: Ator, perguntaId: number): Promise<PerguntaFeed> {
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

  /** RN-25: o autor edita enquanto não houver respostas. */
  async editar(
    ator: Ator,
    perguntaId: number,
    dto: EdicaoPerguntaDto,
  ): Promise<PerguntaFeed> {
    const entidade = perguntaDeFeed(await this.obter(ator, perguntaId));
    if (!entidade.podeSerEditadaPor(ator.id)) {
      throw new ErroDePermissao(
        "A pergunta só pode ser editada pelo autor e enquanto não tiver respostas.",
      );
    }
    const campos: Parameters<IPerguntaRepository["atualizar"]>[1] = {};
    if (dto.titulo !== undefined) {
      entidade.titulo = dto.titulo;
      campos.titulo = entidade.titulo;
    }
    if (dto.descricao !== undefined) {
      entidade.descricao = dto.descricao;
      campos.descricao = entidade.descricao;
    }
    if (dto.materiaId !== undefined) {
      const materia = exigir(
        await this.materiaRepo.buscarPorId(dto.materiaId),
        "Matéria não encontrada.",
      );
      if (materia.turma_id !== entidade.turmaId) {
        throw new ErroDeRegraDeNegocio(
          "A matéria escolhida não pertence à turma desta pergunta.",
        );
      }
      entidade.materiaId = dto.materiaId;
      campos.materia_id = dto.materiaId;
    }
    if (dto.anexo !== undefined) {
      entidade.anexoUrl = dto.anexo;
      campos.anexo = dto.anexo;
    }
    entidade.validar();
    await this.perguntaRepo.atualizar(perguntaId, campos);
    return this.obter(ator, perguntaId);
  }

  async excluir(ator: Ator, perguntaId: number): Promise<void> {
    const entidade = perguntaDeFeed(await this.obter(ator, perguntaId));
    if (!entidade.podeSerEditadaPor(ator.id)) {
      throw new ErroDePermissao(
        "A pergunta só pode ser excluída pelo autor e enquanto não tiver respostas.",
      );
    }
    await this.perguntaRepo.excluir(perguntaId);
  }

  /** RN-19: selo de "resolvida" do autor, que não equivale à validação. */
  async marcarComoResolvida(
    ator: Ator,
    perguntaId: number,
  ): Promise<PerguntaFeed> {
    const entidade = perguntaDeFeed(await this.obter(ator, perguntaId));
    entidade.marcarComoResolvida(ator.id); // lança se não for o autor
    await this.perguntaRepo.marcarResolvida(perguntaId, true);
    return this.obter(ator, perguntaId);
  }
}