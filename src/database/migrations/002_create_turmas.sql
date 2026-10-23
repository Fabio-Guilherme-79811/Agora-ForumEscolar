CREATE TABLE turmas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  ano_letivo YEAR         NOT NULL,
  codigo     VARCHAR(10)  NOT NULL UNIQUE
);