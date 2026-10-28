import { ErroDeRegraDeNegocio, lancarSeInvalido } from "./erros";
import { paraData } from "./tipos";

export interface VotoUtilProps {
  id?: number | undefined;
  usuarioId: number;
  respostaId: number;
  criadoEm?: Date | string;
}

/** Banco: UNIQUE(usuario_id, resposta_id). */
export class VotoUtil {
  private _id: number | undefined;
  private _usuarioId: number;
  private _respostaId: number;
  private _criadoEm: Date;

  constructor(p: VotoUtilProps) {
    this._id = p.id;
    this._usuarioId = p.usuarioId;
    this._respostaId = p.respostaId;
    this._criadoEm = paraData(p.criadoEm) ?? new Date();
  }

  get id(): number | undefined {
    return this._id;
  }
  set id(v: number | undefined) {
    this._id = v;
  }
  get usuarioId(): number {
    return this._usuarioId;
  }
  get respostaId(): number {
    return this._respostaId;
  }
  get criadoEm(): Date {
    return this._criadoEm;
  }

  /** RN-16: ninguém vota na própria resposta. */
  static criar(
    usuarioId: number,
    respostaId: number,
    autorDaRespostaId: number,
  ): VotoUtil {
    if (usuarioId === autorDaRespostaId) {
      throw new ErroDeRegraDeNegocio(
        "Você não pode votar na própria resposta.",
      );
    }
    const voto = new VotoUtil({ usuarioId, respostaId });
    voto.validar();
    return voto;
  }

  validar(): void {
    const erros: string[] = [];
    if (!this._usuarioId) erros.push("Usuário inválido.");
    if (!this._respostaId) erros.push("Resposta inválida.");
    lancarSeInvalido(erros);
  }

  static fromJSON(json: VotoUtilProps): VotoUtil {
    return new VotoUtil(json);
  }
  toJSON() {
    return {
      id: this._id,
      usuarioId: this._usuarioId,
      respostaId: this._respostaId,
      criadoEm: this._criadoEm,
    };
  }
}
