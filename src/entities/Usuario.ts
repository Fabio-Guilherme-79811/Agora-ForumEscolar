import {ErroDePermissao, ErroDeRegraDeNegocio, lancarSeInvalido} from './erros';
import {PERFIS, PERFIS_VALIDADORES, paraData} from './tipos';

export const MAX_TENTATIVAS_LOGIN = 5;
export const MINUTOS_BLOQUEIO_LOGIN = 10;
export const TAMANHO_MINIMO_SENHA = 5;

export type Perfil = (typeof PERFIS)[number];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_HASH_BCRYPT = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export interface UsuarioProps {
  id?: number | undefined;
  nome: string;
  email: string;
  senhaHash: string;
  perfil?: Perfil;
  turmaId?: number | null;
  fotoUrl?: string | null;
  tentativasLogin?: number;
  bloqueadoAte?: Date | string | null;
  criadoEm?: Date | string;
}

export class Usuario {
  private _id: number | undefined;
  private _nome: string;
  private _email: string;
  private _senhaHash: string;
  private _perfil: Perfil;
  private _turmaId: number | null;
  private _fotoUrl: string | null;
  private _tentativasLogin: number;
  private _bloqueadoAte: Date | null;
  private _criadoEm: Date;

  constructor(p: UsuarioProps) {
    this._id = p.id;
    this._nome = (p.nome ?? '').trim();
    this._email = (p.email ?? '').trim().toLowerCase();
    this._senhaHash = p.senhaHash ?? '';
    this._perfil = p.perfil ?? 'aluno'; // Todo cadastro entra como Aluno
    this._turmaId = p.turmaId ?? null;
    this._fotoUrl = p.fotoUrl ?? null;
    this._tentativasLogin = p.tentativasLogin ?? 0;
    this._bloqueadoAte = paraData(p.bloqueadoAte);
    this._criadoEm = paraData(p.criadoEm) ?? new Date();
  }

  get id(): number | undefined { return this._id; }
  set id(v: number | undefined) { this._id = v; }
  get nome(): string { return this._nome; }
  set nome(v: string) { this._nome = (v ?? '').trim(); }
  get email(): string { return this._email; }
  set email(v: string) { this._email = (v ?? '').trim().toLowerCase(); }
  /** Somente o hash bcrypt chega aqui*/
  get senhaHash(): string { return this._senhaHash; }
  set senhaHash(v: string) { this._senhaHash = v ?? ''; }
  get perfil(): Perfil { return this._perfil; }
  get turmaId(): number | null { return this._turmaId; }
  set turmaId(v: number | null) { this._turmaId = v; }
  get fotoUrl(): string | null { return this._fotoUrl; }
  set fotoUrl(v: string | null) { this._fotoUrl = v; }
  get tentativasLogin(): number { return this._tentativasLogin; }
  get bloqueadoAte(): Date | null { return this._bloqueadoAte; }
  get criadoEm(): Date { return this._criadoEm; }

  // ---------- regras de perfil ----------
  ehAluno(): boolean { return this._perfil === 'aluno'; }
  ehMonitor(): boolean { return this._perfil === 'monitor'; }
  ehProfessor(): boolean { return this._perfil === 'professor'; }

  /** Professor ou Monitor validam respostas. */
  podeValidarResposta(): boolean { return PERFIS_VALIDADORES.includes(this._perfil); }

    /** Ações exclusivas do Professor. */
  podeAcessarPainelCompleto(): boolean { return this._perfil === 'professor'; }

   /** Só o professor promove; esta entity só garante a transição válida. */
  promoverAMonitor(executor: Perfil): void {
    if (executor !== 'professor') throw new ErroDePermissao('Somente o professor pode promover um Monitor.');
    if (this._perfil !== 'aluno') throw new ErroDeRegraDeNegocio('Apenas alunos podem ser promovidos a Monitor.');
    this._perfil = 'monitor';
  }

   rebaixarParaAluno(executor: Perfil): void {
    if (executor !== 'professor') throw new ErroDePermissao('Somente o professor pode rebaixar um Monitor.');
    if (this._perfil !== 'monitor') throw new ErroDeRegraDeNegocio('O usuário não é Monitor.');
    this._perfil = 'aluno';
  }

    // ---------- controle de tentativas de login  ----------
  estaBloqueado(agora: Date = new Date()): boolean {
    return this._bloqueadoAte !== null && this._bloqueadoAte.getTime() > agora.getTime();
  }

    registrarFalhaLogin(agora: Date = new Date()): void {
    if (this._bloqueadoAte && this._bloqueadoAte.getTime() <= agora.getTime()) {
      // bloqueio anterior expirou: recomeça a contagem
      this._bloqueadoAte = null;
      this._tentativasLogin = 0;
    }
    this._tentativasLogin += 1;
    if (this._tentativasLogin >= MAX_TENTATIVAS_LOGIN) {
      this._bloqueadoAte = new Date(agora.getTime() + MINUTOS_BLOQUEIO_LOGIN * 60_000);
    }
  }

  registrarSucessoLogin(): void {
    this._tentativasLogin = 0;
    this._bloqueadoAte = null;
  }

    // ---------- validação ----------
  /** A regra de 8 caracteres vale para a senha em texto puro, antes do hash (usar no auth.service). */
  static validarSenhaPlana(senha: string): void {
    const erros: string[] = [];
    if (typeof senha !== 'string' || senha.length < TAMANHO_MINIMO_SENHA) {
      erros.push(`A senha deve ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres.`);
    }
    lancarSeInvalido(erros);
  }

  validar(): void {
    const erros: string[] = [];
    if (this._nome.length < 2 || this._nome.length > 100) erros.push('O nome deve ter entre 2 e 100 caracteres.');
    if (!REGEX_EMAIL.test(this._email)) erros.push('E-mail inválido.');
    if (!REGEX_HASH_BCRYPT.test(this._senhaHash)) erros.push('A senha deve ser armazenada como hash bcrypt, nunca em texto puro.');
    if (!PERFIS.includes(this._perfil)) erros.push('Perfil inválido.');
    // Todo aluno/monitor pertence a uma turma (professor/admin podem ter várias via ProfessorTurma)
    if ((this._perfil === 'aluno' || this._perfil === 'monitor') && !this._turmaId) {
      erros.push('Alunos e monitores precisam pertencer a uma turma.');
    }
    lancarSeInvalido(erros);
  }

    // ---------- serialização ----------l
  /** Hidrata a entity (ex.: a partir da linha do banco, já convertida para camelCase). */
  static fromJSON(json: UsuarioProps): Usuario { return new Usuario(json); }

  /** Visão própria/interna. NUNCA inclui senhaHash. */
  toJSON() {
    return {
      id: this._id,
      nome: this._nome,
      email: this._email,
      perfil: this._perfil,
      turmaId: this._turmaId,
      fotoUrl: this._fotoUrl,
      criadoEm: this._criadoEm,
    };
  }

  /** RN-37: perfil público dos colegas, sem e-mail. */
  toPublicJSON() {
    return {
      id: this._id,
      nome: this._nome,
      perfil: this._perfil,
      turmaId: this._turmaId,
      fotoUrl: this._fotoUrl,
    };
  }
}
