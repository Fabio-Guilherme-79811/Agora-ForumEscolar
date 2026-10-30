import { RegistroPontosRepository } from '../../entities/models/ResgistroPontosRepository';
import { run, select, selectOne } from '../../entities/models/Dbconnection';
import type { MotivoPontos, RegistroPontosRow, } from '../../entities/models/Types';

jest.mock('../../entities/models/Dbconnection', () => ({
  run: jest.fn(),
  select: jest.fn(),
  selectOne: jest.fn(),
}));

describe('RegistroPontosRepository', () => {
  let repository: RegistroPontosRepository;

  beforeEach(() => {
    repository = new RegistroPontosRepository();
    jest.clearAllMocks();
  });

  describe('registrar', () => {
    it('deve registrar uma pontuação corretamente', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.registrar(1, 10, 'resposta' as MotivoPontos);

      expect(run).toHaveBeenCalledWith(
        'INSERT INTO registropontos (usuario_id, pontos, motivo, resposta_id) VALUES (?, ?, ?, ?)',
        [1, 10, 'resposta', null],
      );
    });

    it('deve registrar uma pontuação associada a uma resposta', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.registrar(1, 10, 'resposta' as MotivoPontos, 5);

      expect(run).toHaveBeenCalledWith(
        'INSERT INTO registropontos (usuario_id, pontos, motivo, resposta_id) VALUES (?, ?, ?, ?)',
        [1, 10, 'resposta', 5],
      );
    });

    it('deve permitir registrar zero pontos', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.registrar(1, 0, 'resposta' as MotivoPontos);

      expect(run).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar registrar pontuação negativa', async () => {
      await expect(
        repository.registrar(1, -5, 'resposta' as MotivoPontos),
      ).rejects.toThrow('Pontuação negativa não é permitida (RN-35).');

      expect(run).not.toHaveBeenCalled();
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.registrar(1, 10, 'resposta' as MotivoPontos),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('totalPorUsuario', () => {
    it('deve retornar o total de pontos do usuário', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ total: '150' });

      const resultado = await repository.totalPorUsuario(1);

      expect(resultado).toBe(150);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT SUM(pontos) AS total FROM registropontos WHERE usuario_id = ?',
        [1],
      );
    });

    it('deve retornar zero quando o usuário não possui pontos', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ total: null });

      const resultado = await repository.totalPorUsuario(1);

      expect(resultado).toBe(0);
    });

    it('deve retornar zero quando a consulta não retornar resultado', async () => {
      (selectOne as jest.Mock).mockResolvedValue(undefined);

      const resultado = await repository.totalPorUsuario(1);

      expect(resultado).toBe(0);
    });

    it('deve converter o total de pontos para número', async () => {
      (selectOne as jest.Mock).mockResolvedValue({ total: '250.5' });

      const resultado = await repository.totalPorUsuario(1);

      expect(resultado).toBe(250.5);
      expect(typeof resultado).toBe('number');
    });

    it('deve propagar erros do banco de dados', async () => {
      (selectOne as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.totalPorUsuario(1)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });

  describe('listarPorUsuario', () => {
    it('deve listar os registros de pontos de um usuário', async () => {
      const registros = [
        { id: 1, usuario_id: 1, pontos: 10, motivo: 'resposta' },
        { id: 2, usuario_id: 1, pontos: 20, motivo: 'validacao' },
      ] as RegistroPontosRow[];

      (select as jest.Mock).mockResolvedValue(registros);

      const resultado = await repository.listarPorUsuario(1);

      expect(resultado).toEqual(registros);
      expect(select).toHaveBeenCalledWith(
        'SELECT * FROM registropontos WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT ?',
        [1, 50],
      );
    });

    it('deve utilizar o limite informado', async () => {
      (select as jest.Mock).mockResolvedValue([]);

      await repository.listarPorUsuario(1, 10);

      expect(select).toHaveBeenCalledWith(
        'SELECT * FROM registropontos WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT ?',
        [1, 10],
      );
    });

    it('deve retornar uma lista vazia quando não houver registros', async () => {
      (select as jest.Mock).mockResolvedValue([]);

      const resultado = await repository.listarPorUsuario(1);

      expect(resultado).toEqual([]);
    });

    it('deve propagar erros do banco de dados', async () => {
      (select as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.listarPorUsuario(1)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });
});