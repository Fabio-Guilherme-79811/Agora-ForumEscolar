/** Tipos e helpers compartilhados pelos services. */
import { ErroDePermissao } from '../entities/erros';
import type { UsuarioAutenticado } from '../entities/models/middlewares/types/auth';
import { ErroDeNaoEncontrado } from './erros.service';

/** Usuário autenticado: é exatamente o req.usuario preenchido pelo authGuard (payload do JWT). */
export type Ator = UsuarioAutenticado;

export const JANELA_TERMOMETRO_DIAS = 7;

export function exigirProfessor(ator: Ator): void {
  if (ator.perfil !== 'professor') {
    throw new ErroDePermissao('Ação exclusiva do professor.');
  }
}

export function exigir<T>(valor: T | null | undefined, mensagem: string): T {
  if (valor === null || valor === undefined) throw new ErroDeNaoEncontrado(mensagem);
  return valor;
}

export function exigirId(id: number | undefined, mensagem = 'Registro sem identificador.'): number {
  if (id === undefined) throw new Error(mensagem);
  return id;
}

export function inicioDoDia(data: Date): Date {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function somarDias(data: Date, dias: number): Date {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}