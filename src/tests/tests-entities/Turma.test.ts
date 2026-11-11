import { Turma } from '../../entities/Turma';
import { ErroDeValidacao } from '../../entities/erros';

describe('Turma', () => {
  let turma: Turma;

  beforeEach(() => {
    turma = new Turma({
      id: 1,
      nome: 'Turma A',
      codigo: 'ABC234',
      codigoGeradoEm: new Date('2026-01-10T12:00:00.000Z'),
      criadoEm: new Date('2026-01-01T12:00:00.000Z'),
    });
  });

  // Testes do construtor
  describe('Construtor', () => {
    it('deve criar uma turma com os dados informados', () => {
      expect(turma.id).toBe(1);
      expect(turma.nome).toBe('Turma A');
      expect(turma.codigo).toBe('ABC234');
    });

    it('deve remover espaços do nome e converter o código para maiúsculas', () => {
      const resultado = new Turma({
        nome: '  Turma B  ',
        codigo: ' abc234 ',
      });

      expect(resultado.nome).toBe('Turma B');
      expect(resultado.codigo).toBe('ABC234');
    });

    it('deve gerar datas padrão quando não forem informadas', () => {
      const antes = new Date();

      const resultado = new Turma({
        nome: 'Turma C',
        codigo: 'ABC234',
      });

      const depois = new Date();

      expect(resultado.codigoGeradoEm).toBeInstanceOf(Date);
      expect(resultado.criadoEm).toBeInstanceOf(Date);

      expect(resultado.codigoGeradoEm.getTime()).toBeGreaterThanOrEqual(
        antes.getTime(),
      );
      expect(resultado.criadoEm.getTime()).toBeLessThanOrEqual(
        depois.getTime(),
      );
    });

    it('deve aceitar datas no formato string', () => {
      const resultado = new Turma({
        nome: 'Turma D',
        codigo: 'ABC234',
        codigoGeradoEm: '2026-01-10T12:00:00.000Z',
        criadoEm: '2026-01-01T12:00:00.000Z',
      });

      expect(resultado.codigoGeradoEm).toBeInstanceOf(Date);
      expect(resultado.criadoEm).toBeInstanceOf(Date);
      expect(resultado.codigoGeradoEm.toISOString()).toBe(
        '2026-01-10T12:00:00.000Z',
      );
    });
  });

  // Testes dos getters e setters
  describe('Getters e Setters', () => {
    it('deve retornar o id corretamente', () => {
      expect(turma.id).toBe(1);
    });

    it('deve permitir alterar o id', () => {
      turma.id = 5;

      expect(turma.id).toBe(5);
    });

    it('deve permitir definir o id como undefined', () => {
      turma.id = undefined;

      expect(turma.id).toBeUndefined();
    });

    it('deve retornar o nome corretamente', () => {
      expect(turma.nome).toBe('Turma A');
    });

    it('deve remover espaços ao alterar o nome', () => {
      turma.nome = '  Turma Nova  ';

      expect(turma.nome).toBe('Turma Nova');
    });

    it('deve retornar o código em maiúsculas', () => {
      expect(turma.codigo).toBe('ABC234');
    });

    it('deve retornar a data de geração do código', () => {
      expect(turma.codigoGeradoEm).toEqual(
        new Date('2026-01-10T12:00:00.000Z'),
      );
    });

    it('deve retornar a data de criação', () => {
      expect(turma.criadoEm).toEqual(
        new Date('2026-01-01T12:00:00.000Z'),
      );
    });
  });

  // Testes de gerarCodigo()
  describe('gerarCodigo()', () => {
    it('deve gerar um código com 8 caracteres por padrão', () => {
      const codigo = Turma.gerarCodigo();

      expect(codigo).toHaveLength(8);
    });

    it('deve gerar um código com o tamanho solicitado', () => {
      const codigo = Turma.gerarCodigo(6);

      expect(codigo).toHaveLength(6);
    });

    it('deve gerar somente caracteres permitidos', () => {
      const codigo = Turma.gerarCodigo();

      expect(codigo).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
    });

    it('deve gerar códigos diferentes em chamadas sucessivas', () => {
      const codigos = new Set(
        Array.from({ length: 10 }, () => Turma.gerarCodigo()),
      );

      // Teste probabilístico: existe uma pequena possibilidade de colisão.
      expect(codigos.size).toBeGreaterThan(1);
    });

    it('deve retornar string vazia quando o tamanho for zero', () => {
      expect(Turma.gerarCodigo(0)).toBe('');
    });
  });

  // Testes de regenerarCodigo()
  describe('regenerarCodigo()', () => {
    it('deve gerar um novo código de 8 caracteres', () => {
      const data = new Date('2026-03-01T12:00:00.000Z');

      const codigo = turma.regenerarCodigo(data);

      expect(codigo).toHaveLength(8);
      expect(codigo).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
      expect(turma.codigo).toBe(codigo);
    });

    it('deve atualizar a data de geração do código', () => {
      const data = new Date('2026-03-01T12:00:00.000Z');

      turma.regenerarCodigo(data);

      expect(turma.codigoGeradoEm).toBe(data);
    });

    it('deve manter a data de criação da turma', () => {
      const dataCriacao = turma.criadoEm;

      turma.regenerarCodigo(new Date('2026-03-01T12:00:00.000Z'));

      expect(turma.criadoEm).toBe(dataCriacao);
    });
  });

  // Testes de aceitaCodigo()
  describe('aceitaCodigo()', () => {
    it('deve aceitar o código correto', () => {
      expect(turma.aceitaCodigo('ABC234')).toBe(true);
    });

    it('deve aceitar código informado em minúsculas', () => {
      expect(turma.aceitaCodigo('abc234')).toBe(true);
    });

    it('deve aceitar código com espaços nas extremidades', () => {
      expect(turma.aceitaCodigo('  ABC234  ')).toBe(true);
    });

    it('deve rejeitar um código incorreto', () => {
      expect(turma.aceitaCodigo('XYZ789')).toBe(false);
    });

    it('deve rejeitar código vazio', () => {
      expect(turma.aceitaCodigo('')).toBe(false);
    });
  });

  // Testes de validar()
  describe('validar()', () => {
    it('não deve lançar erro quando os dados forem válidos', () => {
      expect(() => turma.validar()).not.toThrow();
    });

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      turma.nome = 'A';

      expect(() => turma.validar()).toThrow(ErroDeValidacao);
      expect(() => turma.validar()).toThrow(
        'O nome da turma deve ter entre 2 e 60 caracteres.',
      );
    });

    it('deve rejeitar nome vazio', () => {
      turma.nome = '  ';

      expect(() => turma.validar()).toThrow(
        'O nome da turma deve ter entre 2 e 60 caracteres.',
      );
    });

    it('deve rejeitar nome com mais de 60 caracteres', () => {
      turma.nome = 'A'.repeat(61);

      expect(() => turma.validar()).toThrow(
        'O nome da turma deve ter entre 2 e 60 caracteres.',
      );
    });

    it('deve aceitar nome com exatamente 2 caracteres', () => {
      turma.nome = 'AB';

      expect(() => turma.validar()).not.toThrow();
    });

    it('deve aceitar nome com exatamente 60 caracteres', () => {
      turma.nome = 'A'.repeat(60);

      expect(() => turma.validar()).not.toThrow();
    });

    it('deve rejeitar código com menos de 6 caracteres', () => {
      turma = new Turma({
        nome: 'Turma A',
        codigo: 'ABC12',
      });

      expect(() => turma.validar()).toThrow(
        'O código da turma deve ter de 6 a 10 caracteres alfanuméricos.',
      );
    });

    it('deve rejeitar código com mais de 10 caracteres', () => {
      turma = new Turma({
        nome: 'Turma A',
        codigo: 'ABCDEFGHIJK',
      });

      expect(() => turma.validar()).toThrow(
        'O código da turma deve ter de 6 a 10 caracteres alfanuméricos.',
      );
    });

    it('deve rejeitar código com caracteres especiais', () => {
      turma = new Turma({
        nome: 'Turma A',
        codigo: 'ABC-234',
      });

      expect(() => turma.validar()).toThrow(
        'O código da turma deve ter de 6 a 10 caracteres alfanuméricos.',
      );
    });

    it('deve rejeitar código com espaços internos', () => {
      turma = new Turma({
        nome: 'Turma A',
        codigo: 'ABC 234',
      });

      expect(() => turma.validar()).toThrow(
        'O código da turma deve ter de 6 a 10 caracteres alfanuméricos.',
      );
    });

    it('deve acumular erros de nome e código inválidos', () => {
      turma = new Turma({
        nome: 'A',
        codigo: 'ABC',
      });

      let erroCapturado: unknown;

      try {
        turma.validar();
      } catch (erro: unknown) {
        erroCapturado = erro;
      }

      expect(erroCapturado).toBeInstanceOf(ErroDeValidacao);

      expect((erroCapturado as ErroDeValidacao).erros).toEqual([
        'O nome da turma deve ter entre 2 e 60 caracteres.',
        'O código da turma deve ter de 6 a 10 caracteres alfanuméricos.',
      ]);
    });
  });

  // Testes de conversão JSON
  describe('fromJSON()', () => {
    it('deve criar uma instância a partir dos dados recebidos', () => {
      const resultado = Turma.fromJSON({
        id: 10,
        nome: 'Turma B',
        codigo: 'DEF567',
        codigoGeradoEm: '2026-02-01T12:00:00.000Z',
        criadoEm: '2026-01-01T12:00:00.000Z',
      });

      expect(resultado).toBeInstanceOf(Turma);
      expect(resultado.id).toBe(10);
      expect(resultado.nome).toBe('Turma B');
      expect(resultado.codigo).toBe('DEF567');
      expect(resultado.codigoGeradoEm).toBeInstanceOf(Date);
      expect(resultado.criadoEm).toBeInstanceOf(Date);
    });
  });

  describe('toJSON()', () => {
    it('deve retornar todos os dados da turma', () => {
      expect(turma.toJSON()).toEqual({
        id: 1,
        nome: 'Turma A',
        codigo: 'ABC234',
        codigoGeradoEm: new Date('2026-01-10T12:00:00.000Z'),
        criadoEm: new Date('2026-01-01T12:00:00.000Z'),
      });
    });

    it('deve refletir as alterações no nome e no id', () => {
      turma.id = 5;
      turma.nome = 'Turma Atualizada';

      expect(turma.toJSON()).toMatchObject({
        id: 5,
        nome: 'Turma Atualizada',
      });
    });
  });
});
