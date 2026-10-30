import { ProfessorTurmaRepository } from '../../entities/models/ProfessorTurmaRepository';
import { run, select, selectOne } from '../../entities/models/Dbconnection';

jest.mock('../../entities/models/Dbconnection', () => ({
  run: jest.fn(),
  select: jest.fn(),
  selectOne: jest.fn(),
}));

const runMock = run as jest.Mock;
const selectMock = select as jest.Mock;
const selectOneMock = selectOne as jest.Mock;

describe('ProfessorTurmaRepository', () => {
  let repo: ProfessorTurmaRepository;

  beforeEach(() => {
    jest.resetAllMocks();
    repo = new ProfessorTurmaRepository();
  });

  describe('vincular', () => {
    it('deve inserir o vínculo usando INSERT IGNORE', async () => {
      runMock.mockResolvedValue({});

      await repo.vincular(1, 2);

      expect(runMock).toHaveBeenCalledTimes(1);
      expect(runMock).toHaveBeenCalledWith(
        'INSERT IGNORE INTO professor_turma (usuario_id, turma_id) VALUES (?, ?)',
        [1, 2],
      );
    });

    it('não deve retornar valor', async () => {
      runMock.mockResolvedValue({ insertId: 99 });

      await expect(repo.vincular(1, 2)).resolves.toBeUndefined();
    });

    it('deve propagar o erro se o banco falhar', async () => {
      runMock.mockRejectedValue(new Error('falha no banco'));

      await expect(repo.vincular(1, 2)).rejects.toThrow('falha no banco');
    });
  });

  describe('desvincular', () => {
    it('deve remover o vínculo pelo professor e pela turma', async () => {
      runMock.mockResolvedValue({});

      await repo.desvincular(1, 2);

      expect(runMock).toHaveBeenCalledTimes(1);
      expect(runMock).toHaveBeenCalledWith(
        'DELETE FROM professor_turma WHERE usuario_id = ? AND turma_id = ?',
        [1, 2],
      );
    });

    it('deve propagar o erro se o banco falhar', async () => {
      runMock.mockRejectedValue(new Error('falha no banco'));

      await expect(repo.desvincular(1, 2)).rejects.toThrow('falha no banco');
    });
  });

  describe('listarTurmaIds', () => {
    it('deve retornar apenas os ids das turmas', async () => {
      selectMock.mockResolvedValue([{ turma_id: 3 }, { turma_id: 5 }]);

      const r = await repo.listarTurmaIds(1);

      expect(selectMock).toHaveBeenCalledWith(
        'SELECT turma_id FROM professor_turma WHERE usuario_id = ?',
        [1],
      );
      expect(r).toEqual([3, 5]);
    });

    it('deve retornar lista vazia quando o professor não tem turmas', async () => {
      selectMock.mockResolvedValue([]);

      await expect(repo.listarTurmaIds(1)).resolves.toEqual([]);
    });

    it('deve propagar o erro se o banco falhar', async () => {
      selectMock.mockRejectedValue(new Error('falha no banco'));

      await expect(repo.listarTurmaIds(1)).rejects.toThrow('falha no banco');
    });
  });

  describe('professorEstaNaTurma', () => {
    it('deve retornar true quando o vínculo existir', async () => {
      selectOneMock.mockResolvedValue({ 1: 1 });

      const r = await repo.professorEstaNaTurma(1, 2);

      expect(selectOneMock).toHaveBeenCalledWith(
        'SELECT 1 FROM professor_turma WHERE usuario_id = ? AND turma_id = ?',
        [1, 2],
      );
      expect(r).toBe(true);
    });

    it('deve retornar false quando não existir vínculo (selectOne retorna null)', async () => {
      selectOneMock.mockResolvedValue(null);

      await expect(repo.professorEstaNaTurma(1, 2)).resolves.toBe(false);
    });

    it('deve propagar o erro se o banco falhar', async () => {
      selectOneMock.mockRejectedValue(new Error('falha no banco'));

      await expect(repo.professorEstaNaTurma(1, 2)).rejects.toThrow(
        'falha no banco',
      );
    });
  });
});