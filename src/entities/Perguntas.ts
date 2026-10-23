import { ErroDePermissao, lancarSeInvalido } from './erros';
import { paraData } from './tipos';

export const TITULO_MIN = 10; 
export const TITULO_MAX = 120; 
export const DESCRICAO_MIN = 20; 
export const LIMITE_PERGUNTAS_POR_DIA = 5; //(aplicado no pergunta.service)
export const LIMITE_TAMBEM_TENHO_DESTAQUE = 5; 

export type StatusPergunta = 'aberta' | 'respondida' | 'validada';

export interface PerguntaProps {
  id?: number;
  titulo: string;
  descricao: string;
  materiaId: number;
  turmaId: number;
  autorId: number;
  anexoUrl?: string | null;
  resolvidaPeloAutor?: boolean;
  oculta?: boolean;
  criadoEm?: Date | string;
  atualizadoEm?: Date | string;
  // agregados preenchidos pelo repository (COUNT/JOIN), não são colunas da tabela:
  totalRespostas?: number;
  totalDuvidaCompartilhada?: number;
  temRespostaValidada?: boolean;
}

export class Pergunta {
  private _id?: number | undefined;
  private _titulo: string;
  private _descricao: string;
  private _materiaId: number;
  private _turmaId: number;
  private _autorId: number;
  private _anexoUrl: string | null;
  private _resolvidaPeloAutor: boolean;
  private _oculta: boolean;
  private _criadoEm: Date;
  private _atualizadoEm: Date;
  private _totalRespostas: number;
  private _totalDuvidaCompartilhada: number;
  private _temRespostaValidada: boolean;

  constructor(p: PerguntaProps) {
    this._id = p.id;
    this._titulo = (p.titulo ?? '').trim();
    this._descricao = (p.descricao ?? '').trim();
    this._materiaId = p.materiaId;
    this._turmaId = p.turmaId;
    this._autorId = p.autorId;
    this._anexoUrl = p.anexoUrl ?? null;
    this._resolvidaPeloAutor = p.resolvidaPeloAutor ?? false;
    this._oculta = p.oculta ?? false;
    this._criadoEm = paraData(p.criadoEm) ?? new Date();
    this._atualizadoEm = paraData(p.atualizadoEm) ?? this._criadoEm;
    this._totalRespostas = p.totalRespostas ?? 0;
    this._totalDuvidaCompartilhada = p.totalDuvidaCompartilhada ?? 0;
    this._temRespostaValidada = p.temRespostaValidada ?? false;
  }

  // ---------- getters / setters ----------
  get id(): number | undefined { return this._id; }
  set id(v: number | undefined) { this._id = v; }
  get titulo(): string { return this._titulo; }
  set titulo(v: string) { this._titulo = (v ?? '').trim(); }
  get descricao(): string { return this._descricao; }
  set descricao(v: string) { this._descricao = (v ?? '').trim(); }
  get materiaId(): number { return this._materiaId; }
  set materiaId(v: number) { this._materiaId = v; }
  get turmaId(): number { return this._turmaId; }
  get autorId(): number { return this._autorId; }
  get anexoUrl(): string | null { return this._anexoUrl; }
  set anexoUrl(v: string | null) { this._anexoUrl = v; }
  get resolvidaPeloAutor(): boolean { return this._resolvidaPeloAutor; }
  get oculta(): boolean { return this._oculta; }
  get criadoEm(): Date { return this._criadoEm; }
  get atualizadoEm(): Date { return this._atualizadoEm; }
  get totalRespostas(): number { return this._totalRespostas; }
  set totalRespostas(v: number) { this._totalRespostas = v; }
  get totalDuvidaCompartilhada(): number { return this._totalDuvidaCompartilhada; }
  set totalDuvidaCompartilhada(v: number) { this._totalDuvidaCompartilhada = v; }
  get temRespostaValidada(): boolean { return this._temRespostaValidada; }
  set temRespostaValidada(v: boolean) { this._temRespostaValidada = v; }

  // ---------- regras ----------
  /** aberta → respondida → validada. "Resolvida pelo autor" NÃO é validação (RN-19). */
  get status(): StatusPergunta {
    if (this._temRespostaValidada) return 'validada';
    if (this._totalRespostas > 0) return 'respondida';
    return 'aberta';
  }

  /** "também tenho" sem resposta validada → destaque + alerta ao professor. */
  precisaDestaque(): boolean {
    return !this._temRespostaValidada && this._totalDuvidaCompartilhada >= LIMITE_TAMBEM_TENHO_DESTAQUE;
  }

  /** o autor edita/exclui enquanto não houver respostas. */
  podeSerEditadaPor(usuarioId: number): boolean {
    return usuarioId === this._autorId && this._totalRespostas === 0;
  }

  /** só o autor marca como resolvida. */
  marcarComoResolvida(usuarioId: number): void {
    if (usuarioId !== this._autorId) throw new ErroDePermissao('Somente o autor pode marcar a pergunta como resolvida.');
    this._resolvidaPeloAutor = true;
  }

  /** ocultada automaticamente com 3 denúncias, até o professor revisar. */
  ocultar(): void { this._oculta = true; }
  reexibir(): void { this._oculta = false; }

  validar(): void {
    const erros: string[] = [];
    if (this._titulo.length < TITULO_MIN || this._titulo.length > TITULO_MAX) {
      erros.push(`O título deve ter entre ${TITULO_MIN} e ${TITULO_MAX} caracteres.`);
    }
    if (this._descricao.length < DESCRICAO_MIN) {
      erros.push(`A descrição deve ter no mínimo ${DESCRICAO_MIN} caracteres.`);
    }
    if (!this._materiaId) erros.push('A matéria é obrigatória.');
    if (!this._turmaId) erros.push('A turma é obrigatória.');
    if (!this._autorId) erros.push('O autor é obrigatório.');
    lancarSeInvalido(erros);
  }

  static fromJSON(json: PerguntaProps): Pergunta { return new Pergunta(json); }
  toJSON() {
    return {
      id: this._id,
      titulo: this._titulo,
      descricao: this._descricao,
      materiaId: this._materiaId,
      turmaId: this._turmaId,
      autorId: this._autorId,
      anexoUrl: this._anexoUrl,
      resolvidaPeloAutor: this._resolvidaPeloAutor,
      oculta: this._oculta,
      criadoEm: this._criadoEm,
      atualizadoEm: this._atualizadoEm,
      totalRespostas: this._totalRespostas,
      totalDuvidaCompartilhada: this._totalDuvidaCompartilhada,
      status: this.status,
      destaque: this.precisaDestaque(),
    };
  }
}
