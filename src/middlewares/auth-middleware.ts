// TEMPORÁRIO: stub só para o servidor subir. Substituir pelo middleware real.
import { Request, Response, NextFunction } from 'express';

export function carregarUsuarioOpcional(_req: Request, res: Response, next: NextFunction): void {
  res.locals['usuario'] = null;
  next();
}
