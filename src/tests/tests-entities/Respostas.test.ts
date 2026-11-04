import { Resposta, CONTEUDO_MAX } from '../../entities/Respostas';
import {ErroDePermissao,ErroDeRegraDeNegocio,ErroDeValidacao,} from '../../entities/erros';
import type { Perfil } from '../../entities/tipos';

describe('Resposta', () => {
  let resposta: Resposta;

  beforeEach(() => {
    resposta = new Resposta({
      id: 1,
      perguntaId: 10,
      autorId: 20,
      conteudo: 'Resposta de teste',
      criadoEm: new Date('2026-01-15T12:00:00.000Z'),
      atualizadoEm: new Date('2026-01-16T12:00:00.000Z'),
    });
  });

  // Testes do construtor
  describe('Construtor', () => {
    it('deve criar uma resposta com os dados informados', () => {
      expect(resposta.id).toBe(1);
      expect(resposta.perguntaId).toBe(10);
      expect(resposta.autorId).toBe(20);
      expect(resposta.conteudo).toBe('Resposta de teste');
      expect(resposta.validada).toBe(false);
      expect(resposta.validadaPorId).toBeNull();
      expect(resposta.validadaEm).toBeNull();
      expect(resposta.oculta).toBe(false);
      expect(resposta.totalVotosUteis).toBe(0);
    });

    it('deve remover espaços no início e no fim do conteúdo', () => {
      const resultado = new Resposta({
        perguntaId: 1,
        autorId: 2,
        conteudo: '  Minha resposta  ',
      });

      expect(resultado.conteudo).toBe('Minha resposta');
    });

    it('deve usar valores padrão quando opcionais não forem informados', () => {
      const resultado = new Resposta({
        perguntaId: 1,
        autorId: 2,
        conteudo: 'Resposta',
      });

      expect(resultado.validada).toBe(false);
      expect(resultado.validadaPorId).toBeNull();
      expect(resultado.validadaEm).toBeNull();
      expect(resultado.oculta).toBe(false);
      expect(resultado.totalVotosUteis).toBe(0);
      expect(resultado.criadoEm).toBeInstanceOf(Date);
      expect(resultado.atualizadoEm).toEqual(resultado.criadoEm);
    });

    it('deve converter datas em string para Date', () => {
      const resultado = new Resposta({
        perguntaId: 1,
        autorId: 2,
        conteudo: 'Resposta',
        validadaEm: '2026-01-15T12:00:00.000Z',
        criadoEm: '2026-01-15T12:00:00.000Z',
        atualizadoEm: '2026-01-16T12:00:00.000Z',
      });

      expect(resultado.validadaEm).toBeInstanceOf(Date);
      expect(resultado.criadoEm).toBeInstanceOf(Date);
      expect(resultado.atualizadoEm).toBeInstanceOf(Date);
    });

    it('deve aceitar totalVotosUteis informado', () => {
      const resultado = new Resposta({
        perguntaId: 1,
        autorId: 2,
        conteudo: 'Resposta',
        totalVotosUteis: 5,
      });

      expect(resultado.totalVotosUteis).toBe(5);
    });
  });

  // Testes dos getters e setters
  describe('Getters e Setters', () => {
    it('deve retornar o id corretamente', () => {
      expect(resposta.id).toBe(1);
    });

    it('deve permitir alterar o id', () => {
      resposta.id = 5;

      expect(resposta.id).toBe(5);
    });

    it('deve permitir definir id como undefined', () => {
      resposta.id = undefined;

      expect(resposta.id).toBeUndefined();
    });

    it('deve retornar perguntaId corretamente', () => {
      expect(resposta.perguntaId).toBe(10);
    });

    it('deve retornar autorId corretamente', () => {
      expect(resposta.autorId).toBe(20);
    });

    it('deve retornar o conteúdo corretamente', () => {
      expect(resposta.conteudo).toBe('Resposta de teste');
    });

    it('deve remover espaços ao alterar o conteúdo', () => {
      resposta.conteudo = '  Novo conteúdo  ';

      expect(resposta.conteudo).toBe('Novo conteúdo');
    });

    it('deve transformar conteúdo undefined em string vazia pelo setter', () => {
      resposta.conteudo = undefined as unknown as string;

      expect(resposta.conteudo).toBe('');
    });

    it('deve retornar o total de votos úteis', () => {
      expect(resposta.totalVotosUteis).toBe(0);
    });

    it('deve permitir alterar o total de votos úteis', () => {
      resposta.totalVotosUteis = 7;

      expect(resposta.totalVotosUteis).toBe(7);
    });
  });

  // Testes de validação por perfil
  describe('validarPor()', () => {
    it('deve permitir que um professor valide a resposta', () => {
      resposta.validarPor(30, 'professor', new Date('2026-02-01T10:00:00.000Z'));

      expect(resposta.validada).toBe(true);
      expect(resposta.validadaPorId).toBe(30);
      expect(resposta.validadaEm).toEqual(
        new Date('2026-02-01T10:00:00.000Z'),
      );
    });

    it('deve permitir que um monitor valide a resposta', () => {
      resposta.validarPor(40, 'monitor', new Date('2026-02-01T10:00:00.000Z'));

      expect(resposta.validada).toBe(true);
      expect(resposta.validadaPorId).toBe(40);
    });

    it('deve lançar ErroDePermissao para perfil não autorizado', () => {
      expect(() =>
        resposta.validarPor(30, 'aluno' as Perfil),
      ).toThrow(ErroDePermissao);
    });

    it('deve apresentar a mensagem correta para perfil não autorizado', () => {
      expect(() =>
        resposta.validarPor(30, 'aluno' as Perfil),
      ).toThrow(
        'Somente professor ou monitor podem validar uma resposta.',
      );
    });

    it('não deve permitir validar uma resposta já validada', () => {
      resposta.validarPor(30, 'professor');

      expect(() =>
        resposta.validarPor(40, 'monitor'),
      ).toThrow(ErroDeRegraDeNegocio);
    });

    it('deve preservar o validador original se tentar validar novamente', () => {
      resposta.validarPor(30, 'professor');

      expect(() =>
        resposta.validarPor(40, 'monitor'),
      ).toThrow();

      expect(resposta.validadaPorId).toBe(30);
    });
  });

  // Testes de retirada da validação
  describe('retirarValidacao()', () => {
    beforeEach(() => {
      resposta.validarPor(30, 'professor');
    });

    it('deve permitir que professor retire a validação', () => {
      resposta.retirarValidacao('professor');

      expect(resposta.validada).toBe(false);
      expect(resposta.validadaPorId).toBeNull();
      expect(resposta.validadaEm).toBeNull();
    });

    it('deve impedir que monitor retire a validação', () => {
      expect(() =>
        resposta.retirarValidacao('monitor'),
      ).toThrow(ErroDePermissao);
    });

    it('deve impedir que aluno retire a validação', () => {
      expect(() =>
        resposta.retirarValidacao('aluno' as Perfil),
      ).toThrow(ErroDePermissao);
    });

    it('deve apresentar a mensagem correta para perfil não autorizado', () => {
      expect(() =>
        resposta.retirarValidacao('monitor'),
      ).toThrow('Somente o professor pode retirar a validação.');
    });

    it('deve impedir retirar validação quando a resposta não estiver validada', () => {
      resposta.retirarValidacao('professor');

      expect(() =>
        resposta.retirarValidacao('professor'),
      ).toThrow(ErroDeRegraDeNegocio);
    });
  });

  // Testes de permissão de edição
  describe('podeSerEditadaPor()', () => {
    it('deve permitir edição pelo autor quando não estiver validada', () => {
      expect(resposta.podeSerEditadaPor(20)).toBe(true);
    });

    it('deve impedir edição por outro usuário', () => {
      expect(resposta.podeSerEditadaPor(30)).toBe(false);
    });

    it('deve impedir edição pelo autor quando a resposta estiver validada', () => {
      resposta.validarPor(40, 'professor');

      expect(resposta.podeSerEditadaPor(20)).toBe(false);
    });

    it('deve permitir edição pelo autor após retirar a validação', () => {
      resposta.validarPor(40, 'professor');
      resposta.retirarValidacao('professor');

      expect(resposta.podeSerEditadaPor(20)).toBe(true);
    });
  });

  // Testes de ocultação e reexibição
  describe('ocultar() e reexibir()', () => {
    it('deve ocultar a resposta', () => {
      resposta.ocultar();

      expect(resposta.oculta).toBe(true);
    });

    it('deve reexibir uma resposta oculta', () => {
      resposta.ocultar();
      resposta.reexibir();

      expect(resposta.oculta).toBe(false);
    });

    it('não deve alterar o conteúdo ao ocultar a resposta', () => {
      resposta.ocultar();

      expect(resposta.conteudo).toBe('Resposta de teste');
    });

    it('deve permitir ocultar uma resposta já oculta', () => {
      resposta.ocultar();
      resposta.ocultar();

      expect(resposta.oculta).toBe(true);
    });
  });

  // Testes de validação dos dados
  describe('validar()', () => {
    it('não deve lançar erro com dados válidos', () => {
      expect(() => resposta.validar()).not.toThrow();
    });

    it('deve rejeitar perguntaId igual a zero', () => {
      resposta = new Resposta({
        perguntaId: 0,
        autorId: 20,
        conteudo: 'Resposta',
      });

      expect(() => resposta.validar()).toThrow(
        'A pergunta é obrigatória.',
      );
    });

    it('deve rejeitar autorId igual a zero', () => {
      resposta = new Resposta({
        perguntaId: 10,
        autorId: 0,
        conteudo: 'Resposta',
      });

      expect(() => resposta.validar()).toThrow(
        'O autor é obrigatório.',
      );
    });

    it('deve rejeitar conteúdo vazio', () => {
      resposta = new Resposta({
        perguntaId: 10,
        autorId: 20,
        conteudo: '',
      });

      expect(() => resposta.validar()).toThrow(
        'A resposta não pode estar vazia.',
      );
    });

    it('deve rejeitar conteúdo contendo apenas espaços', () => {
      resposta = new Resposta({
        perguntaId: 10,
        autorId: 20,
        conteudo: '     ',
      });

      expect(() => resposta.validar()).toThrow(
        'A resposta não pode estar vazia.',
      );
    });

    it('deve aceitar conteúdo com exatamente 5000 caracteres', () => {
      resposta = new Resposta({
        perguntaId: 10,
        autorId: 20,
        conteudo: 'a'.repeat(CONTEUDO_MAX),
      });

      expect(() => resposta.validar()).not.toThrow();
    });

    it('deve rejeitar conteúdo com mais de 5000 caracteres', () => {
      resposta = new Resposta({
        perguntaId: 10,
        autorId: 20,
        conteudo: 'a'.repeat(CONTEUDO_MAX + 1),
      });

      expect(() => resposta.validar()).toThrow(
        `A resposta deve ter no máximo ${CONTEUDO_MAX} caracteres.`,
      );
    });

    it('deve rejeitar resposta validada sem validador', () => {
      resposta = new Resposta({
        perguntaId: 10,
        autorId: 20,
        conteudo: 'Resposta',
        validada: true,
      });

      expect(() => resposta.validar()).toThrow(
        'Resposta validada precisa registrar quem validou (RN-18).',
      );
    });

    it('deve aceitar resposta validada com validador registrado', () => {
      resposta = new Resposta({
        perguntaId: 10,
        autorId: 20,
        conteudo: 'Resposta',
        validada: true,
        validadaPorId: 30,
      });

      expect(() => resposta.validar()).not.toThrow();
    });

    it('deve acumular erros de pergunta, autor e conteúdo', () => {
      resposta = new Resposta({
        perguntaId: 0,
        autorId: 0,
        conteudo: '',
      });

      let erroCapturado: unknown;

      try {
        resposta.validar();
      } catch (erro: unknown) {
        erroCapturado = erro;
      }

      expect(erroCapturado).toBeInstanceOf(ErroDeValidacao);

      expect((erroCapturado as ErroDeValidacao).erros).toEqual([
        'A pergunta é obrigatória.',
        'O autor é obrigatório.',
        'A resposta não pode estar vazia.',
      ]);
    });
  });

  // Testes de conversão JSON
  describe('fromJSON()', () => {
    it('deve criar uma instância a partir dos dados recebidos', () => {
      const resultado = Resposta.fromJSON({
        id: 5,
        perguntaId: 10,
        autorId: 20,
        conteudo: 'Resposta JSON',
        validada: false,
        oculta: true,
        totalVotosUteis: 3,
      });

      expect(resultado).toBeInstanceOf(Resposta);
      expect(resultado.id).toBe(5);
      expect(resultado.perguntaId).toBe(10);
      expect(resultado.autorId).toBe(20);
      expect(resultado.conteudo).toBe('Resposta JSON');
      expect(resultado.oculta).toBe(true);
      expect(resultado.totalVotosUteis).toBe(3);
    });
  });

  describe('toJSON()', () => {
    it('deve retornar todos os dados da resposta', () => {
      expect(resposta.toJSON()).toEqual({
        id: 1,
        perguntaId: 10,
        autorId: 20,
        conteudo: 'Resposta de teste',
        validada: false,
        validadaPorId: null,
        validadaEm: null,
        oculta: false,
        criadoEm: new Date('2026-01-15T12:00:00.000Z'),
        atualizadoEm: new Date('2026-01-16T12:00:00.000Z'),
        totalVotosUteis: 0,
      });
    });

    it('deve refletir o conteúdo atualizado no JSON', () => {
      resposta.conteudo = 'Conteúdo atualizado';

      expect(resposta.toJSON().conteudo).toBe('Conteúdo atualizado');
    });

    it('deve refletir o estado de validação no JSON', () => {
      resposta.validarPor(30, 'professor');

      const json = resposta.toJSON();

      expect(json.validada).toBe(true);
      expect(json.validadaPorId).toBe(30);
      expect(json.validadaEm).toBeInstanceOf(Date);
    });

    it('deve refletir a ocultação no JSON', () => {
      resposta.ocultar();

      expect(resposta.toJSON().oculta).toBe(true);
    });
  });
});
