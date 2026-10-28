CREATE TABLE respostas (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  conteudo     TEXT NOT NULL,
  autor_id     INT NOT NULL,
  pergunta_id  INT NOT NULL,
  validada     BOOLEAN NOT NULL DEFAULT FALSE,
  validada_por INT NULL,
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id)     REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (pergunta_id)  REFERENCES perguntas(id) ON DELETE CASCADE,
  FOREIGN KEY (validada_por) REFERENCES usuarios(id) ON DELETE SET NULL
);