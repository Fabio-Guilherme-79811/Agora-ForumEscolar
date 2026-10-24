import { run, select, selectOne } from './DbConnection';
import type { IRegistroPontosRepository } from './interface/Iregistropontosrepository';
import type { MotivoPontos, RegistroPontosRow } from './Types';

export class RegistroPontosRepository implements IRegistroPontosRepository {
  async registrar(usuarioId: number, pontos: number, motivo: MotivoPontos, respostaId: number | null = null) {
    if (pontos < 0) throw new Error('Pontuação negativa não é permitida (RN-35).');
    await run('INSERT INTO registropontos (usuario_id, pontos, motivo, resposta_id) VALUES (?, ?, ?, ?)', [usuarioId, pontos, motivo, respostaId]);
  }
  async totalPorUsuario(usuarioId: number) {
    const r = await selectOne<{ total: string | null }>('SELECT SUM(pontos) AS total FROM registropontos WHERE usuario_id = ?', [usuarioId]);
    return Number(r?.total ?? 0);
  }
  listarPorUsuario(usuarioId: number, limite = 50) {
    return select<RegistroPontosRow>('SELECT * FROM registropontos WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT ?', [usuarioId, limite]);
  }
}