/** RN-02 / RN-03: define quais turmas cada usuário enxerga. Usado por todos os outros services. */
import { ErroDePermissao } from '../entities/erros';
import type { IProfessorTurmaRepository } from '../entities/models/interface/Iprofessorturmarepository';
import { Ator } from './tipos.service';

export class AcessoTurmaService {
  constructor(private readonly professorTurmaRepo: IProfessorTurmaRepository) {}

  /** Professor vê todas as suas turmas; aluno e monitor veem só a própria. */
  async turmasVisiveis(ator: Ator): Promise<number[]> {
    if (ator.perfil === 'professor') return this.professorTurmaRepo.listarTurmaIds(ator.id);
    return ator.turma_id !== null ? [ator.turma_id] : [];
  }

  async garantirAcesso(ator: Ator, turmaId: number): Promise<void> {
    const turmas = await this.turmasVisiveis(ator);
    if (!turmas.includes(turmaId)) {
      throw new ErroDePermissao('Você não tem acesso a esta turma.');
    }
  }
}