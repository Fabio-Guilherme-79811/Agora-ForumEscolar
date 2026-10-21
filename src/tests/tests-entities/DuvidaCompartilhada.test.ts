import { DuvidaCompartilhada } from '../../entities/DuvidaCompartilhada';
import { ErroDeRegraDeNegocio } from '../../entities/erros';

describe('DuvidaCompartilhada', () => {
  describe('constructor', () => {
    it('deve atribuir usuarioId e perguntaId', () => {
      const d = new DuvidaCompartilhada({ usuarioId: 1, perguntaId: 2 });

      expect(d.usuarioId).toBe(1);
      expect(d.perguntaId).toBe(2);
    });

    it('deve deixar id indefinido quando não informado', () => {
      const d = new DuvidaCompartilhada({ usuarioId: 1, perguntaId: 2 });

      expect(d.id).toBeUndefined();
    });

    it('deve atribuir id quando informado', () => {
      const d = new DuvidaCompartilhada({ id: 10, usuarioId: 1, perguntaId: 2 });

      expect(d.id).toBe(10);
    });

    it('deve usar a data atual quando criadoEm não é informado', () => {
      const antes = new Date();
      const d = new DuvidaCompartilhada({ usuarioId: 1, perguntaId: 2 });
      const depois = new Date();

      expect(d.criadoEm).toBeInstanceOf(Date);
      expect(d.criadoEm.getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(d.criadoEm.getTime()).toBeLessThanOrEqual(depois.getTime());
    });

    it('deve manter criadoEm quando recebe um Date', () => {
      const data = new Date('2026-01-15T10:00:00.000Z');
      const d = new DuvidaCompartilhada({ usuarioId: 1, perguntaId: 2, criadoEm: data });

      expect(d.criadoEm.getTime()).toBe(data.getTime());
    });

    it('deve converter criadoEm quando recebe uma string', () => {
      const d = new DuvidaCompartilhada({
        usuarioId: 1,
        perguntaId: 2,
        criadoEm: '2026-01-15T10:00:00.000Z',
      });

      expect(d.criadoEm).toBeInstanceOf(Date);
      expect(d.criadoEm.toISOString()).toBe('2026-01-15T10:00:00.000Z');
    });
  });

  describe('setter de id', () => {
    it('deve permitir definir o id depois da criação', () => {
      const d = new DuvidaCompartilhada({ usuarioId: 1, perguntaId: 2 });

      d.id = 99;

      expect(d.id).toBe(99);
    });

    it('deve permitir limpar o id', () => {
      const d = new DuvidaCompartilhada({ id: 5, usuarioId: 1, perguntaId: 2 });

      d.id = undefined;

      expect(d.id).toBeUndefined();
    });
  });

  describe('criar', () => {
    it('deve criar a marcação quando o usuário não é o autor da pergunta', () => {
      const d = DuvidaCompartilhada.criar(1, 2, 3);

      expect(d).toBeInstanceOf(DuvidaCompartilhada);
      expect(d.usuarioId).toBe(1);
      expect(d.perguntaId).toBe(2);
      expect(d.id).toBeUndefined();
      expect(d.criadoEm).toBeInstanceOf(Date);
    });

    it('deve lançar ErroDeRegraDeNegocio quando o usuário é o autor da pergunta', () => {
      expect(() => DuvidaCompartilhada.criar(1, 2, 1)).toThrow(ErroDeRegraDeNegocio);
    });

    it('deve informar mensagem amigável quando o autor marca a própria pergunta', () => {
      expect(() => DuvidaCompartilhada.criar(1, 2, 1)).toThrow(/própria pergunta/);
    });

    it('deve lançar erro quando usuarioId é inválido', () => {
      expect(() => DuvidaCompartilhada.criar(0, 2, 3)).toThrow(ErroDeRegraDeNegocio);
      expect(() => DuvidaCompartilhada.criar(0, 2, 3)).toThrow(/Usuário inválido/);
    });

    it('deve lançar erro quando perguntaId é inválido', () => {
      expect(() => DuvidaCompartilhada.criar(1, 0, 3)).toThrow(ErroDeRegraDeNegocio);
      expect(() => DuvidaCompartilhada.criar(1, 0, 3)).toThrow(/Pergunta inválida/);
    });

    it('deve reportar os dois erros quando usuarioId e perguntaId são inválidos', () => {
      expect(() => DuvidaCompartilhada.criar(0, 0, 3)).toThrow(/Usuário inválido/);
      expect(() => DuvidaCompartilhada.criar(0, 0, 3)).toThrow(/Pergunta inválida/);
    });
  });

  describe('validar', () => {
    it('não deve lançar erro para dados válidos', () => {
      const d = new DuvidaCompartilhada({ usuarioId: 1, perguntaId: 2 });

      expect(() => d.validar()).not.toThrow();
    });

    it('deve lançar erro quando usuarioId é 0', () => {
      const d = new DuvidaCompartilhada({ usuarioId: 0, perguntaId: 2 });

      expect(() => d.validar()).toThrow(ErroDeRegraDeNegocio);
      expect(() => d.validar()).toThrow(/Usuário inválido/);
    });

    it('deve lançar erro quando perguntaId é 0', () => {
      const d = new DuvidaCompartilhada({ usuarioId: 1, perguntaId: 0 });

      expect(() => d.validar()).toThrow(ErroDeRegraDeNegocio);
      expect(() => d.validar()).toThrow(/Pergunta inválida/);
    });

    it('deve lançar erro quando usuarioId é NaN', () => {
      const d = new DuvidaCompartilhada({ usuarioId: NaN, perguntaId: 2 });

      expect(() => d.validar()).toThrow(/Usuário inválido/);
    });
  });

  describe('fromJSON', () => {
    it('deve reconstruir a entity a partir de um JSON', () => {
      const d = DuvidaCompartilhada.fromJSON({
        id: 7,
        usuarioId: 1,
        perguntaId: 2,
        criadoEm: '2026-03-01T12:00:00.000Z',
      });

      expect(d).toBeInstanceOf(DuvidaCompartilhada);
      expect(d.id).toBe(7);
      expect(d.usuarioId).toBe(1);
      expect(d.perguntaId).toBe(2);
      expect(d.criadoEm.toISOString()).toBe('2026-03-01T12:00:00.000Z');
    });

    it('deve aceitar JSON sem id e sem criadoEm', () => {
      const d = DuvidaCompartilhada.fromJSON({ usuarioId: 1, perguntaId: 2 });

      expect(d.id).toBeUndefined();
      expect(d.criadoEm).toBeInstanceOf(Date);
    });
  });

  describe('toJSON', () => {
    it('deve serializar todos os campos', () => {
      const data = new Date('2026-03-01T12:00:00.000Z');
      const d = new DuvidaCompartilhada({ id: 7, usuarioId: 1, perguntaId: 2, criadoEm: data });

      expect(d.toJSON()).toEqual({
        id: 7,
        usuarioId: 1,
        perguntaId: 2,
        criadoEm: data,
      });
    });

    it('deve serializar id como undefined quando não definido', () => {
      const d = new DuvidaCompartilhada({ usuarioId: 1, perguntaId: 2 });

      expect(d.toJSON().id).toBeUndefined();
    });

    it('deve ser compatível com JSON.stringify', () => {
      const data = new Date('2026-03-01T12:00:00.000Z');
      const d = new DuvidaCompartilhada({ id: 7, usuarioId: 1, perguntaId: 2, criadoEm: data });

      expect(JSON.parse(JSON.stringify(d))).toEqual({
        id: 7,
        usuarioId: 1,
        perguntaId: 2,
        criadoEm: '2026-03-01T12:00:00.000Z',
      });
    });

    it('deve fazer round-trip com fromJSON', () => {
      const original = new DuvidaCompartilhada({ id: 3, usuarioId: 4, perguntaId: 5 });

      const copia = DuvidaCompartilhada.fromJSON(original.toJSON());

      expect(copia.toJSON()).toEqual(original.toJSON());
    });
  });
});