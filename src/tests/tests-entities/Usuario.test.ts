import {Usuario,MAX_TENTATIVAS_LOGIN,MINUTOS_BLOQUEIO_LOGIN,TAMANHO_MINIMO_SENHA,} from '../../entities/Usuario';
import {ErroDePermissao,ErroDeRegraDeNegocio,ErroDeValidacao,} from '../../entities/erros';

const HASH_VALIDO =
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

const criarUsuario = (
  overrides: Partial<ConstructorParameters<typeof Usuario>[0]> = {},
) =>
  new Usuario({
    nome: 'João da Silva',
    email: 'JOAO@EXEMPLO.COM',
    senhaHash: HASH_VALIDO,
    perfil: 'aluno',
    turmaId: 1,
    ...overrides,
  });

describe('Usuario', () => {
  describe('construtor e propriedades', () => {
    it('deve criar um usuário com os valores informados', () => {
      const usuario = criarUsuario();

      expect(usuario.nome).toBe('João da Silva');
      expect(usuario.email).toBe('joao@exemplo.com');
      expect(usuario.senhaHash).toBe(HASH_VALIDO);
      expect(usuario.perfil).toBe('aluno');
      expect(usuario.turmaId).toBe(1);
      expect(usuario.fotoUrl).toBeNull();
      expect(usuario.tentativasLogin).toBe(0);
      expect(usuario.bloqueadoAte).toBeNull();
      expect(usuario.id).toBeUndefined();
    });

    it('deve remover espaços do nome e normalizar o e-mail', () => {
      const usuario = criarUsuario({
        nome: '  Maria Silva  ',
        email: '  MARIA@EXEMPLO.COM  ',
      });

      expect(usuario.nome).toBe('Maria Silva');
      expect(usuario.email).toBe('maria@exemplo.com');
    });

    it('deve usar aluno como perfil padrão', () => {
      const usuario = new Usuario({
        nome: 'João da Silva',
        email: 'joao@exemplo.com',
        senhaHash: HASH_VALIDO,
        turmaId: 1,
      });

      expect(usuario.perfil).toBe('aluno');
      expect(usuario.ehAluno()).toBe(true);
    });

    it('deve usar valores padrão para campos opcionais', () => {
      const usuario = new Usuario({
        nome: 'João da Silva',
        email: 'joao@exemplo.com',
        senhaHash: HASH_VALIDO,
      });

      expect(usuario.turmaId).toBeNull();
      expect(usuario.fotoUrl).toBeNull();
      expect(usuario.tentativasLogin).toBe(0);
      expect(usuario.bloqueadoAte).toBeNull();
      expect(usuario.perfil).toBe('aluno');
    });

    it('deve converter datas recebidas como string', () => {
      const usuario = criarUsuario({
        bloqueadoAte: '2030-01-01T12:00:00.000Z',
        criadoEm: '2025-01-01T12:00:00.000Z',
      });

      expect(usuario.bloqueadoAte).toBeInstanceOf(Date);
      expect(usuario.criadoEm).toBeInstanceOf(Date);
      expect(usuario.bloqueadoAte?.toISOString()).toBe(
        '2030-01-01T12:00:00.000Z',
      );
      expect(usuario.criadoEm.toISOString()).toBe(
        '2025-01-01T12:00:00.000Z',
      );
    });

    it('deve permitir alterar propriedades com setters', () => {
      const usuario = criarUsuario();

      usuario.id = 10;
      usuario.nome = '  Ana Souza  ';
      usuario.email = '  ANA@EXEMPLO.COM  ';
      usuario.senhaHash = 'novo-hash';
      usuario.turmaId = 2;
      usuario.fotoUrl = 'https://exemplo.com/foto.png';

      expect(usuario.id).toBe(10);
      expect(usuario.nome).toBe('Ana Souza');
      expect(usuario.email).toBe('ana@exemplo.com');
      expect(usuario.senhaHash).toBe('novo-hash');
      expect(usuario.turmaId).toBe(2);
      expect(usuario.fotoUrl).toBe('https://exemplo.com/foto.png');
    });
  });

  describe('regras de perfil', () => {
    it('deve identificar um aluno', () => {
      const usuario = criarUsuario({ perfil: 'aluno' });

      expect(usuario.ehAluno()).toBe(true);
      expect(usuario.ehMonitor()).toBe(false);
      expect(usuario.ehProfessor()).toBe(false);
      expect(usuario.podeValidarResposta()).toBe(false);
      expect(usuario.podeAcessarPainelCompleto()).toBe(false);
    });

    it('deve identificar um monitor e permitir validar respostas', () => {
      const usuario = criarUsuario({
        perfil: 'monitor',
        turmaId: 1,
      });

      expect(usuario.ehMonitor()).toBe(true);
      expect(usuario.ehAluno()).toBe(false);
      expect(usuario.ehProfessor()).toBe(false);
      expect(usuario.podeValidarResposta()).toBe(true);
      expect(usuario.podeAcessarPainelCompleto()).toBe(false);
    });

    it('deve identificar um professor e permitir acesso ao painel completo', () => {
      const usuario = criarUsuario({
        perfil: 'professor',
        turmaId: null,
      });

      expect(usuario.ehProfessor()).toBe(true);
      expect(usuario.ehAluno()).toBe(false);
      expect(usuario.ehMonitor()).toBe(false);
      expect(usuario.podeValidarResposta()).toBe(true);
      expect(usuario.podeAcessarPainelCompleto()).toBe(true);
    });
  });

  describe('promoverAMonitor', () => {
    it('deve permitir que um professor promova um aluno a monitor', () => {
      const usuario = criarUsuario({ perfil: 'aluno' });

      usuario.promoverAMonitor('professor');

      expect(usuario.perfil).toBe('monitor');
      expect(usuario.ehMonitor()).toBe(true);
    });

    it('deve lançar ErroDePermissao quando outro perfil tenta promover', () => {
      const usuario = criarUsuario({ perfil: 'aluno' });

      expect(() => usuario.promoverAMonitor('monitor')).toThrow(
        ErroDePermissao,
      );
    });

    it('deve lançar ErroDeRegraDeNegocio ao promover alguém que não é aluno', () => {
      const usuario = criarUsuario({ perfil: 'monitor' });

      expect(() => usuario.promoverAMonitor('professor')).toThrow(
        ErroDeRegraDeNegocio,
      );
    });
  });

  describe('rebaixarParaAluno', () => {
    it('deve permitir que um professor rebaixe um monitor a aluno', () => {
      const usuario = criarUsuario({ perfil: 'monitor' });

      usuario.rebaixarParaAluno('professor');

      expect(usuario.perfil).toBe('aluno');
      expect(usuario.ehAluno()).toBe(true);
    });

    it('deve lançar ErroDePermissao quando outro perfil tenta rebaixar', () => {
      const usuario = criarUsuario({ perfil: 'monitor' });

      expect(() => usuario.rebaixarParaAluno('aluno')).toThrow(
        ErroDePermissao,
      );
    });

    it('deve lançar ErroDeRegraDeNegocio ao rebaixar alguém que não é monitor', () => {
      const usuario = criarUsuario({ perfil: 'aluno' });

      expect(() => usuario.rebaixarParaAluno('professor')).toThrow(
        ErroDeRegraDeNegocio,
      );
    });
  });

  describe('controle de tentativas de login', () => {
    it('deve começar sem tentativas e sem bloqueio', () => {
      const usuario = criarUsuario();

      expect(usuario.tentativasLogin).toBe(0);
      expect(usuario.estaBloqueado()).toBe(false);
    });

    it('deve incrementar o contador ao registrar uma falha', () => {
      const usuario = criarUsuario();
      const agora = new Date('2026-01-01T12:00:00.000Z');

      usuario.registrarFalhaLogin(agora);

      expect(usuario.tentativasLogin).toBe(1);
      expect(usuario.estaBloqueado(agora)).toBe(false);
    });

    it('deve bloquear após atingir o limite de tentativas', () => {
      const usuario = criarUsuario();
      const agora = new Date('2026-01-01T12:00:00.000Z');

      for (let i = 0; i < MAX_TENTATIVAS_LOGIN; i++) {
        usuario.registrarFalhaLogin(agora);
      }

      expect(usuario.tentativasLogin).toBe(MAX_TENTATIVAS_LOGIN);
      expect(usuario.estaBloqueado(agora)).toBe(true);
      expect(usuario.bloqueadoAte?.getTime()).toBe(
        agora.getTime() + MINUTOS_BLOQUEIO_LOGIN * 60_000,
      );
    });

    it('deve considerar o bloqueio expirado após o prazo', () => {
      const usuario = criarUsuario();
      const agora = new Date('2026-01-01T12:00:00.000Z');

      for (let i = 0; i < MAX_TENTATIVAS_LOGIN; i++) {
        usuario.registrarFalhaLogin(agora);
      }

      const depoisDoBloqueio = new Date(
        agora.getTime() + MINUTOS_BLOQUEIO_LOGIN * 60_000 + 1,
      );

      expect(usuario.estaBloqueado(depoisDoBloqueio)).toBe(false);
    });

    it('deve reiniciar as tentativas ao registrar falha após bloqueio expirado', () => {
      const usuario = criarUsuario();
      const agora = new Date('2026-01-01T12:00:00.000Z');

      for (let i = 0; i < MAX_TENTATIVAS_LOGIN; i++) {
        usuario.registrarFalhaLogin(agora);
      }

      const depoisDoBloqueio = new Date(
        agora.getTime() + MINUTOS_BLOQUEIO_LOGIN * 60_000 + 1,
      );

      usuario.registrarFalhaLogin(depoisDoBloqueio);

      expect(usuario.tentativasLogin).toBe(1);
      expect(usuario.bloqueadoAte).toBeNull();
    });

    it('deve limpar tentativas e bloqueio após login bem-sucedido', () => {
      const usuario = criarUsuario();
      const agora = new Date('2026-01-01T12:00:00.000Z');

      for (let i = 0; i < MAX_TENTATIVAS_LOGIN; i++) {
        usuario.registrarFalhaLogin(agora);
      }

      usuario.registrarSucessoLogin();

      expect(usuario.tentativasLogin).toBe(0);
      expect(usuario.bloqueadoAte).toBeNull();
      expect(usuario.estaBloqueado(agora)).toBe(false);
    });
  });

  describe('validarSenhaPlana', () => {
    it('deve aceitar uma senha com o tamanho mínimo', () => {
      expect(() =>
        Usuario.validarSenhaPlana('a'.repeat(TAMANHO_MINIMO_SENHA)),
      ).not.toThrow();
    });

    it('deve rejeitar uma senha menor que o mínimo', () => {
      expect(() =>
        Usuario.validarSenhaPlana('a'.repeat(TAMANHO_MINIMO_SENHA - 1)),
      ).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar um valor que não seja string', () => {
      expect(() =>
        Usuario.validarSenhaPlana(null as unknown as string),
      ).toThrow(ErroDeValidacao);
    });
  });

  describe('validar', () => {
    it('deve aceitar um usuário válido', () => {
      const usuario = criarUsuario();

      expect(() => usuario.validar()).not.toThrow();
    });

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const usuario = criarUsuario({ nome: 'A' });

      expect(() => usuario.validar()).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar nome com mais de 100 caracteres', () => {
      const usuario = criarUsuario({ nome: 'A'.repeat(101) });

      expect(() => usuario.validar()).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar e-mail inválido', () => {
      const usuario = criarUsuario({ email: 'email-invalido' });

      expect(() => usuario.validar()).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar senha que não seja hash bcrypt válido', () => {
      const usuario = criarUsuario({ senhaHash: 'minhaSenha123' });

      expect(() => usuario.validar()).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar aluno sem turma', () => {
      const usuario = criarUsuario({
        perfil: 'aluno',
        turmaId: null,
      });

      expect(() => usuario.validar()).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar monitor sem turma', () => {
      const usuario = criarUsuario({
        perfil: 'monitor',
        turmaId: null,
      });

      expect(() => usuario.validar()).toThrow(ErroDeValidacao);
    });

    it('deve aceitar professor sem turma', () => {
      const usuario = criarUsuario({
        perfil: 'professor',
        turmaId: null,
      });

      expect(() => usuario.validar()).not.toThrow();
    });
  });

  describe('fromJSON e serialização', () => {
    it('deve criar um usuário a partir de JSON', () => {
      const usuario = Usuario.fromJSON({
        id: 1,
        nome: 'Carlos Silva',
        email: 'CARLOS@EXEMPLO.COM',
        senhaHash: HASH_VALIDO,
        perfil: 'aluno',
        turmaId: 3,
      });

      expect(usuario).toBeInstanceOf(Usuario);
      expect(usuario.id).toBe(1);
      expect(usuario.nome).toBe('Carlos Silva');
      expect(usuario.email).toBe('carlos@exemplo.com');
    });

    it('toJSON não deve incluir senhaHash nem bloqueio de login', () => {
      const usuario = criarUsuario({ id: 5 });
      const json = usuario.toJSON();

      expect(json).toEqual({
        id: 5,
        nome: 'João da Silva',
        email: 'joao@exemplo.com',
        perfil: 'aluno',
        turmaId: 1,
        fotoUrl: null,
        criadoEm: usuario.criadoEm,
      });

      expect(json).not.toHaveProperty('senhaHash');
      expect(json).not.toHaveProperty('bloqueadoAte');
      expect(json).not.toHaveProperty('tentativasLogin');
    });

    it('toPublicJSON deve retornar somente os dados públicos', () => {
      const usuario = criarUsuario({ id: 8 });
      const json = usuario.toPublicJSON();

      expect(json).toEqual({
        id: 8,
        nome: 'João da Silva',
        perfil: 'aluno',
        turmaId: 1,
        fotoUrl: null,
      });

      expect(json).not.toHaveProperty('email');
      expect(json).not.toHaveProperty('senhaHash');
      expect(json).not.toHaveProperty('bloqueadoAte');
    });
  });
});
