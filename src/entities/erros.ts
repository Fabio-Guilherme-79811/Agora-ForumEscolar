/**
 * Erros de domínio. Os controllers/middleware de erro (app.ts) devem
 * traduzi-los em respostas HTTP amigáveis (400 / 403 / 409), sem expor stack trace.
 */
export class ErroDeValidacao extends Error {
  public readonly erros: string[];
  constructor(erros: string[]) {
    super(erros.join('; '));
    this.name = 'ErroDeValidacao';
    this.erros = erros;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErroDePermissao extends Error {
  constructor(mensagem = 'Ação não permitida para este perfil.') {
    super(mensagem);
    this.name = 'ErroDePermissao';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErroDeRegraDeNegocio extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDeRegraDeNegocio';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Padrão usado em todos os validar(): acumula erros e lança uma única vez. */
export function lancarSeInvalido(erros: string[]): void {
  if (erros.length > 0) throw new ErroDeValidacao(erros);
} 
