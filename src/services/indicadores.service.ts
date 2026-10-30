/** Painel (RN-30 a RN-33): fila de validação, indicadores da semana e perguntas em destaque (RN-28). */
import { ErroDePermissao } from "../entities/erros";
import { LIMITE_TAMBEM_TENHO_DESTAQUE } from "../entities/Perguntas";
import type { PerguntaFeed } from "../entities/models/Types";
import type { IPerguntaRepository } from "../entities/models/interface/Iperguntarepository";
import { AcessoTurmaService } from "./acesso-turma.service";
import { ItemTermometro, TermometroService } from "./termometro.service";
import {
  Ator,
  JANELA_TERMOMETRO_DIAS,
  exigirProfessor,
  somarDias,
} from "./tipos.service";

export interface Indicadores {
  perguntasDaSemana: number;
  percentualValidadas: number;
  tempoMedioAteValidacaoMin: number | null;
  topDisciplinasQuentes: ItemTermometro[];
}

const TAMANHO_PAGINA = 100; // máximo aceito pelo PerguntaRepository.listar
const LIMITE_FILA = 500;

export class IndicadoresService {
  constructor(
    private readonly perguntaRepo: IPerguntaRepository,
    private readonly termometro: TermometroService,
    private readonly acesso: AcessoTurmaService,
  ) {}

  /**
   * Professor: fila completa das suas turmas. Monitor: somente as próprias perguntas em aberto (RN-30).
   * A ordem (RN-31: mais "também tenho", depois a mais antiga) vem do repository.
   */
  async filaDeValidacao(ator: Ator): Promise<PerguntaFeed[]> {
    if (ator.perfil !== "professor" && ator.perfil !== "monitor") {
      throw new ErroDePermissao("Acesso restrito a professor e monitor.");
    }
    const fila = await this.perguntaRepo.filaSemValidacao(
      await this.acesso.turmasVisiveis(ator),
      LIMITE_FILA,
    );
    return ator.perfil === "monitor"
      ? fila.filter((p) => p.autor_id === ator.id)
      : fila;
  }

  /** RN-28: perguntas com 5+ "também tenho" e sem resposta validada. */
  async perguntasEmDestaque(ator: Ator): Promise<PerguntaFeed[]> {
    exigirProfessor(ator);
    const fila = await this.filaDeValidacao(ator);
    return fila.filter(
      (p) => p.total_tambem_tenho >= LIMITE_TAMBEM_TENHO_DESTAQUE,
    );
  }

  async obter(ator: Ator, agora: Date = new Date()): Promise<Indicadores> {
    exigirProfessor(ator);
    const turmaIds = await this.acesso.turmasVisiveis(ator);
    const desde = somarDias(agora, -JANELA_TERMOMETRO_DIAS);

    // percorre o feed paginado e conta as perguntas da semana e quantas já têm resposta validada
    let perguntasDaSemana = 0;
    let validadas = 0;
    for (let offset = 0; ; offset += TAMANHO_PAGINA) {
      const pagina = await this.perguntaRepo.listar({
        turmaIds,
        incluirOcultas: false,
        limite: TAMANHO_PAGINA,
        offset,
      });
      for (const p of pagina) {
        if (p.criado_em.getTime() < desde.getTime()) continue;
        perguntasDaSemana += 1;
        if (p.tem_validada === 1) validadas += 1;
      }
      if (pagina.length < TAMANHO_PAGINA) break;
    }

    return {
      perguntasDaSemana,
      percentualValidadas:
        perguntasDaSemana > 0
          ? Math.round((validadas / perguntasDaSemana) * 1000) / 10
          : 0,
      tempoMedioAteValidacaoMin:
        await this.perguntaRepo.tempoMedioAteValidacaoMin(turmaIds, desde),
      topDisciplinasQuentes: await this.termometro.topMaterias(ator, 3, agora),
    };
  }
}
