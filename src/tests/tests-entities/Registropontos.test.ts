import { RegistroPontos, PONTOS_POR_TIPO } from '../../entities/Registropontos';
import { ErroDeValidacao } from '../../entities/erros';
import type { TipoPontuacao } from '../../entities/Registropontos';

describe('RegistroPontos', () => {
  let registro: RegistroPontos;

  beforeEach(() => {
    registro = new RegistroPontos({
      id: 1,
      usuarioId: 10,
      tipo: 'resposta',
      pontos: 1,
      respostaId: 5,
      criadoEm: new Date('2026-01-15T12:00:00.000Z'),
    });
  });

  // Testes do construtor
  describe('Construtor', () => {
    it('deve criar um registro com os dados informados', () => {
      expect(registro.id).toBe(1);
      expect(registro.usuarioId).toBe(10);
      expect(registro.tipo).toBe('resposta');
      expect(registro.pontos).toBe(1);
      expect(registro.respostaId).toBe(5);
    });

    it('deve definir respostaId como null quando não informado', () => {
      const novoRegistro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'resposta',
        pontos: 1,
      });

      expect(novoRegistro.respostaId).toBeNull();
    });

    it('deve definir a data atual quando criadoEm não for informado', () => {
      const antes = new Date();

      const novoRegistro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'resposta',
        pontos: 1,
      });

      const depois = new Date();

      expect(novoRegistro.criadoEm).toBeInstanceOf(Date);
      expect(novoRegistro.criadoEm.getTime()).toBeGreaterThanOrEqual(
        antes.getTime(),
      );
      expect(novoRegistro.criadoEm.getTime()).toBeLessThanOrEqual(
        depois.getTime(),
      );
    });

    it('deve aceitar uma data no formato string', () => {
      const novoRegistro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'resposta',
        pontos: 1,
        criadoEm: '2026-01-15T12:00:00.000Z',
      });

      expect(novoRegistro.criadoEm).toBeInstanceOf(Date);
      expect(novoRegistro.criadoEm.toISOString()).toBe(
        '2026-01-15T12:00:00.000Z',
      );
    });
  });

  // Testes dos getters e setter
  describe('Getters e Setter', () => {
    it('deve retornar o id corretamente', () => {
      expect(registro.id).toBe(1);
    });

    it('deve permitir alterar o id', () => {
      registro.id = 20;

      expect(registro.id).toBe(20);
    });

    it('deve permitir definir o id como undefined', () => {
      registro.id = undefined;

      expect(registro.id).toBeUndefined();
    });

    it('deve retornar o usuarioId corretamente', () => {
      expect(registro.usuarioId).toBe(10);
    });

    it('deve retornar o tipo corretamente', () => {
      expect(registro.tipo).toBe('resposta');
    });

    it('deve retornar os pontos corretamente', () => {
      expect(registro.pontos).toBe(1);
    });

    it('deve retornar o respostaId corretamente', () => {
      expect(registro.respostaId).toBe(5);
    });

    it('deve retornar criadoEm como uma data', () => {
      expect(registro.criadoEm).toBeInstanceOf(Date);
    });
  });

  // Testes da tabela de pontuação
  describe('PONTOS_POR_TIPO', () => {
    it('deve definir 1 ponto para resposta', () => {
      expect(PONTOS_POR_TIPO.resposta).toBe(1);
    });

    it('deve definir 2 pontos para voto útil', () => {
      expect(PONTOS_POR_TIPO.voto_util).toBe(2);
    });

    it('deve definir 10 pontos para validação', () => {
      expect(PONTOS_POR_TIPO.validacao).toBe(10);
    });
  });

  // Testes do método validar()
  describe('validar()', () => {
    it('não deve lançar erro quando os dados forem válidos', () => {
      expect(() => registro.validar()).not.toThrow();
    });

    it('deve lançar ErroDeValidacao quando usuarioId for zero', () => {
      registro = new RegistroPontos({
        usuarioId: 0,
        tipo: 'resposta',
        pontos: 1,
      });

      expect(() => registro.validar()).toThrow(ErroDeValidacao);
      expect(() => registro.validar()).toThrow('Usuário inválido.');
    });

    it('deve rejeitar um tipo de pontuação inválido', () => {
      registro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'invalido' as TipoPontuacao,
        pontos: 1,
      });

      expect(() => registro.validar()).toThrow(ErroDeValidacao);
      expect(() => registro.validar()).toThrow(
        'Tipo de pontuação inválido.',
      );
    });

    it('deve rejeitar uma pontuação negativa', () => {
      registro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'resposta',
        pontos: -1,
      });

      expect(() => registro.validar()).toThrow(
        'Pontuação não pode ser negativa.',
      );
    });

    it('deve rejeitar uma pontuação que não seja inteira', () => {
      registro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'resposta',
        pontos: 1.5,
      });

      expect(() => registro.validar()).toThrow(
        'Pontuação não pode ser negativa.',
      );
    });

    it('deve rejeitar pontos incompatíveis com o tipo resposta', () => {
      registro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'resposta',
        pontos: 2,
      });

      expect(() => registro.validar()).toThrow(
        'Pontos incompatíveis com o tipo de evento.',
      );
    });

    it('deve rejeitar pontos incompatíveis com o tipo voto_util', () => {
      registro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'voto_util',
        pontos: 1,
      });

      expect(() => registro.validar()).toThrow(
        'Pontos incompatíveis com o tipo de evento.',
      );
    });

    it('deve rejeitar pontos incompatíveis com o tipo validacao', () => {
      registro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'validacao',
        pontos: 5,
      });

      expect(() => registro.validar()).toThrow(
        'Pontos incompatíveis com o tipo de evento.',
      );
    });

    it('deve acumular os erros quando usuarioId e tipo forem inválidos', () => {
      registro = new RegistroPontos({
        usuarioId: 0,
        tipo: 'invalido' as TipoPontuacao,
        pontos: 1,
      });

      let erroCapturado: unknown;

      try {
        registro.validar();
      } catch (erro: unknown) {
        erroCapturado = erro;
      }

      expect(erroCapturado).toBeInstanceOf(ErroDeValidacao);
      expect((erroCapturado as ErroDeValidacao).erros).toContain(
        'Usuário inválido.',
      );
      expect((erroCapturado as ErroDeValidacao).erros).toContain(
        'Tipo de pontuação inválido.',
      );
    });
  });

  // Testes do método estático paraEvento()
  describe('paraEvento()', () => {
    it('deve criar um registro de resposta com 1 ponto', () => {
      const resultado = RegistroPontos.paraEvento(10, 'resposta');

      expect(resultado).toBeInstanceOf(RegistroPontos);
      expect(resultado.usuarioId).toBe(10);
      expect(resultado.tipo).toBe('resposta');
      expect(resultado.pontos).toBe(1);
      expect(resultado.respostaId).toBeNull();
    });

    it('deve criar um registro de voto útil com 2 pontos', () => {
      const resultado = RegistroPontos.paraEvento(10, 'voto_util', 5);

      expect(resultado.tipo).toBe('voto_util');
      expect(resultado.pontos).toBe(2);
      expect(resultado.respostaId).toBe(5);
    });

    it('deve criar um registro de validação com 10 pontos', () => {
      const resultado = RegistroPontos.paraEvento(10, 'validacao', 5);

      expect(resultado.tipo).toBe('validacao');
      expect(resultado.pontos).toBe(10);
      expect(resultado.respostaId).toBe(5);
    });

    it('deve validar automaticamente o registro criado', () => {
      expect(() => RegistroPontos.paraEvento(10, 'resposta')).not.toThrow();
    });

    it('deve rejeitar usuarioId inválido', () => {
      expect(() => RegistroPontos.paraEvento(0, 'resposta')).toThrow(
        'Usuário inválido.',
      );
    });
  });

  // Testes de conversão JSON
  describe('fromJSON()', () => {
    it('deve criar uma instância a partir dos dados informados', () => {
      const dados = {
        id: 2,
        usuarioId: 20,
        tipo: 'voto_util' as const,
        pontos: 2,
        respostaId: 8,
        criadoEm: '2026-02-10T10:00:00.000Z',
      };

      const resultado = RegistroPontos.fromJSON(dados);

      expect(resultado).toBeInstanceOf(RegistroPontos);
      expect(resultado.id).toBe(2);
      expect(resultado.usuarioId).toBe(20);
      expect(resultado.tipo).toBe('voto_util');
      expect(resultado.pontos).toBe(2);
      expect(resultado.respostaId).toBe(8);
      expect(resultado.criadoEm.toISOString()).toBe(
        '2026-02-10T10:00:00.000Z',
      );
    });
  });

  describe('toJSON()', () => {
    it('deve retornar todos os dados do registro', () => {
      expect(registro.toJSON()).toEqual({
        id: 1,
        usuarioId: 10,
        tipo: 'resposta',
        pontos: 1,
        respostaId: 5,
        criadoEm: new Date('2026-01-15T12:00:00.000Z'),
      });
    });

    it('deve retornar id undefined quando não houver id', () => {
      const novoRegistro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'resposta',
        pontos: 1,
      });

      expect(novoRegistro.toJSON().id).toBeUndefined();
    });

    it('deve retornar respostaId null quando não houver resposta associada', () => {
      const novoRegistro = new RegistroPontos({
        usuarioId: 10,
        tipo: 'resposta',
        pontos: 1,
      });

      expect(novoRegistro.toJSON().respostaId).toBeNull();
    });
  });
});
