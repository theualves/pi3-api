import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt"; 

const cadastrarAlunoSchema = z.object({
  nome: z.string().min(3).transform(val => val.trim()),
  email: z.string().email().transform(val => val.trim()),
  senha: z.string().min(4),
  cpf: z.string()
    .transform((val) => val.replace(/\D/g, "")) 
    .refine((val) => val.length === 11, { message: "CPF inválido" }),
  cursoId: z.string().uuid(),
  periodo: z.coerce
    .number()
    .int()
    .min(1)
    .max(12)
    .default(1),
});

const criarUsuarioSchema = z.object({
  nome: z.string().min(3).transform(val => val.trim()),
  email: z.string().email().transform(val => val.trim()),
  senha: z.string().min(4),
  tipo: z.string().transform(val => val.trim().toUpperCase()),
  cursoId: z.string().uuid().nullable().optional(),
  status: z.string().default("Ativo").transform(val => val.trim()),
});

export const cadastrarAluno = async (req, res) => {
  try {
    const dadosValidados = cadastrarAlunoSchema.parse(req.body);
    const { nome, email, senha, cpf, cursoId, periodo } = dadosValidados;

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          tipo: "ALUNO",
          cursoId,       
          status: "Ativo",
        },
      });

      const aluno = await tx.aluno.create({
        data: {
          cpf,
          periodo,
          cargaExigida: 100, 
          turma: "", // Alterado de null para string vazia para o banco aceitar
          usuario: {
            connect: { id: usuario.id }
          },
          curso: {
            connect: { id: cursoId }
          }
        },
      });

      return { usuario, aluno };
    });

    return res.status(201).json({
      message: "Aluno cadastrado com sucesso!",
      idUsuario: resultado.usuario.id,
      idAluno: resultado.aluno.id,
    });

  } catch (error) {
    console.error("Erro no cadastro de aluno:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        erro: "Falha na validação dos dados", 
        detalhes: error.flatten().fieldErrors 
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        erro: "Erro de duplicidade. O CPF ou o E-mail informado já está cadastrado."
      });
    }

    return res.status(500).json({ 
      erro: "Erro interno ao cadastrar aluno.",
      detalhes: error.message
    });
  }
};

export const criarUsuario = async (req, res) => {
  try {
    const dadosValidados = criarUsuarioSchema.parse(req.body);
    const { nome, email, senha, tipo, cursoId, status } = dadosValidados;

    const senhaHash = await bcrypt.hash(senha, 10);

    const cursoFinalId = tipo === "GESTOR" ? null : (cursoId || null);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo, 
        cursoId: cursoFinalId,
        status,
      },
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      usuario: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email }
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        erro: "Falha na validação dos dados", 
        detalhes: error.flatten().fieldErrors 
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(409).json({ erro: "O e-mail informado já está em uso." });
    }

    return res.status(500).json({ erro: "Erro interno ao criar usuário." });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const { tipo, nome, email, cursoId } = req.query;
    
    const usuarios = await prisma.usuario.findMany({
      where: {
        tipo: tipo ? tipo.toUpperCase() : undefined,
        nome: nome ? { contains: nome.trim() } : undefined,
        email: email ? { contains: email.trim() } : undefined,
        cursoId: cursoId ? cursoId.trim() : undefined,
      },
      include: {
        curso: { select: { nome: true } },
        aluno: true 
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return res.status(500).json({ erro: "Erro ao buscar usuários." });
  }
};

export const contarUsuarios = async (req, res) => {
  try {
    const { tipo } = req.query;
    const total = await prisma.usuario.count({
      where: { tipo: tipo ? tipo.toUpperCase() : undefined },
    });
    return res.json({ total });
  } catch (error) {
    console.error("Erro ao contar usuários:", error);
    return res.status(500).json({ erro: "Erro ao contar usuários." });
  }
};