import { RespostaRepository } from '../../entities/models/RespostaRepository';
import { isDuplicateError,run,select,selectOne,withTransaction, } from '../../entities/models/Dbconnection';
import type { RespostaDetalhe,RespostaRow, } from '../../entities/models/Types';

jest.mock('../../entities/models/Dbconnection', () => ({
  isDuplicateError: jest.fn(),
  run: jest.fn(),
  select: jest.fn(),
  selectOne: jest.fn(),
  withTransaction: jest.fn(),
}));

describe('RespostaRepository', () => {
  let repository: RespostaRepository;

  beforeEach(() => {
    jest.resetAllMocks();
    repository = new RespostaRepository();
  });

  describe('criar', () => {
    it('deve criar uma resposta e retornar seu ID', async () => {
      (run as jest.Mock).mockResolvedValue({ insertId: 10 });

      const resultado = await repository.criar(1, 2, 'Minha resposta');

      expect(resultado).toBe(10);
      expect(run).toHaveBeenCalledWith(
        'INSERT INTO respostas (pergunta_id, autor_id, conteudo) VALUES (?, ?, ?)',
        [1, 2, 'Minha resposta'],
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.criar(1, 2, 'Minha resposta'),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar uma resposta pelo ID', async () => {
      const resposta = {
        id: 1,
        pergunta_id: 2,
        autor_id: 3,
        conteudo: 'Resposta teste',
      } as RespostaRow;

      (selectOne as jest.Mock).mockResolvedValue(resposta);

      const resultado = await repository.buscarPorId(1);

      expect(resultado).toEqual(resposta);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT * FROM respostas WHERE id = ?',
        [1],
      );
    });

    it('deve retornar undefined quando a resposta não existir', async () => {
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

  describe('listarPorPergunta', () => {
    it('deve listar as respostas de uma pergunta', async () => {
      const respostas = [
        {
          id: 1,
          pergunta_id: 5,
          conteudo: 'Resposta validada',
          autor_nome: 'Aluno 1',
          total_uteis: 10,
        },
        {
          id: 2,
          pergunta_id: 5,
          conteudo: 'Outra resposta',
          autor_nome: 'Aluno 2',
          total_uteis: 5,
        },
      ] as RespostaDetalhe[];

      (select as jest.Mock).mockResolvedValue(respostas);

      const resultado = await repository.listarPorPergunta(5);

      expect(resultado).toEqual(respostas);
      expect(select).toHaveBeenCalledWith(
        expect.stringContaining('WHERE r.pergunta_id = ? AND r.oculta = 0'),
        [5],
      );
    });

    it('deve retornar uma lista vazia quando não houver respostas', async () => {
      (select as jest.Mock).mockResolvedValue([]);

      const resultado = await repository.listarPorPergunta(5);

      expect(resultado).toEqual([]);
    });

    it('deve propagar erros do banco de dados', async () => {
      (select as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.listarPorPergunta(5)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });

  describe('validar', () => {
    beforeEach(() => {
      (withTransaction as jest.Mock).mockImplementation(
        async (callback) => callback({}),
      );
    });

    it('deve retornar false quando a resposta não existir', async () => {
      (selectOne as jest.Mock).mockResolvedValueOnce(undefined);

      const resultado = await repository.validar(1, 2);

      expect(resultado).toBe(false);
      expect(selectOne).toHaveBeenCalledTimes(1);
    });

    it('deve retornar false quando outra resposta já estiver validada', async () => {
      const resposta = {
        id: 1,
        pergunta_id: 5,
      } as RespostaRow;

      (selectOne as jest.Mock)
        .mockResolvedValueOnce(resposta)
        .mockResolvedValueOnce({ 1: 1 });

      const resultado = await repository.validar(1, 2);

      expect(resultado).toBe(false);
      expect(run).not.toHaveBeenCalled();
    });

    it('deve validar a resposta quando nenhuma outra estiver validada', async () => {
      const resposta = {
        id: 1,
        pergunta_id: 5,
      } as RespostaRow;

      (selectOne as jest.Mock)
        .mockResolvedValueOnce(resposta)
        .mockResolvedValueOnce(undefined);

      (run as jest.Mock).mockResolvedValue(undefined);

      const resultado = await repository.validar(1, 2);

      expect(resultado).toBe(true);

      expect(run).toHaveBeenCalledWith(
        'UPDATE respostas SET validada = 1, validada_por = ?, validada_em = NOW() WHERE id = ?',
        [2, 1],
        expect.anything(),
      );
    });

    it('deve utilizar uma transação durante a validação', async () => {
      (selectOne as jest.Mock).mockResolvedValueOnce(undefined);

      await repository.validar(1, 2);

      expect(withTransaction).toHaveBeenCalledTimes(1);
      expect(withTransaction).toHaveBeenCalledWith(expect.any(Function));
    });

    it('deve bloquear a pergunta durante a validação', async () => {
      const resposta = {
        id: 1,
        pergunta_id: 5,
      } as RespostaRow;

      (selectOne as jest.Mock)
        .mockResolvedValueOnce(resposta)
        .mockResolvedValueOnce(undefined);

      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.validar(1, 2);

      expect(select).toHaveBeenCalledWith(
        'SELECT id FROM perguntas WHERE id = ? FOR UPDATE',
        [5],
        expect.anything(),
      );
    });

    it('deve retornar false quando ocorrer erro de duplicidade', async () => {
      const resposta = {
        id: 1,
        pergunta_id: 5,
      } as RespostaRow;

      const erro = new Error('Duplicate entry');

      (selectOne as jest.Mock)
        .mockResolvedValueOnce(resposta)
        .mockResolvedValueOnce(undefined);

      (run as jest.Mock).mockRejectedValue(erro);
      (isDuplicateError as jest.Mock).mockReturnValue(true);

      const resultado = await repository.validar(1, 2);

      expect(resultado).toBe(false);
      expect(isDuplicateError).toHaveBeenCalledWith(erro);
    });

    it('deve propagar erros que não sejam de duplicidade', async () => {
      const resposta = {
        id: 1,
        pergunta_id: 5,
      } as RespostaRow;

      const erro = new Error('Erro inesperado');

      (selectOne as jest.Mock)
        .mockResolvedValueOnce(resposta)
        .mockResolvedValueOnce(undefined);

      (run as jest.Mock).mockRejectedValue(erro);
      (isDuplicateError as jest.Mock).mockReturnValue(false);

      await expect(repository.validar(1, 2)).rejects.toThrow(
        'Erro inesperado',
      );
    });
  });

  describe('retirarValidacao', () => {
    it('deve retirar a validação de uma resposta', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.retirarValidacao(1);

      expect(run).toHaveBeenCalledWith(
        'UPDATE respostas SET validada = 0, validada_por = NULL, validada_em = NULL WHERE id = ?',
        [1],
      );
    });
  });

  describe('atualizarConteudo', () => {
    it('deve atualizar o conteúdo de uma resposta', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.atualizarConteudo(1, 'Novo conteúdo');

      expect(run).toHaveBeenCalledWith(
        'UPDATE respostas SET conteudo = ? WHERE id = ?',
        ['Novo conteúdo', 1],
      );
    });
  });

  describe('excluir', () => {
    it('deve excluir uma resposta pelo ID', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.excluir(1);

      expect(run).toHaveBeenCalledWith(
        'DELETE FROM respostas WHERE id = ?',
        [1],
      );
    });
  });

  describe('definirOculta', () => {
    it('deve ocultar uma resposta', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.definirOculta(1, true);

      expect(run).toHaveBeenCalledWith(
        'UPDATE respostas SET oculta = ? WHERE id = ?',
        [1, 1],
      );
    });

    it('deve tornar uma resposta visível', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.definirOculta(1, false);

      expect(run).toHaveBeenCalledWith(
        'UPDATE respostas SET oculta = ? WHERE id = ?',
        [0, 1],
      );
    });
  });
});