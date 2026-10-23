CREATE TABLE votoutil (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  resposta_id INT NOT NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (resposta_id) REFERENCES respostas(id) ON DELETE CASCADE,
  UNIQUE (usuario_id, resposta_id)
);