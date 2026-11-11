
import {Denuncia,LIMITE_DENUNCIAS_PARA_OCULTAR,} from '../../entities/Denuncia';
import type { DenunciaProps } from '../../entities/Denuncia';
import { ErroDePermissao, ErroDeRegraDeNegocio } from '../../entities/erros';
  
  describe('Classe Denuncia', () => {
    const dadosValidos: DenunciaProps = {
      denuncianteId: 1,
      tipoAlvo: 'pergunta',
      alvoId: 10,
      motivo: 'Conteúdo inadequado',
    };
  
    describe('Construtor', () => {
      it('deve criar uma denúncia com os valores informados', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        expect(denuncia.denuncianteId).toBe(1);
        expect(denuncia.tipoAlvo).toBe('pergunta');
        expect(denuncia.alvoId).toBe(10);
        expect(denuncia.motivo).toBe('Conteúdo inadequado');
      });
  
      it('deve usar os valores padrão quando opcionais não forem informados', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        expect(denuncia.status).toBe('pendente');
        expect(denuncia.decisao).toBeNull();
        expect(denuncia.revisadaPorId).toBeNull();
        expect(denuncia.revisadaEm).toBeNull();
        expect(denuncia.criadoEm).toBeInstanceOf(Date);
        expect(denuncia.id).toBeUndefined();
      });
  
      it('deve remover espaços extras do motivo', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          motivo: '  Motivo válido  ',
        });
  
        expect(denuncia.motivo).toBe('Motivo válido');
      });
  
      it('deve aceitar um ID informado', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          id: 25,
        });
  
        expect(denuncia.id).toBe(25);
      });
    });
  
    describe('Atributos modificáveis', () => {
      it('deve permitir alterar o ID', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        denuncia.id = 50;
  
        expect(denuncia.id).toBe(50);
      });
  
      it('deve remover espaços extras ao alterar o motivo', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        denuncia.motivo = '  Novo motivo  ';
  
        expect(denuncia.motivo).toBe('Novo motivo');
      });
  
      it('deve aceitar motivo vazio no setter, deixando a validação verificar o erro', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        denuncia.motivo = '';
  
        expect(denuncia.motivo).toBe('');
        expect(() => denuncia.validar()).toThrow(
          'O motivo deve ter entre 5 e 500 caracteres.',
        );
      });
    });
  
    describe('atingiuLimite', () => {
      it('deve definir o limite como 3 denúncias', () => {
        expect(LIMITE_DENUNCIAS_PARA_OCULTAR).toBe(3);
      });
  
      it('não deve atingir o limite com zero denúncias', () => {
        expect(Denuncia.atingiuLimite(0)).toBe(false);
      });
  
      it('não deve atingir o limite com duas denúncias', () => {
        expect(Denuncia.atingiuLimite(2)).toBe(false);
      });
  
      it('deve atingir o limite com três denúncias', () => {
        expect(Denuncia.atingiuLimite(3)).toBe(true);
      });
  
      it('deve continuar indicando o limite acima de três denúncias', () => {
        expect(Denuncia.atingiuLimite(4)).toBe(true);
      });
    });
  
    describe('revisar', () => {
      it('deve permitir que um professor revise uma denúncia', () => {
        const denuncia = new Denuncia(dadosValidos);
        const dataRevisao = new Date('2026-01-15T12:00:00Z');
  
        denuncia.revisar(
          7,
          'professor',
          'mantida_oculta',
          dataRevisao,
        );
  
        expect(denuncia.status).toBe('revisada');
        expect(denuncia.decisao).toBe('mantida_oculta');
        expect(denuncia.revisadaPorId).toBe(7);
        expect(denuncia.revisadaEm).toBe(dataRevisao);
      });
  
      it('deve permitir a decisão de restaurar o conteúdo', () => {
        const denuncia = new Denuncia(dadosValidos);
        const dataRevisao = new Date('2026-02-01T10:00:00Z');
  
        denuncia.revisar(
          8,
          'professor',
          'restaurada',
          dataRevisao,
        );
  
        expect(denuncia.decisao).toBe('restaurada');
        expect(denuncia.revisadaPorId).toBe(8);
      });
  
      it('deve impedir que um aluno revise uma denúncia', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        expect(() =>
          denuncia.revisar(2, 'aluno' as any, 'restaurada'),
        ).toThrow(ErroDePermissao);
      });
  
      it('deve impedir que um administrador revise uma denúncia', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        expect(() =>
          denuncia.revisar(3, 'administrador' as any, 'restaurada'),
        ).toThrow(ErroDePermissao);
      });
  
      it('deve impedir uma segunda revisão', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        denuncia.revisar(7, 'professor', 'restaurada');
  
        expect(() =>
          denuncia.revisar(8, 'professor', 'mantida_oculta'),
        ).toThrow(ErroDeRegraDeNegocio);
      });
  
      it('deve informar o motivo da falta de permissão', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        expect(() =>
          denuncia.revisar(2, 'aluno' as any, 'restaurada'),
        ).toThrow('Somente o professor pode moderar denúncias.');
      });
  
      it('deve informar que a denúncia já foi revisada', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        denuncia.revisar(7, 'professor', 'restaurada');
  
        expect(() =>
          denuncia.revisar(7, 'professor', 'restaurada'),
        ).toThrow('Esta denúncia já foi revisada.');
      });
    });
  
    describe('validar', () => {
      it('não deve lançar erro quando os dados forem válidos', () => {
        const denuncia = new Denuncia(dadosValidos);
  
        expect(() => denuncia.validar()).not.toThrow();
      });
  
      it('deve rejeitar denunciante com ID zero', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          denuncianteId: 0,
        });
  
        expect(() => denuncia.validar()).toThrow(
          'Denunciante inválido.',
        );
      });
  
      it('deve rejeitar tipo de conteúdo inválido', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          tipoAlvo: 'comentario' as any,
        });
  
        expect(() => denuncia.validar()).toThrow(
          'Tipo de conteúdo inválido.',
        );
      });
  
      it('deve rejeitar conteúdo com ID zero', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          alvoId: 0,
        });
  
        expect(() => denuncia.validar()).toThrow(
          'Conteúdo denunciado inválido.',
        );
      });
  
      it('deve rejeitar motivo com menos de 5 caracteres', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          motivo: 'Ruim',
        });
  
        expect(() => denuncia.validar()).toThrow(
          'O motivo deve ter entre 5 e 500 caracteres.',
        );
      });
  
      it('deve rejeitar motivo com mais de 500 caracteres', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          motivo: 'a'.repeat(501),
        });
  
        expect(() => denuncia.validar()).toThrow(
          'O motivo deve ter entre 5 e 500 caracteres.',
        );
      });
  
      it('deve aceitar motivo com exatamente 5 caracteres', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          motivo: '12345',
        });
  
        expect(() => denuncia.validar()).not.toThrow();
      });
  
      it('deve aceitar motivo com exatamente 500 caracteres', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          motivo: 'a'.repeat(500),
        });
  
        expect(() => denuncia.validar()).not.toThrow();
      });
  
      it('deve rejeitar vários campos inválidos de uma vez', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          denuncianteId: 0,
          tipoAlvo: 'invalido' as any,
          alvoId: 0,
          motivo: 'abc',
        });
  
        expect(() => denuncia.validar()).toThrow(
          'Denunciante inválido.',
        );
        expect(() => denuncia.validar()).toThrow(
          'Tipo de conteúdo inválido.',
        );
        expect(() => denuncia.validar()).toThrow(
          'Conteúdo denunciado inválido.',
        );
        expect(() => denuncia.validar()).toThrow(
          'O motivo deve ter entre 5 e 500 caracteres.',
        );
      });
    });
  
    describe('fromJSON e toJSON', () => {
      it('deve criar uma denúncia a partir de um objeto JSON', () => {
        const denuncia = Denuncia.fromJSON({
          ...dadosValidos,
          id: 12,
        });
  
        expect(denuncia).toBeInstanceOf(Denuncia);
        expect(denuncia.id).toBe(12);
        expect(denuncia.motivo).toBe('Conteúdo inadequado');
      });
  
      it('deve converter a denúncia para um objeto com os seus dados', () => {
        const denuncia = new Denuncia({
          ...dadosValidos,
          id: 12,
        });
  
        const json = denuncia.toJSON();
  
        expect(json).toEqual({
          id: 12,
          denuncianteId: 1,
          tipoAlvo: 'pergunta',
          alvoId: 10,
          motivo: 'Conteúdo inadequado',
          status: 'pendente',
          decisao: null,
          revisadaPorId: null,
          revisadaEm: null,
          criadoEm: denuncia.criadoEm,
        });
      });
  
      it('deve preservar os dados de revisão na conversão', () => {
        const dataRevisao = new Date('2026-03-10T12:00:00Z');
  
        const denuncia = new Denuncia({
          ...dadosValidos,
          status: 'revisada',
          decisao: 'restaurada',
          revisadaPorId: 9,
          revisadaEm: dataRevisao,
        });
  
        const json = denuncia.toJSON();
  
        expect(json.status).toBe('revisada');
        expect(json.decisao).toBe('restaurada');
        expect(json.revisadaPorId).toBe(9);
        expect(json.revisadaEm).toEqual(dataRevisao);
      });
    });
  });
  