/** UC-18 / RN-07 / RN-32: o professor gera (ou regenera) o código usado no cadastro dos alunos. */
import { ErroDeRegraDeNegocio } from "../entities/erros";
import { Turma } from "../entities/Turma";
import type { ITurmaRepository } from "../entities/models/interface/Iturmarepository";
import { AcessoTurmaService } from "./acesso-turma.service";
import type { TurmaRow } from "../entities/models/Types";
import { Ator, exigir, exigirProfessor } from "./tipos.service";

const MAX_TENTATIVAS_UNICIDADE = 5;

export class TurmaService {
  constructor(
    private readonly turmaRepo: ITurmaRepository,
    private readonly acesso: AcessoTurmaService,
  ) {}

  async obterTurmaDoPainel(
    ator: Ator,
    turmaId?: number,
  ): Promise<TurmaRow | null> {
    exigirProfessor(ator);
    const turmas = await this.turmaRepo.listarPorProfessor(ator.id);
    if (turmaId === undefined) return turmas[0] ?? null;
    return turmas.find((turma) => turma.id === turmaId) ?? null;
  }

  async gerarCodigo(
    ator: Ator,
    turmaId: number,
    agora: Date = new Date(),
  ): Promise<{ codigo: string; geradoEm: Date }> {
    exigirProfessor(ator);
    await this.acesso.garantirAcesso(ator, turmaId);
    exigir(await this.turmaRepo.buscarPorId(turmaId), "Turma não encontrada.");

    // o código é UNIQUE no banco; sorteia de novo se colidir com o de outra turma
    for (let i = 0; i < MAX_TENTATIVAS_UNICIDADE; i++) {
      const codigo = Turma.gerarCodigo();
      if (!(await this.turmaRepo.buscarPorCodigo(codigo))) {
        await this.turmaRepo.atualizarCodigo(turmaId, codigo);
        return { codigo, geradoEm: agora };
      }
    }
    throw new ErroDeRegraDeNegocio(
      "Não foi possível gerar um código único. Tente novamente.",
    );
  }
}
