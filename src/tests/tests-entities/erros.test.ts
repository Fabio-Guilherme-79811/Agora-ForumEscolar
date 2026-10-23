import {ErroDeValidacao,ErroDePermissao,ErroDeRegraDeNegocio,lancarSeInvalido} from '../../entities/erros';
  
  describe('ErroDeValidacao', () => {
    it('deve guardar a lista de erros e juntar as mensagens com "; "', () => {
      const erro = new ErroDeValidacao(['Nome é obrigatório', 'E-mail inválido']);
  
      expect(erro.erros).toEqual(['Nome é obrigatório', 'E-mail inválido']);
      expect(erro.message).toBe('Nome é obrigatório; E-mail inválido');
    });
  
    it('deve ter name "ErroDeValidacao"', () => {
      expect(new ErroDeValidacao(['x']).name).toBe('ErroDeValidacao');
    });
  
    it('deve ser instância de ErroDeValidacao e de Error (prototype correto)', () => {
      const erro = new ErroDeValidacao(['x']);
  
      expect(erro).toBeInstanceOf(ErroDeValidacao);
      expect(erro).toBeInstanceOf(Error);
      expect(erro).not.toBeInstanceOf(ErroDePermissao);
    });
  
    it('deve funcionar com um único erro (sem separador)', () => {
      expect(new ErroDeValidacao(['Só um']).message).toBe('Só um');
    });
  
    it('deve aceitar lista vazia com mensagem vazia', () => {
      const erro = new ErroDeValidacao([]);
  
      expect(erro.erros).toEqual([]);
      expect(erro.message).toBe('');
    });
  
    it('deve possuir stack trace', () => {
      expect(new ErroDeValidacao(['x']).stack).toBeDefined();
    });
  });
  
  describe('ErroDePermissao', () => {
    it('deve usar a mensagem padrão quando nenhuma é informada', () => {
      const erro = new ErroDePermissao();
  
      expect(erro.message).toBe('Ação não permitida para este perfil.');
      expect(erro.name).toBe('ErroDePermissao');
    });
  
    it('deve usar a mensagem personalizada quando informada', () => {
      expect(new ErroDePermissao('Sem acesso').message).toBe('Sem acesso');
    });
  
    it('deve ser instância de ErroDePermissao e de Error', () => {
      const erro = new ErroDePermissao();
  
      expect(erro).toBeInstanceOf(ErroDePermissao);
      expect(erro).toBeInstanceOf(Error);
      expect(erro).not.toBeInstanceOf(ErroDeValidacao);
    });
  });
  
  describe('ErroDeRegraDeNegocio', () => {
    it('deve guardar a mensagem informada', () => {
      const erro = new ErroDeRegraDeNegocio('Denúncia já finalizada');
  
      expect(erro.message).toBe('Denúncia já finalizada');
      expect(erro.name).toBe('ErroDeRegraDeNegocio');
    });
  
    it('deve ser instância de ErroDeRegraDeNegocio e de Error', () => {
      const erro = new ErroDeRegraDeNegocio('x');
  
      expect(erro).toBeInstanceOf(ErroDeRegraDeNegocio);
      expect(erro).toBeInstanceOf(Error);
      expect(erro).not.toBeInstanceOf(ErroDePermissao);
    });
  });
  
  describe('lancarSeInvalido', () => {
    it('não deve lançar nada quando a lista de erros está vazia', () => {
      expect(() => lancarSeInvalido([])).not.toThrow();
    });
  
    it('deve lançar ErroDeValidacao quando há pelo menos um erro', () => {
      expect(() => lancarSeInvalido(['Campo inválido'])).toThrow(ErroDeValidacao);
    });
  
    it('deve lançar uma única vez, acumulando todos os erros', () => {
      const erros = ['Erro 1', 'Erro 2', 'Erro 3'];
  
      try {
        lancarSeInvalido(erros);
        throw new Error('Deveria ter lançado ErroDeValidacao');
      } catch (e) {
        expect(e).toBeInstanceOf(ErroDeValidacao);
        expect((e as ErroDeValidacao).erros).toEqual(erros);
        expect((e as ErroDeValidacao).message).toBe('Erro 1; Erro 2; Erro 3');
      }
    });
  
    it('deve lançar com a mensagem correta para um único erro', () => {
      expect(() => lancarSeInvalido(['Apenas um'])).toThrow('Apenas um');
    });
  });