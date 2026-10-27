import type { RespostaDetalhe, RespostaRow } from '../Types';

export interface IRespostaRepository {
  criar(perguntaId: number, autorId: number, conteudo: string): Promise<number>;
  buscarPorId(id: number): Promise<RespostaRow | null>;
  listarPorPergunta(perguntaId: number): Promise<RespostaDetalhe[]>; // validada fixada no topo (RN-18)
  /** Atômico. Retorna false se a pergunta já tem outra resposta validada (RN-17). */
  validar(respostaId: number, validadorId: number): Promise<boolean>;
  retirarValidacao(respostaId: number): Promise<void>; // RN-20
  atualizarConteudo(id: number, conteudo: string): Promise<void>;
  excluir(id: number): Promise<void>;
  definirOculta(id: number, oculta: boolean): Promise<void>;
}