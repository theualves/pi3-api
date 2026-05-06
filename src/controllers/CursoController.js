import { prisma } from "../lib/prisma.js";
import {
  isNonEmptyString,
  toInt,
  toStringArray,
  sendValidationError,
} from "../utils/validation.js";
import { handleControllerError } from "../utils/apiErrors.js";

export const listarCursos = async (req, res) => {
  try {
    const { nome, status } = req.query;
    const cursos = await prisma.curso.findMany({
      where: {
        nome: isNonEmptyString(nome) ? { contains: nome.trim() } : undefined,
        status: isNonEmptyString(status) ? status.trim() : undefined,
      },
      include: {
        usuarios: {
          select: { id: true, nome: true, email: true, tipo: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(cursos);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao buscar cursos.");
  }
};

export const criarCurso = async (req, res) => {
  // 1. Recebe exatamente o que o seu FRONT-END envia
  const { nome, tipoFormacao, metaHoras, statusInicial } = req.body;

  const validationErrors = [];
  
  if (!isNonEmptyString(nome)) {
    validationErrors.push({ field: "nome", message: "Nome é obrigatório." });
  }

  const metaInt = toInt(metaHoras);
  if (metaInt === null || metaInt < 0) {
    validationErrors.push({ field: "metaHoras", message: "Informe uma meta de horas válida." });
  }

  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }

  try {
    const novoCurso = await prisma.curso.create({
      data: {
        nome: nome.trim(),
        // Mapeando para os campos obrigatórios do seu SCHEMA atualizado:
        metaHoras: metaInt,
        tipoCurso: tipoFormacao || "Superior",
        status: statusInicial || "Ativo",
        categoria: "Geral", // Obrigatório no seu model
        duracao: "N/A",    // Obrigatório no seu model
      },
    });
    res.status(201).json(novoCurso);
  } catch (error) {
    // Se der erro, veremos exatamente o que o Prisma reclamou no terminal
    console.error("ERRO PRISMA:", error);
    return handleControllerError(res, error, "Dados inválidos para consulta/registro.");
  }
};

export const editarCurso = async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, tipoCurso, duracao, cargaHoraria, status } = req.body;

  if (!isNonEmptyString(id)) {
    return sendValidationError(res, [{ field: "id", message: "ID obrigatório." }]);
  }

  const data = {};
  if (nome) data.nome = nome.trim();
  if (categoria) data.categoria = categoria.trim();
  if (tipoCurso) data.tipoCurso = tipoCurso.trim();
  if (duracao) data.duracao = duracao.trim();
  if (cargaHoraria) data.cargaHoraria = toInt(cargaHoraria);
  if (status) data.status = status.trim();

  try {
    const cursoAtualizado = await prisma.curso.update({
      where: { id: id.trim() },
      data,
    });
    res.json(cursoAtualizado);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao atualizar o curso.");
  }
};

export const excluirCurso = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.curso.delete({ where: { id: id.trim() } });
    res.json({ message: "Curso excluído com sucesso!" });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao excluir o curso.");
  }
};

export const opcoesFiltros = async (req, res) => {
  res.json({ status: ["Ativo", "Inativo"], tipos: ["Superior", "Técnico", "Extensão"] });
};
