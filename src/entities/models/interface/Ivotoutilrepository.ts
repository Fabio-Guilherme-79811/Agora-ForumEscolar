export interface IVotoUtilRepository {
  adicionar(usuarioId: number, respostaId: number): Promise<boolean>; // false se já votou (UNIQUE)
  remover(usuarioId: number, respostaId: number): Promise<boolean>;
  existe(usuarioId: number, respostaId: number): Promise<boolean>;
  contarPorResposta(respostaId: number): Promise<number>;
}
