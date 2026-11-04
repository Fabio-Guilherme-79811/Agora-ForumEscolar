// Linhas cruas do banco. Os services convertem para as classes de src/entities via fromJSON().
export type Perfil = 'aluno' | 'monitor' | 'professor';
export type StatusPergunta = 'aberta' | 'respondida' | 'validada';

export interface UsuarioRow {
  id: number; nome: string; email: string; senha_hash: string; perfil: Perfil;
  turma_id: number | null; foto: string | null; tentativas_login: number;
  bloqueado_ate: Date | null; criado_em: Date;
}
export interface TurmaRow { id: number; nome: string; codigo: string; criado_em: Date }
export interface MateriaRow { id: number; nome: string; turma_id: number }
export interface PerguntaRow {
  id: number; titulo: string; descricao: string; materia_id: number; turma_id: number;
  autor_id: number; anexo: string | null; resolvida: 0 | 1; oculta: 0 | 1;
  criado_em: Date; atualizado_em: Date;
}
/** Pergunta + dados agregados para o feed (RN-12). */
export interface PerguntaFeed extends PerguntaRow {
  autor_nome: string; materia_nome: string;
  total_respostas: number; total_tambem_tenho: number; tem_validada: 0 | 1;
  status: StatusPergunta;
}
export interface RespostaRow {
  id: number; pergunta_id: number; autor_id: number; conteudo: string;
  validada: 0 | 1; validada_por: number | null; validada_em: Date | null;
  oculta: 0 | 1; criado_em: Date;
}
export interface RespostaDetalhe extends RespostaRow {
  autor_nome: string; validador_nome: string | null; total_uteis: number;
}
/** Decisão final do professor: 'mantida' = conteúdo volta/permanece visível; 'removida' = continua oculto. */
export type DecisaoDenuncia = 'mantida' | 'removida';
export interface DenunciaRow {
  id: number; denunciante_id: number; alvo_tipo: 'pergunta' | 'resposta'; alvo_id: number;
  motivo: string; status: 'pendente' | 'revisada'; decisao: DecisaoDenuncia | null;
  revisada_por: number | null; revisada_em: Date | null; criado_em: Date;
}
export interface EstatisticasUsuario { perguntas: number; respostas: number; respostas_validadas: number }
export interface ResultadoFalhaLogin { tentativas: number; bloqueado: boolean }
export type MotivoPontos = 'resposta' | 'voto_util' | 'validacao';
export interface RegistroPontosRow {
  id: number; usuario_id: number; pontos: number; motivo: MotivoPontos;
  resposta_id: number | null; criado_em: Date;
}
export interface TemperaturaMateria { materia_id: number; materia_nome: string; perguntas: number; tambem_tenho: number }

export interface FiltroPerguntas {
  turmaIds: number[];
  materiaId?: number;
  status?: StatusPergunta;
  autorId?: number;          // "minhas perguntas" (RN-11)
  busca?: string;            // título + texto (RN-13)
  incluirOcultas?: boolean;  // só professor
  limite?: number;
  offset?: number;
}
export type NovaPergunta = Pick<PerguntaRow, 'titulo' | 'descricao' | 'materia_id' | 'turma_id' | 'autor_id'> & { anexo?: string | null };
export type NovoUsuario = Pick<UsuarioRow, 'nome' | 'email' | 'senha_hash' | 'turma_id'> & { perfil?: Perfil };