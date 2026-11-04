import { UsuarioRepository } from '../../entities/models/UsuarioRepository';
import { run, select, selectOne } from '../../entities/models/Dbconnection';
import type { NovoUsuario, Perfil, UsuarioRow } from '../../entities/models/Types';

jest.mock('../../entities/models/Dbconnection', () => ({
  run: jest.fn(),
  select: jest.fn(),
  selectOne: jest.fn(),
}));

describe('UsuarioRepository', () => {
  let repository: UsuarioRepository;

  beforeEach(() => {
    repository = new UsuarioRepository();
    jest.clearAllMocks();
  });

  const novoUsuario: NovoUsuario = {
    nome: 'João',
    email: 'JOAO@EMAIL.COM',
    senha_hash: 'hash123',
    turma_id: 1,
  };

  describe('criar', () => {
    it('deve criar um usuário e retornar seu ID', async () => {
      (run as jest.Mock).mockResolvedValue({ insertId: 10 });

      const resultado = await repository.criar(novoUsuario);

      expect(resultado).toBe(10);
      expect(run).toHaveBeenCalledWith(
        'INSERT INTO usuarios (nome, email, senha_hash, perfil, turma_id) VALUES (?, ?, ?, ?, ?)',
        ['João', 'joao@email.com', 'hash123', 'aluno', 1],
      );
    });

    it('deve utilizar o perfil informado', async () => {
      (run as jest.Mock).mockResolvedValue({ insertId: 11 });

      const usuario: NovoUsuario = {
        ...novoUsuario,
        perfil: 'professor',
      };

      const resultado = await repository.criar(usuario);

      expect(resultado).toBe(11);
      expect(run).toHaveBeenCalledWith(
        expect.any(String),
        ['João', 'joao@email.com', 'hash123', 'professor', 1],
      );
    });

    it('deve converter o email para letras minúsculas', async () => {
      (run as jest.Mock).mockResolvedValue({ insertId: 12 });

      await repository.criar(novoUsuario);

      expect(run).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['joao@email.com']),
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.criar(novoUsuario)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar um usuário pelo ID', async () => {
      const usuario = {
        id: 1,
        nome: 'João',
        email: 'joao@email.com',
      } as UsuarioRow;

      (selectOne as jest.Mock).mockResolvedValue(usuario);

      const resultado = await repository.buscarPorId(1);

      expect(resultado).toEqual(usuario);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE id = ?',
        [1],
      );
    });

    it('deve retornar undefined quando o usuário não existir', async () => {
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

  describe('buscarPorEmail', () => {
    it('deve retornar um usuário pelo email', async () => {
      const usuario = {
        id: 1,
        nome: 'João',
        email: 'joao@email.com',
      } as UsuarioRow;

      (selectOne as jest.Mock).mockResolvedValue(usuario);

      const resultado = await repository.buscarPorEmail('joao@email.com');

      expect(resultado).toEqual(usuario);
      expect(selectOne).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE email = ?',
        ['joao@email.com'],
      );
    });

    it('deve converter o email para letras minúsculas', async () => {
      (selectOne as jest.Mock).mockResolvedValue(null);

      await repository.buscarPorEmail('JOAO@EMAIL.COM');

      expect(selectOne).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE email = ?',
        ['joao@email.com'],
      );
    });

    it('deve retornar undefined quando o email não existir', async () => {
      (selectOne as jest.Mock).mockResolvedValue(undefined);

      const resultado = await repository.buscarPorEmail('inexistente@email.com');

      expect(resultado).toBeUndefined();
    });

    it('deve propagar erros do banco de dados', async () => {
      (selectOne as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.buscarPorEmail('joao@email.com'),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('listarPorTurma', () => {
    it('deve listar os usuários de uma turma', async () => {
      const usuarios = [
        { id: 1, nome: 'Ana', email: 'ana@email.com' },
        { id: 2, nome: 'João', email: 'joao@email.com' },
      ] as UsuarioRow[];

      (select as jest.Mock).mockResolvedValue(usuarios);

      const resultado = await repository.listarPorTurma(1);

      expect(resultado).toEqual(usuarios);
      expect(select).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE turma_id = ? ORDER BY nome',
        [1],
      );
    });

    it('deve retornar uma lista vazia quando não houver usuários', async () => {
      (select as jest.Mock).mockResolvedValue([]);

      const resultado = await repository.listarPorTurma(1);

      expect(resultado).toEqual([]);
    });

    it('deve propagar erros do banco de dados', async () => {
      (select as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.listarPorTurma(1)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });

  describe('atualizarPerfil', () => {
    it('deve atualizar o nome e a foto do usuário', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.atualizarPerfil(1, {
        nome: 'Novo Nome',
        foto: 'foto.png',
      });

      expect(run).toHaveBeenCalledWith(
        'UPDATE usuarios SET nome = COALESCE(?, nome), foto = COALESCE(?, foto) WHERE id = ?',
        ['Novo Nome', 'foto.png', 1],
      );
    });

    it('deve atualizar somente o nome', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.atualizarPerfil(1, { nome: 'Novo Nome' });

      expect(run).toHaveBeenCalledWith(
        expect.any(String),
        ['Novo Nome', null, 1],
      );
    });

    it('deve atualizar somente a foto', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.atualizarPerfil(1, { foto: 'nova-foto.png' });

      expect(run).toHaveBeenCalledWith(
        expect.any(String),
        [null, 'nova-foto.png', 1],
      );
    });

    it('deve manter os valores quando nenhum dado for informado', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.atualizarPerfil(1, {});

      expect(run).toHaveBeenCalledWith(
        expect.any(String),
        [null, null, 1],
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.atualizarPerfil(1, { nome: 'Novo Nome' }),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('atualizarSenha', () => {
    it('deve atualizar a senha do usuário', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.atualizarSenha(1, 'novoHash');

      expect(run).toHaveBeenCalledWith(
        'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
        ['novoHash', 1],
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.atualizarSenha(1, 'novoHash'),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('atualizarPerfilAcesso', () => {
    it('deve atualizar o perfil de acesso do usuário', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      const perfil: Perfil = 'professor';

      await repository.atualizarPerfilAcesso(1, perfil);

      expect(run).toHaveBeenCalledWith(
        'UPDATE usuarios SET perfil = ? WHERE id = ?',
        ['professor', 1],
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.atualizarPerfilAcesso(1, 'aluno'),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('registrarFalhaLogin', () => {
    it('deve registrar uma falha de login e aplicar o limite informado', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.registrarFalhaLogin(1, 5, 10);

      expect(run).toHaveBeenCalledWith(
        expect.stringContaining('tentativas_login = tentativas_login + 1'),
        [5, 10, 1],
      );
    });

    it('deve utilizar o tempo de bloqueio informado', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.registrarFalhaLogin(1, 3, 15);

      expect(run).toHaveBeenCalledWith(
        expect.stringContaining('DATE_ADD(NOW(), INTERVAL ? MINUTE)'),
        [3, 15, 1],
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(
        repository.registrarFalhaLogin(1, 5, 10),
      ).rejects.toThrow('Erro no banco');
    });
  });

  describe('zerarFalhasLogin', () => {
    it('deve zerar as tentativas e remover o bloqueio do usuário', async () => {
      (run as jest.Mock).mockResolvedValue(undefined);

      await repository.zerarFalhasLogin(1);

      expect(run).toHaveBeenCalledWith(
        'UPDATE usuarios SET tentativas_login = 0, bloqueado_ate = NULL WHERE id = ?',
        [1],
      );
    });

    it('deve propagar erros do banco de dados', async () => {
      (run as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

      await expect(repository.zerarFalhasLogin(1)).rejects.toThrow(
        'Erro no banco',
      );
    });
  });
});