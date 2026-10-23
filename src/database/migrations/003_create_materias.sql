CREATE TABLE materias (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  turma_id   INT NOT NULL,
  FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
);