ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuarios_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL;