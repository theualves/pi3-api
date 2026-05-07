import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import bcrypt from "bcrypt"; 
import {
  isNonEmptyString,
  isValidEmail,
  toInt,
  sendValidationError,
} from "../utils/validation.js";
import { handleControllerError } from "../utils/apiErrors.js";

export const cadastrarAluno = async (req, res) => {
  
  const { nome, email, senha, cpf, cursoId, periodo } = req.body;

  const validationErrors = [];
  if (!isNonEmptyString(nome))
    validationErrors.push({ field: "nome", message: "Nome é obrigatório." });
  if (!isValidEmail(email))
    validationErrors.push({ field: "email", message: "E-mail inválido." });
  if (!isNonEmptyString(senha))
    validationErrors.push({ field: "senha", message: "Senha é obrigatória." });
  if (!isNonEmptyString(cpf))
    validationErrors.push({ field: "cpf", message: "CPF é obrigatório." });

  if (validationErrors.length > 0)
    return sendValidationError(res, validationErrors);

  try {
    
    const senhaHash = await bcrypt.hash(senha.trim(), 10);

    
    const resultado = await prisma.$transaction(async (tx) => {
      
      const usuario = await tx.usuario.create({
        data: {
          nome: nome.trim(),
          email: email.trim(),
          senha: senhaHash,
          tipo: "ALUNO",
          cursoId: cursoId,
          status: "Ativo",
        },
      });

      
      const aluno = await tx.aluno.create({
        data: {
          cpf: cpf.trim(),
          usuarioId: usuario.id,
          cursoId: cursoId,
          periodo: toInt(periodo) || 1,
          cargaExigida: 100, 
          turma: null, 
        },
      });

      return { usuario, aluno };
    });

    res.status(201).json({
      message: "Aluno cadastrado com sucesso!",
      idUsuario: resultado.usuario.id,
      idAluno: resultado.aluno.id,
    });
  } catch (error) {
    console.error("ERRO AO CADASTRAR ALUNO:", error);
    return handleControllerError(
      res,
      error,
      "Erro ao cadastrar aluno. Verifique se CPF ou E-mail já existem.",
    );
  }
};


export const criarUsuario = async (req, res) => {
  const { nome, email, senha, tipo, cursoId, status } = req.body;

  const validationErrors = [];
  if (!isNonEmptyString(nome)) validationErrors.push({ field: "nome", message: "Campo obrigatório." });
  if (!isValidEmail(email)) validationErrors.push({ field: "email", message: "E-mail inválido." });
  if (!isNonEmptyString(senha)) validationErrors.push({ field: "senha", message: "Campo obrigatório." });
  if (!isNonEmptyString(tipo)) validationErrors.push({ field: "tipo", message: "Campo obrigatório." });

  if (validationErrors.length > 0) return sendValidationError(res, validationErrors);

  try {
    
    const senhaHash = await bcrypt.hash(senha.trim(), 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: email.trim(),
        senha: senhaHash, // Salva o hash, não o texto puro
        tipo: tipo.trim().toUpperCase(), // Garante que bata com o Enum (ex: COORDENADOR)
        cursoId: tipo.toUpperCase() === "GESTOR" ? null : (isNonEmptyString(cursoId) ? cursoId.trim() : null),
        status: isNonEmptyString(status) ? status.trim() : "Ativo",
      },
    });

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      usuario: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email }
    });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao criar usuário. Verifique se o e-mail já existe.");
  }
};


export const listarUsuarios = async (req, res) => {
  const { tipo, nome, email, cursoId } = req.query;
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        tipo: tipo ? tipo.toUpperCase() : undefined,
        nome: isNonEmptyString(nome) ? { contains: nome.trim() } : undefined,
        email: isNonEmptyString(email) ? { contains: email.trim() } : undefined,
        cursoId: isNonEmptyString(cursoId) ? cursoId.trim() : undefined,
      },
      include: {
        curso: { select: { nome: true } },
        aluno: true // 👈 ADICIONE ESTA LINHA para o CPF e Período aparecerem no Front!
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(usuarios);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao buscar usuários.");
  }
};


export const contarUsuarios = async (req, res) => {
  const { tipo } = req.query;
  try {
    const total = await prisma.usuario.count({
      where: { tipo: tipo ? tipo.toUpperCase() : undefined },
    });
    res.json({ total });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao contar usuários.");
  }
};
