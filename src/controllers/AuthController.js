import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { enviarEmailRecuperacao } from "../services/EmailService.js";

export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Busca o usuário incluindo os dados de vínculo do Aluno
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { aluno: true }, 
    });

    if (!usuario) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    const ehSenhaTextoPuro = senha === usuario.senha;

    if (!senhaValida && !ehSenhaTextoPuro) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

  
    const token = jwt.sign(
      { 
        id: usuario.id, 
        tipo: usuario.tipo, 
        idAluno: usuario.aluno?.id || null 
      },
     process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login realizado com sucesso!",
      token, // O frontend armazena este token para requisições futuras
      usuario: {
        id: usuario.id, 
        nome: usuario.nome,
        tipo: usuario.tipo,
        idAluno: usuario.aluno?.id || null,
      },
    });
  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    res.status(500).json({ error: "Erro ao realizar login." });
  }
};

export const solicitarRecuperacao = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 3600000); // Validade de 1h

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken: token, resetTokenExpira: expira },
    });

    // 👉 MUDANÇA: Removida a barra dupla (//) do link
    const resetLink = `https://senachoras.vercel.app/redefinir-senha?token=${token}`;

    await enviarEmailRecuperacao(usuario.email, usuario.nome, resetLink);

    console.log("✅ TOKEN GERADO NO BANCO:", token);
    res.json({ message: "Link de recuperação gerado e enviado." });
  } catch (error) {
    console.error("Erro no solicitarRecuperacao:", error);
    res.status(500).json({ error: "Erro ao solicitar recuperação." });
  }
};

export const validarToken = async (req, res) => {
  console.log("=== 🔍 INICIANDO VALIDAÇÃO DO TOKEN ===");
  console.log("📦 Query da URL:", req.query);
  console.log("📦 Corpo (Body):", req.body);
  
  const token = req.query.token || req.body.token || req.params.token;
  console.log("🔑 Token extraído pelo backend:", token);

  if (!token) {
    console.log("❌ FALHA: O Next.js não enviou o token pro backend!");
    return res.status(400).json({ error: "Token não enviado na requisição." });
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { resetToken: token },
    });

    if (!usuario) {
      console.log("❌ FALHA: O token chegou, mas não existe no MySQL.");
      return res.status(400).json({ error: "Token inválido ou não existe." });
    }

    console.log("⏳ Hora de Agora (Render):", new Date());
    console.log("⏳ Hora de Expiração (Banco):", usuario.resetTokenExpira);

    if (usuario.resetTokenExpira < new Date()) {
      console.log("❌ FALHA: O token venceu (Problema de Fuso Horário).");
      return res.status(400).json({ error: "O link expirou." });
    }

    console.log("✅ SUCESSO: Token 100% válido!");
    res.json({ valid: true });
  } catch (error) {
    console.error("❌ ERRO INTERNO:", error);
    res.status(500).json({ error: "Erro interno ao validar token." });
  }
};

export const redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;
  
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { resetToken: token },
    });

    if (!usuario) return res.status(400).json({ error: "Token inválido." });

    // Revalida a data aqui também por segurança
    if (usuario.resetTokenExpira < new Date()) {
      return res.status(400).json({ error: "O link expirou." });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaHash, resetToken: null, resetTokenExpira: null },
    });

    res.json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Erro no redefinirSenha:", error);
    res.status(500).json({ error: "Erro interno ao redefinir senha." });
  }
};