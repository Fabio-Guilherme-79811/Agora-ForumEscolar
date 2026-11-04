import { lancarSeInvalido } from "./erros";

export const NOME_TOPICO_MIN = 2;
export const NOME_TOPICO_MAX = 80;

export interface TopicoProps {
  id?: number | undefined;
  nome: string;
  materiaId: number;
}

/**
 * Assunto dentro de uma matéria (trilha: Matéria > Tópico > Pergunta).
 * Ex.: Matemática > "Equações do 2º grau". Alimenta o termômetro do MVP,
 * que mostra os tópicos que mais acumulam perguntas e dúvidas.
 * Na tabela: UNIQUE(materia_id, nome) para não repetir tópico na mesma matéria.
 */
export class Topico {
  private _id: number | undefined;
  private _nome: string;
  private _materiaId: number;

  constructor(p: TopicoProps) {
    this._id = p.id;
    this._nome = (p.nome ?? "").trim();
    this._materiaId = p.materiaId;
  }

  get id(): number | undefined {
    return this._id;
  }
  set id(v: number | undefined) {
    this._id = v;
  }
  get nome(): string {
    return this._nome;
  }
  set nome(v: string) {
    this._nome = (v ?? "").trim();
  }
  get materiaId(): number {
    return this._materiaId;
  }
  set materiaId(v: number) {
    this._materiaId = v;
  }

  validar(): void {
    const erros: string[] = [];
    if (
      this._nome.length < NOME_TOPICO_MIN ||
      this._nome.length > NOME_TOPICO_MAX
    ) {
      erros.push(
        `O nome do tópico deve ter entre ${NOME_TOPICO_MIN} e ${NOME_TOPICO_MAX} caracteres.`,
      );
    }
    if (!Number.isInteger(this._materiaId) || this._materiaId <= 0) {
      erros.push("O tópico precisa pertencer a uma matéria.");
    }
    lancarSeInvalido(erros);
  }

  static fromJSON(json: TopicoProps): Topico {
    return new Topico(json);
  }
  toJSON() {
    return { id: this._id, nome: this._nome, materiaId: this._materiaId };
  }
}
