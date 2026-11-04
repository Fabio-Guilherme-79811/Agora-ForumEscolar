import { VotoUtil } from '../../entities/Votoutil';
import { ErroDeRegraDeNegocio, ErroDeValidacao } from '../../entities/erros';

describe('VotoUtil', () => {
  const criarVoto = (
    overrides: Partial<ConstructorParameters<typeof VotoUtil>[0]> = {},
  ) =>
    new VotoUtil({
      usuarioId: 1,
      respostaId: 10,
      ...overrides,
    });

  describe('construtor e propriedades', () => {
    it('deve criar um voto com os dados informados', () => {
      const voto = criarVoto({ id: 5 });

      expect(voto.id).toBe(5);
      expect(voto.usuarioId).toBe(1);
      expect(voto.respostaId).toBe(10);
      expect(voto.criadoEm).toBeInstanceOf(Date);
    });

    it('deve permitir criar um voto sem id', () => {
      const voto = criarVoto();

      expect(voto.id).toBeUndefined();
    });

    it('deve permitir alterar o id', () => {
      const voto = criarVoto();

      voto.id = 20;

      expect(voto.id).toBe(20);
    });

    it('deve converter criadoEm de string para Date', () => {
      const voto = criarVoto({
        criadoEm: '2025-05-10T12:00:00.000Z',
      });

      expect(voto.criadoEm).toBeInstanceOf(Date);
      expect(voto.criadoEm.toISOString()).toBe(
        '2025-05-10T12:00:00.000Z',
      );
    });

    it('deve usar a data atual quando criadoEm não for informado', () => {
      const antes = new Date();
      const voto = criarVoto();
      const depois = new Date();

      expect(voto.criadoEm.getTime()).toBeGreaterThanOrEqual(
        antes.getTime(),
      );
      expect(voto.criadoEm.getTime()).toBeLessThanOrEqual(
        depois.getTime(),
      );
    });
  });

  describe('criar', () => {
    it('deve criar um voto válido', () => {
      const voto = VotoUtil.criar(1, 10, 2);

      expect(voto).toBeInstanceOf(VotoUtil);
      expect(voto.usuarioId).toBe(1);
      expect(voto.respostaId).toBe(10);
    });

    it('deve rejeitar voto na própria resposta', () => {
      expect(() => VotoUtil.criar(1, 10, 1)).toThrow(
        ErroDeRegraDeNegocio,
      );
    });

    it('deve apresentar a mensagem correta ao votar na própria resposta', () => {
      expect(() => VotoUtil.criar(1, 10, 1)).toThrow(
        'Você não pode votar na própria resposta.',
      );
    });

    it('deve permitir votar quando o usuário é diferente do autor', () => {
      const voto = VotoUtil.criar(2, 10, 1);

      expect(voto.usuarioId).toBe(2);
      expect(voto.respostaId).toBe(10);
    });

    it('deve rejeitar usuário com id inválido', () => {
      expect(() => VotoUtil.criar(0, 10, 2)).toThrow(
        ErroDeValidacao,
      );
    });

    it('deve rejeitar resposta com id inválido', () => {
      expect(() => VotoUtil.criar(1, 0, 2)).toThrow(
        ErroDeValidacao,
      );
    });
  });

  describe('validar', () => {
    it('não deve lançar erro para um voto válido', () => {
      const voto = criarVoto();

      expect(() => voto.validar()).not.toThrow();
    });

    it('deve rejeitar usuarioId igual a zero', () => {
      const voto = criarVoto({ usuarioId: 0 });

      expect(() => voto.validar()).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar respostaId igual a zero', () => {
      const voto = criarVoto({ respostaId: 0 });

      expect(() => voto.validar()).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar usuarioId negativo', () => {
      const voto = criarVoto({ usuarioId: -1 });

      expect(() => voto.validar()).toThrow(ErroDeValidacao);
    });

    it('deve rejeitar respostaId negativo', () => {
      const voto = criarVoto({ respostaId: -1 });

      expect(() => voto.validar()).toThrow(ErroDeValidacao);
    });
  });

  describe('fromJSON', () => {
    it('deve criar uma instância a partir de um objeto JSON', () => {
      const voto = VotoUtil.fromJSON({
        id: 7,
        usuarioId: 3,
        respostaId: 15,
        criadoEm: '2025-01-20T10:30:00.000Z',
      });

      expect(voto).toBeInstanceOf(VotoUtil);
      expect(voto.id).toBe(7);
      expect(voto.usuarioId).toBe(3);
      expect(voto.respostaId).toBe(15);
      expect(voto.criadoEm.toISOString()).toBe(
        '2025-01-20T10:30:00.000Z',
      );
    });
  });

  describe('toJSON', () => {
    it('deve serializar todos os dados do voto', () => {
      const voto = VotoUtil.fromJSON({
        id: 7,
        usuarioId: 3,
        respostaId: 15,
        criadoEm: '2025-01-20T10:30:00.000Z',
      });

      expect(voto.toJSON()).toEqual({
        id: 7,
        usuarioId: 3,
        respostaId: 15,
        criadoEm: new Date('2025-01-20T10:30:00.000Z'),
      });
    });

    it('deve incluir id como undefined quando não informado', () => {
      const voto = criarVoto();

      expect(voto.toJSON()).toEqual({
        id: undefined,
        usuarioId: 1,
        respostaId: 10,
        criadoEm: voto.criadoEm,
      });
    });
  });
});
