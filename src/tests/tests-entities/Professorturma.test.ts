import { ProfessorTurma } from '../../entities/Professorturma';
import { ErroDeValidacao } from '../../entities/erros';

describe('validar()', () => {
  let professorTurma: ProfessorTurma;

  beforeEach(() => {
    professorTurma = new ProfessorTurma({
      professorId: 1,
      turmaId: 2,
    });
  });

  it('deve validar IDs corretos', () => {
    expect(() => professorTurma.validar()).not.toThrow();
  });

  it('deve lançar ErroDeValidacao para professor inválido', () => {
    professorTurma.professorId = 0;

    expect(() => professorTurma.validar()).toThrow(ErroDeValidacao);
  });

  it('deve lançar ErroDeValidacao para turma inválida', () => {
    professorTurma.turmaId = -1;

    expect(() => professorTurma.validar()).toThrow(ErroDeValidacao);
  });

  it('deve acumular os erros dos dois campos', () => {
    professorTurma.professorId = 0;
    professorTurma.turmaId = -1;

    let erroCapturado: unknown;
    try {
      professorTurma.validar();
    } catch (erro) {
      erroCapturado = erro;
    }

    expect(erroCapturado).toBeInstanceOf(ErroDeValidacao);
    expect((erroCapturado as ErroDeValidacao).erros).toEqual([
      'Professor inválido.',
      'Turma inválida.',
    ]);
  });
});