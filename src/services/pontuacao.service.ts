/** RN-35: resposta +1, voto útil recebido +2, resposta validada +10. Nunca há pontuação negativa. */
import { RegistroPontos, TipoPontuacao } from '../entities/Registropontos';
import type { IRegistroPontosRepository } from '../entities/models/interface/Iregistropontosrepository';

export class PontuacaoService {
  constructor(private readonly pontosRepo: IRegistroPontosRepository) {}

  /** Os pontos vêm sempre da tabela de regras (PONTOS_POR_TIPO), nunca do chamador. */
  async registrar(usuarioId: number, tipo: TipoPontuacao, respostaId: number | null = null): Promise<void> {
    const registro = RegistroPontos.paraEvento(usuarioId, tipo, respostaId);
    await this.pontosRepo.registrar(usuarioId, registro.pontos, registro.tipo, registro.respostaId);
  }

  total(usuarioId: number): Promise<number> {
    return this.pontosRepo.totalPorUsuario(usuarioId);
  }
}