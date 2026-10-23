CREATE TABLE perguntas (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  titulo       VARCHAR(120) NOT NULL,
  descricao    TEXT         NOT NULL,
  anexo_url    VARCHAR(255) NULL,
  autor_id     INT NOT NULL,
  materia_id   INT NOT NULL,
  validada     BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id)   REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
  CHECK (CHAR_LENGTH(titulo) BETWEEN 10 AND 120),
  CHECK (CHAR_LENGTH(descricao) >= 20)
);