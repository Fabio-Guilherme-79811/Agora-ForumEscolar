export interface IProfessorTurmaRepository {
  vincular(professorId: number, turmaId: number): Promise<void>;
  desvincular(professorId: number, turmaId: number): Promise<void>;
  listarTurmaIds(professorId: number): Promise<number[]>; // RN-03
  professorEstaNaTurma(professorId: number, turmaId: number): Promise<boolean>;
}