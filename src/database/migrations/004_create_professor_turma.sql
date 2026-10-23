CREATE TABLE professor_turma (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT NOT NULL,
  turma_id     INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id)   REFERENCES turmas(id)   ON DELETE CASCADE,
  UNIQUE (usuario_id, turma_id)
);