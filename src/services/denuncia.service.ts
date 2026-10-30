/** Moderação: denunciar, ocultar ao atingir 3 denúncias (RN-05) e fila de revisão do professor (UC-15). */
import { Denuncia, DecisaoDenuncia } from "../entities/Denuncia";
import { ErroDeRegraDeNegocio } from "../entities/erros";
import type { DenunciaRow, PerguntaFeed } from "../entities/models/Types";
import type {
  AlvoDenuncia,
  IDenunciaRepository,
} from "../entities/models/interface/Idenunciarepository";
import type { IPerguntaRepository } from "../entities/models/interface/Iperguntarepository";
import type { IRespostaRepository } from "../entities/models/interface/Irespostarepository";
import { AcessoTurmaService } from "./acesso-turma.service";
import { Ator, exigir, exigirProfessor } from "./tipos.service";

export interface ItemFilaModeracao {
  tipoAlvo: AlvoDenuncia;
  alvoId: number;
  totalDenuncias: number;
  motivos: string[];
}

export class DenunciaService {
  constructor(
    private readonly denunciaRepo: IDenunciaRepository,
    private readonly perguntaRepo: IPerguntaRepository,
    private readonly respostaRepo: IRespostaRepository,
    private readonly acesso: AcessoTurmaService,
  ) {}

  /** Devolve a pergunta do alvo (para validar a turma, RN-02), seja ele uma pergunta ou uma resposta. */
  private async perguntaDoAlvo(
    tipo: AlvoDenuncia,
    alvoId: number,
  ): Promise<PerguntaFeed> {
    if (tipo === "pergunta") {
      return exigir(
        await this.perguntaRepo.buscarPorId(alvoId),
        "Pergunta não encontrada.",
      );
    }
    const resposta = exigir(
      await this.respostaRepo.buscarPorId(alvoId),
      "Resposta não encontrada.",
    );
    return exigir(
      await this.perguntaRepo.buscarPorId(resposta.pergunta_id),
      "Pergunta não encontrada.",
    );
  }

  private definirOculta(
    tipo: AlvoDenuncia,
    alvoId: number,
    oculta: boolean,
  ): Promise<void> {
    return tipo === "pergunta"
      ? this.perguntaRepo.definirOculta(alvoId, oculta)
      : this.respostaRepo.definirOculta(alvoId, oculta);
  }

  /** RN-05: qualquer usuário autenticado denuncia; com 3 denúncias pendentes o item some até revisão. */
  async denunciar(
    ator: Ator,
    dto: { tipoAlvo: AlvoDenuncia; alvoId: number; motivo: string },
  ): Promise<{ ocultado: boolean }> {
    const pergunta = await this.perguntaDoAlvo(dto.tipoAlvo, dto.alvoId);
    await this.acesso.garantirAcesso(ator, pergunta.turma_id);

    new Denuncia({
      denuncianteId: ator.id,
      tipoAlvo: dto.tipoAlvo,
      alvoId: dto.alvoId,
      motivo: dto.motivo,
    }).validar();

    // o repository devolve false se este usuário já denunciou o mesmo item
    if (
      !(await this.denunciaRepo.criar(
        ator.id,
        dto.tipoAlvo,
        dto.alvoId,
        dto.motivo.trim(),
      ))
    ) {
      throw new ErroDeRegraDeNegocio("Você já denunciou este conteúdo.");
    }

    const pendentes = await this.denunciaRepo.contarPendentesPorAlvo(
      dto.tipoAlvo,
      dto.alvoId,
    );
    if (Denuncia.atingiuLimite(pendentes)) {
      await this.definirOculta(dto.tipoAlvo, dto.alvoId, true);
      return { ocultado: true };
    }
    return { ocultado: false };
  }

  /** UC-15: itens ocultos (3+ denúncias pendentes) aguardando o professor. */
  async filaDeModeracao(ator: Ator): Promise<ItemFilaModeracao[]> {
    exigirProfessor(ator);
    const pendentes = await this.denunciaRepo.listarPendentes(
      await this.acesso.turmasVisiveis(ator),
    );

    const grupos = new Map<string, ItemFilaModeracao>();
    for (const d of pendentes) {
      const chave = `${d.alvo_tipo}:${d.alvo_id}`;
      const item = grupos.get(chave) ?? {
        tipoAlvo: d.alvo_tipo,
        alvoId: d.alvo_id,
        totalDenuncias: 0,
        motivos: [],
      };
      item.totalDenuncias += 1;
      item.motivos.push(d.motivo);
      grupos.set(chave, item);
    }
    return [...grupos.values()]
      .filter((i) => Denuncia.atingiuLimite(i.totalDenuncias))
      .sort((a, b) => b.totalDenuncias - a.totalDenuncias);
  }

  /**
   * Professor restaura o conteúdo ou o mantém oculto; todas as denúncias pendentes do item são encerradas.
   * Mapeamento para o status do banco: restaurada → 'mantida' (conteúdo mantido no fórum);
   * mantida_oculta → 'removida' (conteúdo continua fora do ar).
   */
  async revisar(
    ator: Ator,
    dto: { tipoAlvo: AlvoDenuncia; alvoId: number; decisao: DecisaoDenuncia },
  ): Promise<void> {
    exigirProfessor(ator);
    const pergunta = await this.perguntaDoAlvo(dto.tipoAlvo, dto.alvoId);
    await this.acesso.garantirAcesso(ator, pergunta.turma_id);

    const pendentes: DenunciaRow[] = (
      await this.denunciaRepo.listarPendentes(
        await this.acesso.turmasVisiveis(ator),
      )
    ).filter((d) => d.alvo_tipo === dto.tipoAlvo && d.alvo_id === dto.alvoId);
    if (pendentes.length === 0) {
      throw new ErroDeRegraDeNegocio(
        "Este conteúdo não está aguardando moderação.",
      );
    }

    const restaurar = dto.decisao === "restaurada";
    for (const d of pendentes)
      await this.denunciaRepo.resolver(
        d.id,
        restaurar ? "mantida" : "removida",
      );
    await this.definirOculta(dto.tipoAlvo, dto.alvoId, !restaurar);
  }
}
