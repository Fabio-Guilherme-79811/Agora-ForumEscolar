CREATE TABLE perguntas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  titulo        VARCHAR(120) NOT NULL,
  descricao     TEXT         NOT NULL,
  anexo         VARCHAR(255) NULL,
  autor_id      INT NOT NULL,
  materia_id    INT NOT NULL,
  turma_id      INT NOT NULL,
  resolvida     BOOLEAN NOT NULL DEFAULT FALSE,   -- RN-19: selo do autor (não é validação)
  oculta        BOOLEAN NOT NULL DEFAULT FALSE,   -- RN-05: 3 denúncias
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id)   REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id)   REFERENCES turmas(id)   ON DELETE CASCADE,
  INDEX idx_perguntas_turma (turma_id, criado_em),
  CHECK (CHAR_LENGTH(titulo) BETWEEN 10 AND 120),
  CHECK (CHAR_LENGTH(descricao) >= 20)
);