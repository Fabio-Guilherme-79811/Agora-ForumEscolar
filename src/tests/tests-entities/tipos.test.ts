import {PERFIS,PERFIS_VALIDADORES,paraData,} from '../../entities/tipos';
import type { Perfil } from '../../entities/tipos';

describe('tipos', () => {
  // Testes de PERFIS
  describe('PERFIS', () => {
    it('deve conter todos os perfis do sistema', () => {
      expect(PERFIS).toEqual([
        'aluno',
        'monitor',
        'professor',
        'admin',
      ]);
    });

    it('deve conter quatro perfis', () => {
      expect(PERFIS).toHaveLength(4);
    });

    it('deve conter o perfil aluno', () => {
      expect(PERFIS).toContain('aluno');
    });

    it('deve conter o perfil monitor', () => {
      expect(PERFIS).toContain('monitor');
    });

    it('deve conter o perfil professor', () => {
      expect(PERFIS).toContain('professor');
    });

    it('deve conter o perfil admin', () => {
      expect(PERFIS).toContain('admin');
    });
  });

  // Testes de PERFIS_VALIDADORES
  describe('PERFIS_VALIDADORES', () => {
    it('deve permitir validação para professor e monitor', () => {
      expect(PERFIS_VALIDADORES).toEqual([
        'professor',
        'monitor',
      ]);
    });

    it('deve conter dois perfis autorizados', () => {
      expect(PERFIS_VALIDADORES).toHaveLength(2);
    });

    it('deve incluir professor entre os validadores', () => {
      expect(PERFIS_VALIDADORES).toContain('professor');
    });

    it('deve incluir monitor entre os validadores', () => {
      expect(PERFIS_VALIDADORES).toContain('monitor');
    });

    it('não deve permitir que aluno valide respostas', () => {
      expect(PERFIS_VALIDADORES).not.toContain('aluno');
    });

    it('não deve permitir que admin valide respostas', () => {
      expect(PERFIS_VALIDADORES).not.toContain('admin');
    });

    it.each(['professor', 'monitor'] as Perfil[])(
      'deve reconhecer %s como perfil validador',
      (perfil) => {
        expect(PERFIS_VALIDADORES.includes(perfil)).toBe(true);
      },
    );
  });

  // Testes de paraData()
  describe('paraData()', () => {
    it('deve retornar null quando não receber valor', () => {
      expect(paraData()).toBeNull();
    });

    it('deve retornar null quando receber null', () => {
      expect(paraData(null)).toBeNull();
    });

    it('deve converter uma string em Date', () => {
      const resultado = paraData('2026-01-15T12:00:00.000Z');

      expect(resultado).toBeInstanceOf(Date);
      expect(resultado?.toISOString()).toBe(
        '2026-01-15T12:00:00.000Z',
      );
    });

    it('deve aceitar um objeto Date', () => {
      const data = new Date('2026-01-15T12:00:00.000Z');
      const resultado = paraData(data);

      expect(resultado).toBeInstanceOf(Date);
      expect(resultado?.getTime()).toBe(data.getTime());
    });

    it('deve converter uma string de data válida', () => {
      const resultado = paraData('2025-12-25');

      expect(resultado).toBeInstanceOf(Date);
      expect(resultado?.getFullYear()).toBe(2025);
      expect(resultado?.getMonth()).toBe(11);
      expect(resultado?.getDate()).toBe(25);
    });

    it('deve retornar uma data inválida como Date quando a string for inválida', () => {
      const resultado = paraData('data-invalida');

      expect(resultado).toBeInstanceOf(Date);
      expect(Number.isNaN(resultado?.getTime())).toBe(true);
    });
  });
});
