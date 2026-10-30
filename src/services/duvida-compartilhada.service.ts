/** "Também tenho essa dúvida": toggle de 1 por usuário/pergunta (RN-15) e alerta aos 5 (RN-28). */
import { DuvidaCompartilhada } from "../entities/DuvidaCompartilhada";
import { LIMITE_TAMBEM_TENHO_DESTAQUE } from "../entities/Perguntas";
import type { IPerguntaRepository } from "../entities/models/interface/Iperguntarepository";
import type { ITambemTenhoRepository } from "../entities/models/interface/Itambemtenhorepository";
import { AcessoTurmaService } from "./acesso-turma.service";
import { ErroDeNaoEncontrado } from "./erros.service";
import { Ator, exigir } from "./tipos.service";

export interface ResultadoDuvida {
  marcado: boolean;
  total: number;
  /** A pergunta está em destaque (5+ marcações e sem resposta validada). */
  destaque: boolean;
  /** true somente no momento em que a 5ª marcação acontece: o painel do professor exibe o alerta. */
  alertaProfessor: boolean;
}

export class DuvidaCompartilhadaService {
  constructor(
    private readonly tambemTenhoRepo: ITambemTenhoRepository,
    private readonly perguntaRepo: IPerguntaRepository,
    private readonly acesso: AcessoTurmaService,
  ) {}

  async alternar(ator: Ator, perguntaId: number): Promise<ResultadoDuvida> {
    const pergunta = exigir(
      await this.perguntaRepo.buscarPorId(perguntaId),
      "Pergunta não encontrada.",
    );
    await this.acesso.garantirAcesso(ator, pergunta.turma_id); // RN-02
    if (pergunta.oculta === 1 && ator.perfil !== "professor") {
      throw new ErroDeNaoEncontrado("Pergunta não encontrada.");
    }

    let marcado: boolean;
    if (await this.tambemTenhoRepo.existe(ator.id, perguntaId)) {
      await this.tambemTenhoRepo.remover(ator.id, perguntaId); // clicar de novo desmarca
      marcado = false;
    } else {
      DuvidaCompartilhada.criar(ator.id, perguntaId, pergunta.autor_id); // lança se for o autor (RN-15)
      await this.tambemTenhoRepo.adicionar(ator.id, perguntaId); // UNIQUE no banco é a trava final
      marcado = true;
    }

    const total = await this.tambemTenhoRepo.contarPorPergunta(perguntaId);
    const semValidada = pergunta.tem_validada === 0;
    return {
      marcado,
      total,
      destaque: semValidada && total >= LIMITE_TAMBEM_TENHO_DESTAQUE,
      alertaProfessor:
        marcado && semValidada && total === LIMITE_TAMBEM_TENHO_DESTAQUE,
    };
  }
}
