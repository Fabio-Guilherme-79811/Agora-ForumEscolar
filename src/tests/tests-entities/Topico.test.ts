import {
    Topico,
    NOME_TOPICO_MIN,
    NOME_TOPICO_MAX,
  } from '../../entities/Topico';
  import { ErroDeValidacao } from '../../entities/erros';
  
  const criarTopico = (
    overrides: Partial<ConstructorParameters<typeof Topico>[0]> = {},
  ) =>
    new Topico({
      nome: 'Equações do 2º grau',
      materiaId: 1,
      ...overrides,
    });
  
  describe('Topico', () => {
    describe('construtor e propriedades', () => {
      it('deve criar um tópico com os valores informados', () => {
        const topico = criarTopico({ id: 5 });
  
        expect(topico.id).toBe(5);
        expect(topico.nome).toBe('Equações do 2º grau');
        expect(topico.materiaId).toBe(1);
      });
  
      it('deve permitir criar um tópico sem id', () => {
        const topico = criarTopico();
  
        expect(topico.id).toBeUndefined();
      });
  
      it('deve remover espaços do início e do fim do nome', () => {
        const topico = criarTopico({ nome: '  Funções  ' });
  
        expect(topico.nome).toBe('Funções');
      });
  
      it('deve tratar nome ausente como string vazia', () => {
        const topico = criarTopico({ nome: undefined as unknown as string });
  
        expect(topico.nome).toBe('');
      });
  
      it('deve permitir alterar as propriedades com setters', () => {
        const topico = criarTopico();
  
        topico.id = 10;
        topico.nome = '  Geometria  ';
        topico.materiaId = 3;
  
        expect(topico.id).toBe(10);
        expect(topico.nome).toBe('Geometria');
        expect(topico.materiaId).toBe(3);
      });
  
      it('deve tratar nome nulo no setter como string vazia', () => {
        const topico = criarTopico();
  
        topico.nome = null as unknown as string;
  
        expect(topico.nome).toBe('');
      });
    });
  
    describe('validar', () => {
      it('deve aceitar um tópico válido', () => {
        const topico = criarTopico();
  
        expect(() => topico.validar()).not.toThrow();
      });
  
      it('deve aceitar nome com o tamanho mínimo', () => {
        const topico = criarTopico({ nome: 'a'.repeat(NOME_TOPICO_MIN) });
  
        expect(() => topico.validar()).not.toThrow();
      });
  
      it('deve aceitar nome com o tamanho máximo', () => {
        const topico = criarTopico({ nome: 'a'.repeat(NOME_TOPICO_MAX) });
  
        expect(() => topico.validar()).not.toThrow();
      });
  
      it('deve rejeitar nome com menos caracteres que o mínimo', () => {
        const topico = criarTopico({ nome: 'a'.repeat(NOME_TOPICO_MIN - 1) });
  
        expect(() => topico.validar()).toThrow(ErroDeValidacao);
      });
  
      it('deve rejeitar nome com mais caracteres que o máximo', () => {
        const topico = criarTopico({ nome: 'a'.repeat(NOME_TOPICO_MAX + 1) });
  
        expect(() => topico.validar()).toThrow(ErroDeValidacao);
      });
  
      it('deve rejeitar nome vazio', () => {
        const topico = criarTopico({ nome: '' });
  
        expect(() => topico.validar()).toThrow(ErroDeValidacao);
      });
  
      it('deve rejeitar nome formado só por espaços', () => {
        const topico = criarTopico({ nome: '     ' });
  
        expect(() => topico.validar()).toThrow(ErroDeValidacao);
      });
  
      it('deve contar o tamanho do nome depois de remover os espaços', () => {
        const topico = criarTopico({ nome: '  a  ' });
  
        expect(() => topico.validar()).toThrow(ErroDeValidacao);
      });
  
      it('deve rejeitar materiaId igual a zero', () => {
        const topico = criarTopico({ materiaId: 0 });
  
        expect(() => topico.validar()).toThrow(ErroDeValidacao);
      });
  
      it('deve rejeitar materiaId negativo', () => {
        const topico = criarTopico({ materiaId: -1 });
  
        expect(() => topico.validar()).toThrow(ErroDeValidacao);
      });
  
      it('deve rejeitar materiaId que não seja inteiro', () => {
        const topico = criarTopico({ materiaId: 1.5 });
  
        expect(() => topico.validar()).toThrow(ErroDeValidacao);
      });
  
      it('deve apresentar a mensagem correta para nome inválido', () => {
        const topico = criarTopico({ nome: 'a' });
  
        expect(() => topico.validar()).toThrow(
          `O nome do tópico deve ter entre ${NOME_TOPICO_MIN} e ${NOME_TOPICO_MAX} caracteres.`,
        );
      });
  
      it('deve apresentar a mensagem correta para matéria inválida', () => {
        const topico = criarTopico({ materiaId: 0 });
  
        expect(() => topico.validar()).toThrow(
          'O tópico precisa pertencer a uma matéria.',
        );
      });
  
      it('deve acumular os erros dos dois campos', () => {
        const topico = criarTopico({ nome: '', materiaId: 0 });
  
        let erroCapturado: unknown;
        try {
          topico.validar();
        } catch (erro) {
          erroCapturado = erro;
        }
  
        expect(erroCapturado).toBeInstanceOf(ErroDeValidacao);
        expect((erroCapturado as ErroDeValidacao).erros).toEqual([
          `O nome do tópico deve ter entre ${NOME_TOPICO_MIN} e ${NOME_TOPICO_MAX} caracteres.`,
          'O tópico precisa pertencer a uma matéria.',
        ]);
      });
    });
  
    describe('fromJSON', () => {
      it('deve criar uma instância a partir de um objeto JSON', () => {
        const topico = Topico.fromJSON({
          id: 7,
          nome: '  Probabilidade  ',
          materiaId: 2,
        });
  
        expect(topico).toBeInstanceOf(Topico);
        expect(topico.id).toBe(7);
        expect(topico.nome).toBe('Probabilidade');
        expect(topico.materiaId).toBe(2);
      });
    });
  
    describe('toJSON', () => {
      it('deve serializar todos os dados do tópico', () => {
        const topico = criarTopico({ id: 3 });
  
        expect(topico.toJSON()).toEqual({
          id: 3,
          nome: 'Equações do 2º grau',
          materiaId: 1,
        });
      });
  
      it('deve incluir id como undefined quando não informado', () => {
        const topico = criarTopico();
  
        expect(topico.toJSON()).toEqual({
          id: undefined,
          nome: 'Equações do 2º grau',
          materiaId: 1,
        });
      });
  
      it('deve manter o resultado igual após fromJSON(toJSON())', () => {
        const original = criarTopico({ id: 9 });
        const copia = Topico.fromJSON(original.toJSON());
  
        expect(copia.toJSON()).toEqual(original.toJSON());
      });
    });
  });