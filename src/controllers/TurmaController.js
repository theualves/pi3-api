import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const criarTurmaSchema = z.object({
  nome: z.string().min(2, "Nome da turma muito curto"),
  cursoId: z.string().uuid("ID do curso inválido"),
});

export const criarTurma = async (req, res) => {
  try {
    const dadosValidados = criarTurmaSchema.parse(req.body);

    const turma = await prisma.turma.create({
      data: {
        nome: dadosValidados.nome,
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