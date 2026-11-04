import { lancarSeInvalido } from "./erros";

export interface ProfessorTurmaProps {
  professorId: number;
  turmaId: number;
}

/** RN-03: um professor pode estar em várias turmas (N:N). Chave composta. */
export class ProfessorTurma {
  private _professorId: number;
  private _turmaId: number;

  constructor(p: ProfessorTurmaProps) {
    this._professorId = p.professorId;
    this._turmaId = p.turmaId;
  }

  get professorId(): number {
    return this._professorId;
  }
  set professorId(v: number) {
    this._professorId = v;
  }
  get turmaId(): number {
    return this._turmaId;
  }
  set turmaId(v: number) {
    this._turmaId = v;
  }

  validar(): void {
    const erros: string[] = [];
    if (!Number.isInteger(this._professorId) || this._professorId <= 0)
      erros.push("Professor inválido.");
    if (!Number.isInteger(this._turmaId) || this._turmaId <= 0)
      erros.push("Turma inválida.");
    lancarSeInvalido(erros);
  }

  static fromJSON(json: ProfessorTurmaProps): ProfessorTurma {
    return new ProfessorTurma(json);
  }
  toJSON(): ProfessorTurmaProps {
    return { professorId: this._professorId, turmaId: this._turmaId };
  }
}
