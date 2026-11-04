import { VotoUtilRepository } from '../../entities/models/VotoUtilRepository';
import { isDuplicateError, run, selectOne } from '../../entities/models/Dbconnection';

jest.mock('../../entities/models/Dbconnection', () => ({
  run: jest.fn(),
  selectOne: jest.fn(),
  isDuplicateError: jest.fn(),
}));

describe('VotoUtilRepository', () => {
  let repository: VotoUtilRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new VotoUtilRepository();
  });

  describe('adicionar', () => {
    it('deve adicionar um voto útil com sucesso', async () => {
      (run as jest.Mock).mockResolvedValue({ affectedRows: 1 });

      const resultado = await repository.adicionar(1, 10);

      expect(resultado).toBe(true);
      expect(run).toHaveBeenCalledWith(
        'INSERT INTO votoutil (usuario_id, resposta_id) VALUES (?, ?)',
        [1, 10],
      );
    });

    it('deve retornar false quando o voto já existir', async () => {
      const erro = new Error('Duplicate entry');

      (run as jest.Mock).mockRejectedValue(erro);
      (isDuplicateError as jest.Mock).mockReturnValue(true);

      const resultado = await repository.adicionar(1, 10);

      expect(resultado).toBe(false);
      expect(isDuplicateError).toHaveBeenCalledWith(erro);
    });

    it('deve lançar o erro quando não for uma duplicidade', async () => {
      const erro = new Error('Erro no banco de dados');

      (run as jest.Mock).mockRejectedValue(erro);
      (isDuplicateError as jest.Mock).mockReturnValue(false);

      await expect(repository.adicionar(1, 10)).rejects.toThrow(erro);
    });
  });

  describe('remover', () => {
    it('deve retornar true quando um voto for removido', async () => {
      (run as jest.Mock).mockResolvedValue({ affectedRows: 1 });

      const resultado = await repository.remover(1, 10);

      expect(resultado).toBe(true);
      expect(run).toHaveBeenCalledWith(
        'DELETE FROM votoutil WHERE usuario_id = ? AND resposta_id = ?',
        [1, 10],
      );
    });

    it('deve retornar false quando nenhum voto for removido', async () => {
      (run as jest.Mock).mockResolvedValue({ affectedRows: 0 });

      const resultado = await repository.remover(1, 10);

      expect(resultado).toBe(false);
    });

    it('deve lançar erro quando a consulta falhar', async () => {
      const erro = new Error('Erro ao remover voto');

      (run as jest.Mock).mockRejectedValue(erro);

      await expect(repository.remover(1, 10)).rejects.toThrow(erro);
    });
  });

  describe('existe', () => {
    it('deve retornar true quando o voto existir', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ 1: 1 });

      const resultado = await repository.existe(1, 10);

      expect(resultado).toBe(true);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT 1 FROM votoutil WHERE usuario_id = ? AND resposta_id = ?',
        [1, 10],
      );
    });

    it('deve retornar false quando o voto não existir', async () => {
      (selectOne as jest.Mock).mockResolvedValue(null);

      const resultado = await repository.existe(1, 10);

      expect(resultado).toBe(false);
    });

    it('deve lançar erro quando a consulta falhar', async () => {
      const erro = new Error('Erro ao verificar voto');

      (selectOne as jest.Mock).mockRejectedValue(erro);

      await expect(repository.existe(1, 10)).rejects.toThrow(erro);
    });
  });

  describe('contarPorResposta', () => {
    it('deve retornar a quantidade de votos úteis', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ total: 5 });

      const resultado = await repository.contarPorResposta(10);

      expect(resultado).toBe(5);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT COUNT(*) AS total FROM votoutil WHERE resposta_id = ?',
        [10],
      );
    });

    it('deve retornar zero quando não houver votos', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ total: 0 });

      const resultado = await repository.contarPorResposta(10);

      expect(resultado).toBe(0);
    });

    it('deve retornar zero quando o resultado for null', async () => {
      (selectOne as jest.Mock).mockResolvedValue(null);

      const resultado = await repository.contarPorResposta(10);

      expect(resultado).toBe(0);
    });

    it('deve lançar erro quando a consulta falhar', async () => {
      const erro = new Error('Erro ao contar votos');

      (selectOne as jest.Mock).mockRejectedValue(erro);

      await expect(repository.contarPorResposta(10)).rejects.toThrow(erro);
    });
  });
});