import type { MotivoPontos, RegistroPontosRow } from '../Types';

export interface IRegistroPontosRepository {
  registrar(usuarioId: number, pontos: number, motivo: MotivoPontos, respostaId?: number | null): Promise<void>;
  totalPorUsuario(usuarioId: number): Promise<number>;
  listarPorUsuario(usuarioId: number, limite?: number): Promise<RegistroPontosRow[]>;
}