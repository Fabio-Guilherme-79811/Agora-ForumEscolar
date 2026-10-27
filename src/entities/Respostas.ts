import { ErroDePermissao, ErroDeRegraDeNegocio, lancarSeInvalido } from './erros';
import { PERFIS_VALIDADORES, Perfil, paraData } from './tipos';

export const CONTEUDO_MAX = 5000;

export interface RespostaProps {
  id?: number;
  perguntaId: number;
  autorId: number;
  conteudo: string;
  validada?: boolean;
  validadaPorId?: number | null;
  validadaEm?: Date | string | null;
  oculta?: boolean;
  criadoEm?: Date | string;
  atualizadoEm?: Date | string;
  totalVotosUteis?: number; // agregado do repository
}

export class Resposta {
  private _id?: number | undefined;
  private _perguntaId: number;
  private _autorId: number;
  private _conteudo: string;
  private _validada: boolean;
  private _validadaPorId: number | null;
  private _validadaEm: Date | null;
  private _oculta: boolean;
  private _criadoEm: Date;
  private _atualizadoEm: Date;
  private _totalVotosUteis: number;

  constructor(p: RespostaProps) {
    this._id = p.id;
    this._perguntaId = p.perguntaId;
    this._autorId = p.autorId;
    this._conteudo = (p.conteudo ?? '').trim();
    this._validada = p.validada ?? false;
    this._validadaPorId = p.validadaPorId ?? null;
    this._validadaEm = paraData(p.validadaEm);
    this._oculta = p.oculta ?? false;
    this._criadoEm = paraData(p.criadoEm) ?? new Date();
    this._atualizadoEm = paraData(p.atualizadoEm) ?? this._criadoEm;
    this._totalVotosUteis = p.totalVotosUteis ?? 0;
  }

  // ---------- getters / setters ----------
  get id(): number | undefined { return this._id; }
  set id(v: number | undefined) { this._id = v; }
  get perguntaId(): number { return this._perguntaId; }
  get autorId(): number { return this._autorId; }
  get conteudo(): string { return this._conteudo; }
  set conteudo(v: string) { this._conteudo = (v ?? '').trim(); }
  get validada(): boolean { return this._validada; }
  get validadaPorId(): number | null { return this._validadaPorId; }
  get validadaEm(): Date | null { return this._validadaEm; }
  get oculta(): boolean { return this._oculta; }
  get criadoEm(): Date { return this._criadoEm; }
  get atualizadoEm(): Date { return this._atualizadoEm; }
  get totalVotosUteis(): number { return this._totalVotosUteis; }
  set totalVotosUteis(v: number) { this._totalVotosUteis = v; }

  // ---------- regras ----------
  /**
   * Só Professor ou Monitor validam.
   * A regra "no máximo 1 validada por pergunta" envolve outras respostas,
   * então é garantida em resposta.service (+ índice único no banco).
   */
  validarPor(validadorId: number, perfil: Perfil, agora: Date = new Date()): void {
    if (!PERFIS_VALIDADORES.includes(perfil)) {
      throw new ErroDePermissao('Somente professor ou monitor podem validar uma resposta.');
    }
    if (this._validada) throw new ErroDeRegraDeNegocio('Esta resposta já está validada.');
    this._validada = true;
    this._validadaPorId = validadorId;
    this._validadaEm = agora;
  }

  /** RN-20: só o Professor retira a validação. */
  retirarValidacao(perfil: Perfil): void {
    if (perfil !== 'professor') throw new ErroDePermissao('Somente o professor pode retirar a validação.');
    if (!this._validada) throw new ErroDeRegraDeNegocio('Esta resposta não está validada.');
    this._validada = false;
    this._validadaPorId = null;
    this._validadaEm = null;
  }

  /** RN-20: resposta validada não pode ser editada nem apagada pelo autor. */
  podeSerEditadaPor(usuarioId: number): boolean {
    return usuarioId === this._autorId && !this._validada;
  }

  ocultar(): void { this._oculta = true; }
  reexibir(): void { this._oculta = false; }

  validar(): void {
    const erros: string[] = [];
    if (!this._perguntaId) erros.push('A pergunta é obrigatória.');
    if (!this._autorId) erros.push('O autor é obrigatório.');
    if (this._conteudo.length === 0) erros.push('A resposta não pode estar vazia.');
    if (this._conteudo.length > CONTEUDO_MAX) erros.push(`A resposta deve ter no máximo ${CONTEUDO_MAX} caracteres.`);
    if (this._validada && !this._validadaPorId) erros.push('Resposta validada precisa registrar quem validou (RN-18).');
    lancarSeInvalido(erros);
  }

  static fromJSON(json: RespostaProps): Resposta { return new Resposta(json); }
  toJSON() {
    return {
      id: this._id,
      perguntaId: this._perguntaId,
      autorId: this._autorId,
      conteudo: this._conteudo,
      validada: this._validada,
      validadaPorId: this._validadaPorId,
      validadaEm: this._validadaEm,
      oculta: this._oculta,
      criadoEm: this._criadoEm,
      atualizadoEm: this._atualizadoEm,
      totalVotosUteis: this._totalVotosUteis,
    };
  }
}
