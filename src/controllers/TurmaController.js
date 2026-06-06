import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const criarTurmaSchema = z.object({
  nome: z.string().min(2, "Nome da turma muito curto"),
  periodo: z.coerce.number().int().min(1).max(12).default(1),
  cursoId: z.string().uuid("ID do curso inválido"),
});

export const criarTurma = async (req, res) => {
  try {
    const dadosValidados = criarTurmaSchema.parse(req.body);

    const turma = await prisma.turma.create({
      data: {
        nome: dadosValidados.nome,
        periodo: dadosValidados.periodo,
        cursoId: dadosValidados.cursoId,
      },
    });

    return res.status(201).json(turma);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ erro: "Dados inválidos", detalhes: err.flatten().fieldErrors });
    }
    return res.status(500).json({ erro: "Erro ao criar turma" });
  }
};

export const listarTurmas = async (req, res) => {
  try {
    const { cursoId } = req.query;

    const turmas = await prisma.turma.findMany({
      where: {
        cursoId: cursoId || undefined,
      },
      include: {
        _count: {
          select: { alunos: true } // Opcional: já traz quantos alunos tem na turma!
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(turmas);
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao listar turmas" });
  }
};

export const atualizarTurma = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosValidados = turmaSchema.parse(req.body);

    // Usa transação para garantir que, se a turma mudar de período, 
    // TODOS os alunos dela mudem juntos automaticamente!
    const turmaAtualizada = await prisma.$transaction(async (tx) => {
      const turma = await tx.turma.update({
        where: { id },
        data: {
          nome: dadosValidados.nome,
          periodo: dadosValidados.periodo,
          cursoId: dadosValidados.cursoId,
        },
      });

      // Se o período da turma mudou, arrasta todos os alunos pro novo período
      await tx.aluno.updateMany({
        where: { turmaId: id },
        data: { periodo: dadosValidados.periodo },
      });

      return turma;
    });

    return res.json(turmaAtualizada);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ erro: "Dados inválidos", detalhes: err.flatten().fieldErrors });
    }
    return res.status(500).json({ erro: "Erro ao atualizar turma" });
  }
};

export const excluirTurma = async (req, res) => {
  try {
    const { id } = req.params;

    // Antes de excluir a turma, deixamos os alunos órfãos (sem turma)
    // Isso evita apagar os alunos do banco sem querer
    await prisma.$transaction(async (tx) => {
      await tx.aluno.updateMany({
        where: { turmaId: id },
        data: { turmaId: null },
      });

      await tx.turma.delete({
        where: { id },
      });
    });

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao excluir a turma" });
  }
};