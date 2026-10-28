/**
 * Erros da camada de services (os erros de domínio ficam em entities/erros.ts).
 * O middleware de erro do app.ts usa statusHttpDoErro() para responder sem expor stack trace.
 */
import {
  ErroDePermissao,
  ErroDeRegraDeNegocio,
  ErroDeValidacao,
} from "../entities/erros";

export class ErroDeAutenticacao extends Error {
  constructor(mensagem = "Não autenticado.") {
    super(mensagem);
    this.name = "ErroDeAutenticacao";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErroDeNaoEncontrado extends Error {
  constructor(mensagem = "Recurso não encontrado.") {
    super(mensagem);
    this.name = "ErroDeNaoEncontrado";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Traduz o erro para o status HTTP. Qualquer outro erro é falha interna (500). */
export function statusHttpDoErro(erro: unknown): number {
  if (erro instanceof ErroDeValidacao) return 400;
  if (erro instanceof ErroDeAutenticacao) return 401;
  if (erro instanceof ErroDePermissao) return 403;
  if (erro instanceof ErroDeNaoEncontrado) return 404;
  if (erro instanceof ErroDeRegraDeNegocio) return 409;
  return 500;
}

/** Mensagem segura para o usuário: erros conhecidos mostram o texto; os demais, uma mensagem genérica. */
export function mensagemDoErro(erro: unknown): string {
  if (statusHttpDoErro(erro) === 500)
    return "Erro interno. Tente novamente mais tarde.";
  return (erro as Error).message;
}
