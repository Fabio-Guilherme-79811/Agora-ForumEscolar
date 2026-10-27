import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import multer, { MulterError } from 'multer';
import path from 'path';

const LIMITE_BYTES = 5 * 1024 * 1024; // RN-22: 5 MB

// mimetype -> extensão que o SERVIDOR escolhe (nunca confiamos no nome enviado)
const TIPOS_ACEITOS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};
const EXTENSOES_ACEITAS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

class ErroUpload extends Error {}

function criarMulter(pasta: string): multer.Multer {
  const destino = path.resolve(process.cwd(), 'public', 'uploads', pasta);
  fs.mkdirSync(destino, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, destino),
      filename: (_req, file, cb) => cb(null, `${randomUUID()}${TIPOS_ACEITOS[file.mimetype]}`),
    }),
    limits: { fileSize: LIMITE_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!(file.mimetype in TIPOS_ACEITOS) || !EXTENSOES_ACEITAS.has(ext)) {
        cb(new ErroUpload('Tipo de arquivo não permitido. Envie imagem (JPG, PNG, WEBP) ou PDF.'));
        return;
      }
      cb(null, true);
    },
  });
}

/** Envolve o multer para devolver erros amigáveis (400) em vez de stack trace. */
function criarUpload(pasta: string, campo: string) {
  const upload = criarMulter(pasta);
  return (req: Request, res: Response, next: NextFunction): void => {
    upload.single(campo)(req, res, (erro: unknown) => {
      if (!erro) return next();
      if (erro instanceof MulterError) {
        const msg =
          erro.code === 'LIMIT_FILE_SIZE'
            ? 'O arquivo excede o limite de 5 MB.'
            : 'Envio de arquivo inválido. Envie apenas 1 arquivo.';
        res.status(400).json({ erro: msg });
        return;
      }
      if (erro instanceof ErroUpload) {
        res.status(400).json({ erro: erro.message });
        return;
      }
      next(erro);
    });
  };
}

/** Anexo opcional da pergunta (RN-22). Campo do form: "anexo". Caminho salvo: uploads/perguntas/<uuid>.<ext> */
export const uploadAnexoPergunta = criarUpload('perguntas', 'anexo');

/** Acervo de Materiais. Campo do form: "arquivo". */
export const uploadMaterial = criarUpload('materiais', 'arquivo');