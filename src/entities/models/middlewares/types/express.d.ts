import { UsuarioAutenticado } from './auth';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
      /** Definido por escopoPainel: Monitor só enxerga a própria fila (RN-30). */
      escopoFila?: 'completo' | 'proprio';
    }
  }
}

export {};