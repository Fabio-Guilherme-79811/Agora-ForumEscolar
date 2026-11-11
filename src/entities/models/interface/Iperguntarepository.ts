import type {
  FiltroPerguntas,
  NovaPergunta,
  PerguntaFeed,
  PerguntaRow,
  TemperaturaMateria,
} from "../Types";

export interface IPerguntaRepository {
  criar(dados: NovaPergunta): Promise<number>;
  buscarPorId(id: number): Promise<PerguntaFeed | null>;
  listar(filtro: FiltroPerguntas): Promise<PerguntaFeed[]>; // ordem RN-10
  buscarSimilares(
    turmaId: number,
    titulo: string,
    limite?: number,
  ): Promise<PerguntaFeed[]>; // RN-23
  contarPublicadasHoje(autorId: number): Promise<number>; // RN-24
  atualizar(
    id: number,
    dados: Partial<
      Pick<PerguntaRow, "titulo" | "descricao" | "materia_id" | "anexo">
    >,
  ): Promise<void>;
  excluir(id: number): Promise<void>;
  marcarResolvida(id: number, resolvida: boolean): Promise<void>; // RN-19
  definirOculta(id: number, oculta: boolean): Promise<void>;
  filaSemValidacao(
    turmaIds: number[],
    limite?: number,
  ): Promise<PerguntaFeed[]>; // RN-31
  temperaturaPorMateria(
    turmaIds: number[],
    desde: Date,
  ): Promise<TemperaturaMateria[]>; // RN-26
  tempoMedioAteValidacaoMin(
    turmaIds: number[],
    desde: Date,
  ): Promise<number | null>; // RN-33
}
