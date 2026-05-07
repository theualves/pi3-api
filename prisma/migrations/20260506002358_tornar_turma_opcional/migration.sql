/*
  Warnings:

  - You are about to drop the column `cargaHoraria` on the `curso` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `aluno` MODIFY `turma` ENUM('TADS047', 'TADS048', 'TADS049') NULL;

-- AlterTable
ALTER TABLE `curso` DROP COLUMN `cargaHoraria`,
    ADD COLUMN `metaHoras` INTEGER NOT NULL DEFAULT 0;
