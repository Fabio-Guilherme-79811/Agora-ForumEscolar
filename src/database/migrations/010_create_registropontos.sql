CREATE TABLE registropontos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  pontos      INT NOT NULL,
  motivo      VARCHAR(100) NOT NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CHECK (pontos >= 0)
);