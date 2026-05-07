/*
  Warnings:

  - You are about to drop the column `cargaHoraria` on the `curso` table. All the data in the column will be lost.
  - Added the required column `metaHoras` to the `Curso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `curso` DROP COLUMN `cargaHoraria`,
    ADD COLUMN `metaHoras` INTEGER NOT NULL;
