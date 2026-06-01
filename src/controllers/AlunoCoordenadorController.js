import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

// Helper para gerar senhas aleatórias
const gerarSenha = () => crypto.randomBytes(4).toString("hex");

// Esquema de Validação para a criação de Aluno
const criarAlunoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  
  // Remove pontos/traços automaticamente e depois valida se restaram 11 dígitos
  cpf: z.string()
    .transform((val) => val.replace(/\D/g, "")) 
    .refine((val) => val.length === 11, {
      message: "O CPF deve conter exatamente 11 números",
    }),
  
  senha: z.string().optional(),
  cursoId: z.string().uuid("ID do curso inválido"),
  turma: z.string().min(1, "A turma é obrigatória"),
  
  // Transforma a entrada em número e limita o período (entre 1 e 12)
  periodo: z.coerce
    .number()
    .int("O período deve ser um número inteiro")
    .min(1, "O período mínimo é 1")
    .max(12, "O período máximo permitido é 12"),
      
  cargaExigida: z.coerce
    .number()
    .int()
    .min(1, "A carga horária deve ser maior que zero"),
});

export const criarAluno = async (req, res) => {
  try {
    // 1. Valida e limpa os dados de entrada contra o Schema do Zod
    const dadosValidados = criarAlunoSchema.parse(req.body);

    const { nome, email, cpf, senha, cursoId, turma, periodo, cargaExigida } = dadosValidados;
    
    // 2. Define e criptografa a senha
    const senhaFinal = senha || gerarSenha();
    const senhaHash = await bcrypt.hash(senhaFinal, 10);

    // 3. Executa a transação no banco de dados
    const aluno = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          tipo: "ALUNO",
          cursoId,
        },
      });

      return tx.aluno.create({
        data: {
          usuarioId: usuario.id,
          cpf, // Aqui já entra 100% limpo, apenas os 11 números
          cursoId,
          turma,
          periodo,
          cargaExigida,
        },
        include: {
          usuario: true,
          curso: true,
        },
      });
    });

    // 4. Retorna a resposta de sucesso
    return res.status(201).json({
      ...aluno,
      senhaGerada: senha ? null : senhaFinal,
    });

  } catch (err) {
    // Se o erro for de validação do Zod, retorna uma resposta limpa dos campos inválidos
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        erro: "Falha na validação dos dados", 
        detalhes: err.flatten().fieldErrors 
      });
    }

    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
};

export const listarAlunos = async (req, res) => {
  try {
    const { cursoId, turma, nome, cpf } = req.query;

    // Se o CPF for passado na busca, removemos os pontos/traços para bater com o banco
    const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : undefined;

    const alunos = await prisma.aluno.findMany({
      where: {
        cursoId: cursoId || undefined,
        turma: turma || undefined,
        cpf: cpfLimpo ? { contains: cpfLimpo } : undefined,
        usuario: {
          nome: nome ? { contains: nome } : undefined,
        },
      },
      include: {
        usuario: true,
        curso: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(alunos);
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao buscar alunos" });
  }
};

export const gerarSenhaAutomatica = async (_req, res) => {
  return res.json({ senha: gerarSenha() });
};