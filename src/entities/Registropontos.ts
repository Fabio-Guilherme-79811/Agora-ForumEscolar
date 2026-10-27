import { lancarSeInvalido } from './erros';
import { paraData } from './tipos';

export type TipoPontuacao = 'resposta' | 'voto_util' | 'validacao';

/** RN-35: resposta +1, voto útil recebido +2, resposta validada +10. */
export const PONTOS_POR_TIPO: Readonly<Record<TipoPontuacao, number>> = {
  resposta: 1,
  voto_util: 2,
  validacao: 10,
};

export interface RegistroPontosProps {
  id?: number | undefined;
  usuarioId: number;
  tipo: TipoPontuacao;
  pontos: number;
  respostaId?: number | null;
  criadoEm?: Date | string;
}

export class RegistroPontos {
  private _id: number | undefined;
  private _usuarioId: number;
  private _tipo: TipoPontuacao;
  private _pontos: number;
  private _respostaId: number | null;
  private _criadoEm: Date;

  constructor(p: RegistroPontosProps) {
    this._id = p.id;
    this._usuarioId = p.usuarioId;
    this._tipo = p.tipo;
    this._pontos = p.pontos;
    this._respostaId = p.respostaId ?? null;
    this._criadoEm = paraData(p.criadoEm) ?? new Date();
  }

  get id(): number | undefined { return this._id; }
  set id(v: number | undefined) { this._id = v; }
  get usuarioId(): number { return this._usuarioId; }
  get tipo(): TipoPontuacao { return this._tipo; }
  get pontos(): number { return this._pontos; }
  get respostaId(): number | null { return this._respostaId; }
  get criadoEm(): Date { return this._criadoEm; }

  /** Fábrica usada pelo pontuacao.service: os pontos vêm sempre da tabela de regras. */
  static paraEvento(usuarioId: number, tipo: TipoPontuacao, respostaId: number | null = null): RegistroPontos {
    const registro = new RegistroPontos({ usuarioId, tipo, pontos: PONTOS_POR_TIPO[tipo], respostaId });
    registro.validar();
    return registro;
  }

  validar(): void {
    const erros: string[] = [];
    if (!this._usuarioId) erros.push('Usuário inválido.');
    if (!(this._tipo in PONTOS_POR_TIPO)) erros.push('Tipo de pontuação inválido.');
    // RN-35: não existe pontuação negativa
    if (!Number.isInteger(this._pontos) || this._pontos < 0) erros.push('Pontuação não pode ser negativa.');
    else if (this._tipo in PONTOS_POR_TIPO && this._pontos !== PONTOS_POR_TIPO[this._tipo]) {
      erros.push('Pontos incompatíveis com o tipo de evento.');
    }
    lancarSeInvalido(erros);
  }

  static fromJSON(json: RegistroPontosProps): RegistroPontos { return new RegistroPontos(json); }
  toJSON() {
    return {
      id: this._id,
      usuarioId: this._usuarioId,
      tipo: this._tipo,
      pontos: this._pontos,
      respostaId: this._respostaId,
      criadoEm: this._criadoEm,
    };
  }
}