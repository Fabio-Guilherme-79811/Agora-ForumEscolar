CREATE TABLE tambemtenho (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  pergunta_id INT NOT NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE CASCADE,
  UNIQUE (usuario_id, pergunta_id)
);