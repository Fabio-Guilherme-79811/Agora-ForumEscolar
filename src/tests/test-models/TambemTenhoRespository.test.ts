import { TambemTenhoRepository } from '../../entities/models/TambemTenhoRepository';
import { isDuplicateError,run,selectOne, } from '../../entities/models/Dbconnection';

jest.mock('../../entities/models/Dbconnection', () => ({
  isDuplicateError: jest.fn(),
  run: jest.fn(),
  selectOne: jest.fn(),
}));

describe('TambemTenhoRepository', () => {
  let repository: TambemTenhoRepository;

  beforeEach(() => {
    repository = new TambemTenhoRepository();
    jest.clearAllMocks();
  });

  describe('adicionar', () => {
    it('deve adicionar uma associação entre usuário e pergunta', async () => {
      (run as jest.Mock).mockResolvedValue({ affectedRows: 1 });

      const resultado = await repository.adicionar(1, 2);

      expect(resultado).toBe(true);
      expect(run).toHaveBeenCalledWith(
        'INSERT INTO tambemtenho (usuario_id, pergunta_id) VALUES (?, ?)',
        [1, 2],
      );
    });

    it('deve retornar false quando a associação já existir', async () => {
      const erro = new Error('Duplicate entry');

      (run as jest.Mock).mockRejectedValue(erro);
      (isDuplicateError as jest.Mock).mockReturnValue(true);

      const resultado = await repository.adicionar(1, 2);

      expect(resultado).toBe(false);
      expect(isDuplicateError).toHaveBeenCalledWith(erro);
    });

    it('deve propagar erros que não sejam de duplicidade', async () => {
      const erro = new Error('Erro no banco de dados');

      (run as jest.Mock).mockRejectedValue(erro);
      (isDuplicateError as jest.Mock).mockReturnValue(false);

      await expect(repository.adicionar(1, 2)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('remover', () => {
    it('deve remover uma associação existente', async () => {
      (run as jest.Mock).mockResolvedValue({ affectedRows: 1 });

      const resultado = await repository.remover(1, 2);

      expect(resultado).toBe(true);
      expect(run).toHaveBeenCalledWith(
        'DELETE FROM tambemtenho WHERE usuario_id = ? AND pergunta_id = ?',
        [1, 2],
      );
    });

    it('deve retornar false quando nenhuma associação for removida', async () => {
      (run as jest.Mock).mockResolvedValue({ affectedRows: 0 });

      const resultado = await repository.remover(1, 2);

      expect(resultado).toBe(false);
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.remover(1, 2)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });

  describe('existe', () => {
    it('deve retornar true quando a associação existir', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ 1: 1 });

      const resultado = await repository.existe(1, 2);

      expect(resultado).toBe(true);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT 1 FROM tambemtenho WHERE usuario_id = ? AND pergunta_id = ?',
        [1, 2],
      );
    });

    it('deve retornar false quando a associação não existir', async () => {
      (selectOne as jest.Mock).mockResolvedValue(null);

      const resultado = await repository.existe(1, 2);

      expect(resultado).toBe(false);
    });

    it('deve propagar erros do banco de dados', async () => {
      (selectOne as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.existe(1, 2)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });

  describe('contarPorPergunta', () => {
    it('deve retornar a quantidade de usuários interessados na pergunta', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ total: 15 });

      const resultado = await repository.contarPorPergunta(2);

      expect(resultado).toBe(15);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT COUNT(*) AS total FROM tambemtenho WHERE pergunta_id = ?',
        [2],
      );
    });

    it('deve retornar zero quando não houver interessados', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ total: 0 });

      const resultado = await repository.contarPorPergunta(2);

      expect(resultado).toBe(0);
    });

    it('deve retornar zero quando a consulta não retornar resultado', async () => {
      (selectOne as jest.Mock).mockResolvedValue(null);

      const resultado = await repository.contarPorPergunta(2);

      expect(resultado).toBe(0);
    });

    it('deve propagar erros do banco de dados', async () => {
      (selectOne as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.contarPorPergunta(2)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });
});