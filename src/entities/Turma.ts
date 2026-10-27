import { genSaltSync } from 'bcryptjs';
import { lancarSeInvalido } from './erros';
import { paraData } from './tipos';

export interface TurmaProps {
  id?: number | undefined;
  nome: string;
  codigo: string;
  codigoGeradoEm?: Date | string;
  criadoEm?: Date | string;
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; /*(evita confusão)*/
const FORMATO_CODIGO = /^[A-Z0-9]{6,10}$/;

export class Turma {
  private _id: number | undefined;
  private _nome: string;
  private _codigo: string;
  private _codigoGeradoEm: Date;
  private _criadoEm: Date;

  constructor(p: TurmaProps) {
    this._id = p.id;
    this._nome = (p.nome ?? '').trim();
    this._codigo = (p.codigo ?? '').trim().toUpperCase();
    this._codigoGeradoEm = paraData(p.codigoGeradoEm) ?? new Date();
    this._criadoEm = paraData(p.criadoEm) ?? new Date();
  }

  get id(): number | undefined { return this._id; }
  set id(v: number | undefined) { this._id = v; }
  get nome(): string { return this._nome; }
  set nome(v: string) { this._nome = (v ?? '').trim(); }
  get codigo(): string { return this._codigo; }
  get codigoGeradoEm(): Date { return this._codigoGeradoEm; }
  get criadoEm(): Date { return this._criadoEm; }

  static gerarCodigo(tamanho = 8): string {
    let codigo = '';
    while (codigo.length < tamanho) {
      const aleatorio = genSaltSync(4).slice(7).toUpperCase();
      for (const caractere of aleatorio) {
        if (ALFABETO.includes(caractere)) codigo += caractere;
      }
    }
    return codigo.slice(0, tamanho);
  }

  regenerarCodigo(agora: Date = new Date()): string {
    this._codigo = Turma.gerarCodigo();
    this._codigoGeradoEm = agora;
    return this._codigo;
  }

  /* código inválido bloqueia o cadastro. */
  aceitaCodigo(codigoInformado: string): boolean {
    return (codigoInformado ?? '').trim().toUpperCase() === this._codigo;
  }

  validar(): void {
    const erros: string[] = [];
    if (this._nome.length < 2 || this._nome.length > 60) {
      erros.push('O nome da turma deve ter entre 2 e 60 caracteres.');
    }
    if (!FORMATO_CODIGO.test(this._codigo)) {
      erros.push('O código da turma deve ter de 6 a 10 caracteres alfanuméricos.');
    }
    lancarSeInvalido(erros);
  }

  static fromJSON(json: TurmaProps): Turma { return new Turma(json); }
  toJSON() {
    return {
      id: this._id,
      nome: this._nome,
      codigo: this._codigo,
      codigoGeradoEm: this._codigoGeradoEm,
      criadoEm: this._criadoEm,
    };
  }
}