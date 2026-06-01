/*
  Warnings:

  - Made the column `turma` on table `aluno` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `aluno` MODIFY `turma` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `curso` MODIFY `metaHoras` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Aluno_turma_idx` ON `Aluno`(`turma`);

-- CreateIndex
CREATE INDEX `Usuario_nome_idx` ON `Usuario`(`nome`);
