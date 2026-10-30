import { TurmaRepository } from '../../entities/models/TurmaRepository';
import { run, select, selectOne } from '../../entities/models/Dbconnection';
import type { TurmaRow } from '../../entities/models/Types';

jest.mock('../../entities/models/Dbconnection', () => ({
  run: jest.fn(),
  select: jest.fn(),
  selectOne: jest.fn(),
}));

describe('TurmaRepository', () => {
  let repository: TurmaRepository;

  beforeEach(() => {
    repository = new TurmaRepository();
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('deve criar uma turma e retornar seu ID', async () => {
      (run as jest.Mock).mockResolvedValue({ insertId: 10 });

      const resultado = await repository.criar('Turma A', 'ABC123');

      expect(resultado).toBe(10);
      expect(run).toHaveBeenCalledWith(
        'INSERT INTO turmas (nome, codigo) VALUES (?, ?)',
        ['Turma A', 'ABC123'],
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.criar('Turma A', 'ABC123'),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar uma turma pelo ID', async () => {
      const turma = {
        id: 1,
        nome: 'Turma A',
        codigo: 'ABC123',
      } as TurmaRow;

      (selectOne as jest.Mock).mockResolvedValue(turma);

      const resultado = await repository.buscarPorId(1);

      expect(resultado).toEqual(turma);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT * FROM turmas WHERE id = ?',
        [1],
      );
    });

    it('deve retornar undefined quando a turma não existir', async () => {
      (selectOne as jest.Mock).mockResolvedValue(undefined);

      const resultado = await repository.buscarPorId(999);

      expect(resultado).toBeUndefined();
    });

    it('deve propagar erros do banco de dados', async () => {
      (selectOne as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.buscarPorId(1)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });

  describe('buscarPorCodigo', () => {
    it('deve retornar uma turma pelo código', async () => {
      const turma = {
        id: 1,
        nome: 'Turma A',
        codigo: 'ABC123',
      } as TurmaRow;

      (selectOne as jest.Mock).mockResolvedValue(turma);

      const resultado = await repository.buscarPorCodigo('ABC123');

      expect(resultado).toEqual(turma);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT * FROM turmas WHERE codigo = ?',
        ['ABC123'],
      );
    });

    it('deve retornar undefined quando o código não existir', async () => {
      (selectOne as jest.Mock).mockResolvedValue(undefined);

      const resultado = await repository.buscarPorCodigo('XXXXXX');

      expect(resultado).toBeUndefined();
    });

    it('deve propagar erros do banco de dados', async () => {
      (selectOne as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.buscarPorCodigo('ABC123'),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('atualizarCodigo', () => {
    it('deve atualizar o código de uma turma', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.atualizarCodigo(1, 'XYZ789');

      expect(run).toHaveBeenCalledWith(
        'UPDATE turmas SET codigo = ? WHERE id = ?',
        ['XYZ789', 1],
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.atualizarCodigo(1, 'XYZ789'),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('listarPorProfessor', () => {
    it('deve listar as turmas vinculadas a um professor', async () => {
      const turmas = [
        {
          id: 1,
          nome: 'Turma A',
          codigo: 'ABC123',
        },
        {
          id: 2,
          nome: 'Turma B',
          codigo: 'XYZ789',
        },
      ] as TurmaRow[];

      (select as jest.Mock).mockResolvedValue(turmas);

      const resultado = await repository.listarPorProfessor(5);

      expect(resultado).toEqual(turmas);
      expect(select).toHaveBeenCalledWith(
        'SELECT t.* FROM turmas t JOIN professor_turma pt ON pt.turma_id = t.id WHERE pt.usuario_id = ? ORDER BY t.nome',
        [5],
      );
    });

    it('deve retornar uma lista vazia quando o professor não possuir turmas', async () => {
      (select as jest.Mock).mockResolvedValue([]);

      const resultado = await repository.listarPorProfessor(5);

      expect(resultado).toEqual([]);
    });

    it('deve propagar erros do banco de dados', async () => {
      (select as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.listarPorProfessor(5),
      ).rejects.toThrow('Erro no banco');
    });
  });
});