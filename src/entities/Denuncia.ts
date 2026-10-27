import { ErroDePermissao, ErroDeRegraDeNegocio, lancarSeInvalido } from './erros';
import { Perfil, paraData } from './tipos';

export const LIMITE_DENUNCIAS_PARA_OCULTAR = 3; 

export type TipoAlvoDenuncia = 'pergunta' | 'resposta';
export type StatusDenuncia = 'pendente' | 'revisada';
export type DecisaoDenuncia = 'mantida_oculta' | 'restaurada';

export interface DenunciaProps {
  id?: number;
  denuncianteId: number;
  tipoAlvo: TipoAlvoDenuncia;
  alvoId: number;
  motivo: string;
  status?: StatusDenuncia;
  decisao?: DecisaoDenuncia | null;
  revisadaPorId?: number | null;
  revisadaEm?: Date | string | null;
  criadoEm?: Date | string;
}

export class Denuncia {
  private _id?: number | undefined;
  private _denuncianteId: number;
  private _tipoAlvo: TipoAlvoDenuncia;
  private _alvoId: number;
  private _motivo: string;
  private _status: StatusDenuncia;
  private _decisao: DecisaoDenuncia | null;
  private _revisadaPorId: number | null;
  private _revisadaEm: Date | null;
  private _criadoEm: Date;

  constructor(p: DenunciaProps) {
    this._id = p.id;
    this._denuncianteId = p.denuncianteId;
    this._tipoAlvo = p.tipoAlvo;
    this._alvoId = p.alvoId;
    this._motivo = (p.motivo ?? '').trim();
    this._status = p.status ?? 'pendente';
    this._decisao = p.decisao ?? null;
    this._revisadaPorId = p.revisadaPorId ?? null;
    this._revisadaEm = paraData(p.revisadaEm);
    this._criadoEm = paraData(p.criadoEm) ?? new Date();
  }

  get id(): number | undefined { return this._id; }
  set id(v: number | undefined) { this._id = v; }
  get denuncianteId(): number { return this._denuncianteId; }
  get tipoAlvo(): TipoAlvoDenuncia { return this._tipoAlvo; }
  get alvoId(): number { return this._alvoId; }
  get motivo(): string { return this._motivo; }
  set motivo(v: string) { this._motivo = (v ?? '').trim(); }
  get status(): StatusDenuncia { return this._status; }
  get decisao(): DecisaoDenuncia | null { return this._decisao; }
  get revisadaPorId(): number | null { return this._revisadaPorId; }
  get revisadaEm(): Date | null { return this._revisadaEm; }
  get criadoEm(): Date { return this._criadoEm; }

  /** RN-05: com 3 denúncias o item fica oculto até revisão (decisão feita no denuncia.service). */
  static atingiuLimite(totalDenunciasPendentes: number): boolean {
    return totalDenunciasPendentes >= LIMITE_DENUNCIAS_PARA_OCULTAR;
  }

  /** RN-15/UC-15: só o Professor revisa denúncias. */
  revisar(professorId: number, perfil: Perfil, decisao: DecisaoDenuncia, agora: Date = new Date()): void {
    if (perfil !== 'professor') throw new ErroDePermissao('Somente o professor pode moderar denúncias.');
    if (this._status === 'revisada') throw new ErroDeRegraDeNegocio('Esta denúncia já foi revisada.');
    this._status = 'revisada';
    this._decisao = decisao;
    this._revisadaPorId = professorId;
    this._revisadaEm = agora;
  }

  validar(): void {
    const erros: string[] = [];
    if (!this._denuncianteId) erros.push('Denunciante inválido.');
    if (this._tipoAlvo !== 'pergunta' && this._tipoAlvo !== 'resposta') erros.push('Tipo de conteúdo inválido.');
    if (!this._alvoId) erros.push('Conteúdo denunciado inválido.');
    if (this._motivo.length < 5 || this._motivo.length > 500) erros.push('O motivo deve ter entre 5 e 500 caracteres.');
    lancarSeInvalido(erros);
  }

  static fromJSON(json: DenunciaProps): Denuncia { return new Denuncia(json); }
  toJSON() {
    return {
      id: this._id,
      denuncianteId: this._denuncianteId,
      tipoAlvo: this._tipoAlvo,
      alvoId: this._alvoId,
      motivo: this._motivo,
      status: this._status,
      decisao: this._decisao,
      revisadaPorId: this._revisadaPorId,
      revisadaEm: this._revisadaEm,
      criadoEm: this._criadoEm,
    };
  }
}
