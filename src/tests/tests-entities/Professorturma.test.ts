
import { ProfessorTurma } from '../../entities/Professorturma';

describe('ProfessorTurma', () => {
  describe('Construtor', () => {
    it('deve criar uma associação entre professor e turma', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: 2,
      });

      expect(professorTurma.professorId).toBe(1);
      expect(professorTurma.turmaId).toBe(2);
    });
  });

  describe('Getters e Setters', () => {
    it('deve retornar o professorId corretamente', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: 2,
      });

      expect(professorTurma.professorId).toBe(1);
    });

    it('deve permitir alterar o professorId', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: 2,
      });

      professorTurma.professorId = 3;

      expect(professorTurma.professorId).toBe(3);
    });

    it('deve retornar o turmaId corretamente', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: 2,
      });

      expect(professorTurma.turmaId).toBe(2);
    });

    it('deve permitir alterar o turmaId', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: 2,
      });

      professorTurma.turmaId = 4;

      expect(professorTurma.turmaId).toBe(4);
    });
  });

  describe('validar()', () => {
    it('não deve lançar erro para IDs válidos', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: 2,
      });

      expect(() => professorTurma.validar()).not.toThrow();
    });

    it('deve lançar erro quando professorId for zero', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 0,
        turmaId: 2,
      });

      expect(() => professorTurma.validar()).toThrow();
    });

    it('deve lançar erro quando turmaId for zero', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: 0,
      });

      expect(() => professorTurma.validar()).toThrow();
    });

    it('deve lançar erro quando professorId for negativo', () => {
      const professorTurma = new ProfessorTurma({
        professorId: -1,
        turmaId: 2,
      });

      expect(() => professorTurma.validar()).toThrow();
    });

    it('deve lançar erro quando turmaId for negativo', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: -2,
      });

      expect(() => professorTurma.validar()).toThrow();
    });

    it('deve lançar erro quando professorId não for inteiro', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1.5,
        turmaId: 2,
      });

      expect(() => professorTurma.validar()).toThrow();
    });

    it('deve lançar erro quando turmaId não for inteiro', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 1,
        turmaId: 2.5,
      });

      expect(() => professorTurma.validar()).toThrow();
    });

    it('deve lançar erro quando os dois IDs forem inválidos', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 0,
        turmaId: -1,
      });

      expect(() => professorTurma.validar()).toThrow();
    });

    it('deve validar novamente após a alteração dos IDs', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 0,
        turmaId: 2,
      });

      expect(() => professorTurma.validar()).toThrow();

      professorTurma.professorId = 1;

      expect(() => professorTurma.validar()).not.toThrow();
    });
  });

  describe('fromJSON()', () => {
    it('deve criar uma instância a partir de um objeto JSON', () => {
      const json = {
        professorId: 5,
        turmaId: 10,
      };

      const professorTurma = ProfessorTurma.fromJSON(json);

      expect(professorTurma).toBeInstanceOf(ProfessorTurma);
      expect(professorTurma.professorId).toBe(5);
      expect(professorTurma.turmaId).toBe(10);
    });
  });

  describe('toJSON()', () => {
    it('deve converter a instância para um objeto JSON', () => {
      const professorTurma = new ProfessorTurma({
        professorId: 3,
        turmaId: 7,
      });

      expect(professorTurma.toJSON()).toEqual({
        professorId: 3,
        turmaId: 7,
      });
    });
  });
});
