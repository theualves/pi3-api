import { z } from "zod";
import { prisma } from "../lib/prisma.js";


const criarCursoSchema = z.object({
  nome: z.string().min(2, "O nome do curso deve ter pelo menos 2 caracteres").transform(val => val.trim()),
  tipoFormacao: z.string().default("Superior").transform(val => val.trim()),
  metaHoras: z.coerce
    .number()
    .int("A meta de horas deve ser um número inteiro")
    .min(0, "A meta de horas não pode ser negativa"),
  statusInicial: z.string().default("Ativo").transform(val => val.trim()),
  categoria: z.string().default("Geral").transform(val => val.trim()),
  duracao: z.string().default("N/A").transform(val => val.trim()),
});

// Esquema de validação para Editar Curso (Campos opcionais)
const editarCursoSchema = z.object({
  nome: z.string().min(2).transform(val => val.trim()).optional(),
  categoria: z.string().transform(val => val.trim()).optional(),
  tipoFormacao: z.string().transform(val => val.trim()).optional(),
  duracao: z.string().transform(val => val.trim()).optional(),
  statusInicial: z.string().transform(val => val.trim()).optional(),
  metaHoras: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),
});

export const listarCursos = async (req, res) => {
  try {
    const { nome, status, coordenadorId } = req.query;

    const cursos = await prisma.curso.findMany({
      where: {
        nome: nome ? { contains: nome.trim() } : undefined,
        status: status ? status.trim() : undefined,
        usuarios: coordenadorId ? {
          some: { id: coordenadorId }
        } : undefined,
      },
      include: {
        usuarios: {
          select: { id: true, nome: true, email: true, tipo: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return res.json(cursos);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar cursos." });
  }
};

export const criarCurso = async (req, res) => {
  try {
    const dadosValidados = criarCursoSchema.parse(req.body);

    const novoCurso = await prisma.curso.create({
      data: {
        nome: dadosValidados.nome,
        metaHoras: dadosValidados.metaHoras,
        tipoCurso: dadosValidados.tipoFormacao,
        status: dadosValidados.statusInicial,
        categoria: dadosValidados.categoria,
        duracao: dadosValidados.duracao,
      },
    });

    return res.status(201).json(novoCurso);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        erro: "Falha na validação dos dados", 
        detalhes: error.flatten().fieldErrors 
      });
    }
    return res.status(500).json({ erro: "Erro interno ao cadastrar o curso." });
  }
};

export const editarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ erro: "O ID do curso é obrigatório." });

    const dadosValidados = editarCursoSchema.parse(req.body);

    // Mapeamento dos campos do Body para as colunas do Schema do Prisma
    const data = {};
    if (dadosValidados.nome) data.nome = dadosValidados.nome;
    if (dadosValidados.categoria) data.categoria = dadosValidados.categoria;
    if (dadosValidados.tipoFormacao) data.tipoCurso = dadosValidados.tipoFormacao;
    if (dadosValidados.duracao) data.duracao = dadosValidados.duracao;
    if (dadosValidados.statusInicial) data.status = dadosValidados.statusInicial;
    if (dadosValidados.metaHoras !== undefined) data.metaHoras = dadosValidados.metaHoras;

    const cursoAtualizado = await prisma.curso.update({
      where: { id: id.trim() },
      data,
    });

    return res.json(cursoAtualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        erro: "Falha na validação dos dados", 
        detalhes: error.flatten().fieldErrors 
      });
    }
    return res.status(500).json({ erro: "Erro ao atualizar o curso." });
  }
};

export const excluirCurso = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.curso.delete({ where: { id: id.trim() } });
    return res.json({ message: "Curso excluído com sucesso!" });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao excluir o curso." });
  }
};

export const opcoesFiltros = async (req, res) => {
  return res.json({ status: ["Ativo", "Inativo"], tipos: ["Superior", "Técnico", "Extensão"] });
};