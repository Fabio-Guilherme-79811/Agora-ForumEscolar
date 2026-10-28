export interface ITambemTenhoRepository {
  adicionar(usuarioId: number, perguntaId: number): Promise<boolean>; // false se já marcou (UNIQUE)
  remover(usuarioId: number, perguntaId: number): Promise<boolean>;
  existe(usuarioId: number, perguntaId: number): Promise<boolean>;
  contarPorPergunta(perguntaId: number): Promise<number>;
}
