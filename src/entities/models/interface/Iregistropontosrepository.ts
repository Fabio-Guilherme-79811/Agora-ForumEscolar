import type { MotivoPontos, RegistroPontosRow } from '../Types';

export interface IRegistroPontosRepository {
  registrar(usuarioId: number, pontos: number, motivo: MotivoPontos, respostaId?: number | null): Promise<void>;
  /** Desfaz UM registro (o mais recente) do mesmo usuário/motivo/resposta. Nunca cria pontos negativos (RN-35). */
  removerUm(usuarioId: number, motivo: MotivoPontos, respostaId: number | null): Promise<boolean>;
  totalPorUsuario(usuarioId: number): Promise<number>;
  listarPorUsuario(usuarioId: number, limite?: number): Promise<RegistroPontosRow[]>;
}