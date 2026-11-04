import { MateriaRepository } from '../../entities/models/MaterialRepository';
import { run, select, selectOne } from '../../entities/models/Dbconnection';

jest.mock('../../entities/models/Dbconnection', () => ({
  run: jest.fn(),
  select: jest.fn(),
  selectOne: jest.fn(),
}));

const runMock = run as jest.Mock;
const selectMock = select as jest.Mock;
const selectOneMock = selectOne as jest.Mock;

describe('MateriaRepository', () => {
  let repo: MateriaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new MateriaRepository();
  });

  describe('criar', () => {
    it('deve inserir a matéria e retornar o insertId', async () => {
      runMock.mockResolvedValue({ insertId: 7 });

      const id = await repo.criar('Matemática');

      expect(runMock).toHaveBeenCalledTimes(1);
      expect(runMock).toHaveBeenCalledWith(
        'INSERT INTO materias (nome) VALUES (?)',
        ['Matemática'],
      );
      expect(id).toBe(7);
    });

    it('deve propagar o erro se o banco falhar', async () => {
      runMock.mockRejectedValue(new Error('falha no banco'));

      await expect(repo.criar('Física')).rejects.toThrow('falha no banco');
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar a matéria quando existir', async () => {
      const row = { id: 1, nome: 'História' };
      selectOneMock.mockResolvedValue(row);

      const result = await repo.buscarPorId(1);

      expect(selectOneMock).toHaveBeenCalledWith(
        'SELECT * FROM materias WHERE id = ?',
        [1],
      );
      expect(result).toEqual(row);
    });

    it('deve retornar null/undefined quando não encontrar', async () => {
      selectOneMock.mockResolvedValue(undefined);

      const result = await repo.buscarPorId(999);

      expect(selectOneMock).toHaveBeenCalledWith(
        'SELECT * FROM materias WHERE id = ?',
        [999],
      );
      expect(result).toBeUndefined();
    });

    it('deve propagar o erro se o banco falhar', async () => {
      selectOneMock.mockRejectedValue(new Error('falha no banco'));

      await expect(repo.buscarPorId(1)).rejects.toThrow('falha no banco');
    });
  });

  describe('listar', () => {
    it('deve retornar todas as matérias ordenadas por nome', async () => {
      const rows = [
        { id: 2, nome: 'Biologia' },
        { id: 1, nome: 'Matemática' },
      ];
      selectMock.mockResolvedValue(rows);

      const result = await repo.listar();

      expect(selectMock).toHaveBeenCalledWith(
        'SELECT * FROM materias ORDER BY nome',
      );
      expect(result).toEqual(rows);
    });

    it('deve retornar lista vazia quando não houver matérias', async () => {
      selectMock.mockResolvedValue([]);

      await expect(repo.listar()).resolves.toEqual([]);
    });

    it('deve propagar o erro se o banco falhar', async () => {
      selectMock.mockRejectedValue(new Error('falha no banco'));

      await expect(repo.listar()).rejects.toThrow('falha no banco');
    });
  });
});