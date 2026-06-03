import { z } from "zod";
import { prisma } from "../lib/prisma.js";

// Esquema de Validação com Zod para o Limite
const salvarLimiteSchema = z.object({
  cursoId: z.string().uuid("ID do curso inválido"),
  
  periodo: z.coerce
    .number()
    .int("O período deve ser um número inteiro")
    .min(1, "O período mínimo é 1")
    .max(12, "O período máximo permitido é 12"),

  maxHorasPorPeriodo: z.coerce
    .number()
    .int("As horas devem ser um número inteiro")
    .min(0, "O valor deve ser maior ou igual a 0"),

  ensino: z.coerce
    .number()
    .int("As horas de ensino devem ser um número inteiro")
    .min(0, "O valor deve ser maior ou igual a 0"),

  pesquisa: z.coerce
    .number()
    .int("As horas de pesquisa devem ser um número inteiro")
    .min(0, "O valor deve ser maior ou igual a 0"),

  extensao: z.coerce
    .number()
    .int("As horas de extensão devem ser um número inteiro")
    .min(0, "O valor deve ser maior ou igual a 0"),
});

export const salvarLimite = async (req, res) => {
  try {
    // 1. Valida e converte os dados de entrada usando o Zod
    const dadosValidados = salvarLimiteSchema.parse(req.body);
    
    const { cursoId, periodo, maxHorasPorPeriodo, ensino, pesquisa, extensao } = dadosValidados;

    // 2. Usa o recurso upsert do Prisma (cria se não existir, atualiza se existir)
    // Baseado na chave única @@unique([cursoId, periodo]) definida no seu schema.prisma
    const limite = await prisma.limite.upsert({
      where: {
        cursoId_periodo: {
          cursoId,
          periodo,
        },
      },
      update: {
        maxHorasPorPeriodo,
        ensino,
        pesquisa,
        extensao,
      },
      create: {
        cursoId,
        periodo,
        maxHorasPorPeriodo,
        ensino,
        pesquisa,
        extensao,
      },
    });

    return res.json(limite);
  } catch (err) {
    // Retorna os erros estruturados do Zod caso a validação falhe
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        erro: "Falha na validação dos dados", 
        detalhes: err.flatten().fieldErrors 
      });
    }

    return res.status(500).json({ erro: "Erro interno ao salvar limite." });
  }
};

export const buscarLimite = async (req, res) => {
  try {
    // Agora busca filtrando por curso e período passados na query string (ex: ?cursoId=xxx&periodo=2)
    const { cursoId, periodo } = req.query;

    if (!cursoId || !periodo) {
      return res.status(400).json({ erro: "Parâmetros 'cursoId' e 'periodo' são obrigatórios na busca." });
    }

    const limite = await prisma.limite.findUnique({
      where: {
        cursoId_periodo: {
          cursoId,
          periodo: Number(periodo),
        },
      },
    });

    return res.json(limite || null);
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno ao buscar limite." });
  }
};