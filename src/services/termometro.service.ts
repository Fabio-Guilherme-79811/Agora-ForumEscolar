/** Termômetro de dúvidas: temperatura por matéria nos últimos 7 dias (RN-26), faixas (RN-27), visões (RN-29). */
import type { IPerguntaRepository } from "../entities/models/interface/Iperguntarepository";
import { AcessoTurmaService } from "./acesso-turma.service";
import { Ator, JANELA_TERMOMETRO_DIAS, somarDias } from "./tipos.service";

export type FaixaTemperatura = "frio" | "morno" | "quente";

export interface ItemTermometro {
  materiaId: number;
  materia: string;
  temperatura: number;
  faixa: FaixaTemperatura;
  /** Só o professor recebe os números detalhados (RN-29). */
  detalhes?: { perguntas: number; tambemTenho: number };
}

/** RN-27: Frio 0–4, Morno 5–14, Quente 15 ou mais. */
export function classificarTemperatura(temperatura: number): FaixaTemperatura {
  if (temperatura >= 15) return "quente";
  if (temperatura >= 5) return "morno";
  return "frio";
}

export class TermometroService {
  constructor(
    private readonly perguntaRepo: IPerguntaRepository,
    private readonly acesso: AcessoTurmaService,
  ) {}

  /** Lista ordenada da mais quente para a mais fria (empate: ordem alfabética). */
  async obter(ator: Ator, agora: Date = new Date()): Promise<ItemTermometro[]> {
    const turmaIds = await this.acesso.turmasVisiveis(ator);
    const desde = somarDias(agora, -JANELA_TERMOMETRO_DIAS);
    const linhas = await this.perguntaRepo.temperaturaPorMateria(
      turmaIds,
      desde,
    );

    return linhas
      .map((l): ItemTermometro => {
        // RN-26: temperatura = nº de perguntas + nº de "também tenho"
        const temperatura = Number(l.perguntas) + Number(l.tambem_tenho);
        const item: ItemTermometro = {
          materiaId: l.materia_id,
          materia: l.materia_nome,
          temperatura,
          faixa: classificarTemperatura(temperatura),
        };
        if (ator.perfil === "professor") {
          item.detalhes = {
            perguntas: Number(l.perguntas),
            tambemTenho: Number(l.tambem_tenho),
          };
        }
        return item;
      })
      .sort(
        (x, y) =>
          y.temperatura - x.temperatura ||
          x.materia.localeCompare(y.materia, "pt-BR"),
      );
  }

  /** RN-33: as disciplinas mais "quentes". */
  async topMaterias(
    ator: Ator,
    limite = 3,
    agora: Date = new Date(),
  ): Promise<ItemTermometro[]> {
    return (await this.obter(ator, agora)).slice(0, limite);
  }
}
