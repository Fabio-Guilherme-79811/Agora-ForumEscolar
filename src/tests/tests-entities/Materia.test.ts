import { Materia } from '../../entities/Materia';
import { ErroDeValidacao } from '../../entities/erros';

describe('Materia', () => {
  describe('constructor', () => {
    it('deve atribuir id e nome', () => {
      const m = new Materia({ id: 1, nome: 'Matemática' });

      expect(m.id).toBe(1);
      expect(m.nome).toBe('Matemática');
    });

    it('deve deixar id indefinido quando não informado', () => {
      const m = new Materia({ nome: 'Português' });

      expect(m.id).toBeUndefined();
    });

    it('deve remover espaços do início e do fim do nome', () => {
      const m = new Materia({ nome: '   Programação   ' });

      expect(m.nome).toBe('Programação');
    });

    it('deve transformar nome nulo/indefinido em string vazia', () => {
      const m = new Materia({ nome: undefined as unknown as string });

      expect(m.nome).toBe('');
    });
  });

  describe('setters', () => {
    it('deve permitir definir o id depois da criação', () => {
      const m = new Materia({ nome: 'História' });

      m.id = 42;

      expect(m.id).toBe(42);
    });

    it('deve permitir limpar o id', () => {
      const m = new Materia({ id: 5, nome: 'História' });

      m.id = undefined;

      expect(m.id).toBeUndefined();
    });

    it('deve aplicar trim ao alterar o nome', () => {
      const m = new Materia({ nome: 'Física' });

      m.nome = '  Química  ';

      expect(m.nome).toBe('Química');
    });

    it('deve transformar nome nulo/indefinido em string vazia ao alterar', () => {
      const m = new Materia({ nome: 'Física' });

      m.nome = undefined as unknown as string;

      expect(m.nome).toBe('');
    });
  });

  describe('validar', () => {
    it('não deve lançar erro para um nome válido', () => {
      const m = new Materia({ nome: 'Matemática' });

      expect(() => m.validar()).not.toThrow();
    });

    it('deve aceitar nome com exatamente 2 caracteres', () => {
      const m = new Materia({ nome: 'TI' });

      expect(() => m.validar()).not.toThrow();
    });

    it('deve aceitar nome com exatamente 60 caracteres', () => {
      const m = new Materia({ nome: 'a'.repeat(60) });

      expect(() => m.validar()).not.toThrow();
    });

    it('deve lançar ErroDeValidacao quando o nome é vazio', () => {
      const m = new Materia({ nome: '' });

      expect(() => m.validar()).toThrow(ErroDeValidacao);
      expect(() => m.validar()).toThrow(/entre 2 e 60 caracteres/);
    });

    it('deve lançar ErroDeValidacao quando o nome tem só espaços', () => {
      const m = new Materia({ nome: '     ' });

      expect(() => m.validar()).toThrow(ErroDeValidacao);
    });

    it('deve lançar ErroDeValidacao quando o nome tem 1 caractere', () => {
      const m = new Materia({ nome: 'A' });

      expect(() => m.validar()).toThrow(ErroDeValidacao);
    });

    it('deve lançar ErroDeValidacao quando o nome tem 61 caracteres', () => {
      const m = new Materia({ nome: 'a'.repeat(61) });

      expect(() => m.validar()).toThrow(ErroDeValidacao);
    });

    it('deve expor a mensagem de erro na lista de erros', () => {
      const m = new Materia({ nome: '' });

      try {
        m.validar();
        throw new Error('Deveria ter lançado ErroDeValidacao');
      } catch (e) {
        expect(e).toBeInstanceOf(ErroDeValidacao);
        expect((e as ErroDeValidacao).erros).toEqual([
          'O nome da matéria deve ter entre 2 e 60 caracteres.',
        ]);
      }
    });

    it('deve validar o nome após alteração pelo setter', () => {
      const m = new Materia({ nome: 'Matemática' });

      m.nome = ' ';

      expect(() => m.validar()).toThrow(ErroDeValidacao);
    });
  });

  describe('fromJSON', () => {
    it('deve reconstruir a entity a partir de um JSON', () => {
      const m = Materia.fromJSON({ id: 3, nome: 'Biologia' });

      expect(m).toBeInstanceOf(Materia);
      expect(m.id).toBe(3);
      expect(m.nome).toBe('Biologia');
    });

    it('deve aceitar JSON sem id', () => {
      const m = Materia.fromJSON({ nome: 'Geografia' });

      expect(m.id).toBeUndefined();
      expect(m.nome).toBe('Geografia');
    });

    it('deve aplicar trim no nome ao reconstruir', () => {
      const m = Materia.fromJSON({ nome: '  Artes  ' });

      expect(m.nome).toBe('Artes');
    });
  });

  describe('toJSON', () => {
    it('deve serializar id e nome', () => {
      const m = new Materia({ id: 7, nome: 'Inglês' });

      expect(m.toJSON()).toEqual({ id: 7, nome: 'Inglês' });
    });

    it('deve serializar id como undefined quando não definido', () => {
      const m = new Materia({ nome: 'Inglês' });

      expect(m.toJSON().id).toBeUndefined();
    });

    it('deve ser compatível com JSON.stringify', () => {
      const m = new Materia({ id: 7, nome: 'Inglês' });

      expect(JSON.parse(JSON.stringify(m))).toEqual({ id: 7, nome: 'Inglês' });
    });

    it('deve fazer round-trip com fromJSON', () => {
      const original = new Materia({ id: 9, nome: 'Programação' });

      const copia = Materia.fromJSON(original.toJSON());

      expect(copia.toJSON()).toEqual(original.toJSON());
    });
  });
});