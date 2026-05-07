import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

// --- LOGIN ---
export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // 1. Alterado para incluir os dados do Aluno na busca
    const usuario = await prisma.usuario.findUnique({ 
      where: { email },
      include: { aluno: true } // 👈 ESSENCIAL: traz o ID da tabela Aluno
    });

    if (!usuario) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    const ehSenhaTextoPuro = senha === usuario.senha;

    if (!senhaValida && !ehSenhaTextoPuro) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    res.json({
      message: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,       // ID do Usuário (para login/perfil)
        nome: usuario.nome,
        tipo: usuario.tipo,
        // 2. Enviando o ID do Aluno para o Frontend salvar na mochila
        idAluno: usuario.aluno?.id || null 
      },
    });
  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    res.status(500).json({ error: "Erro ao realizar login." });
  }
};

// --- RESTO DO CÓDIGO (RECUPERAÇÃO E VALIDAÇÃO) ---
export const solicitarRecuperacao = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 3600000); // 1h

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken: token, resetTokenExpira: expira },
    });

    console.log("TOKEN GERADO:", token);
    res.json({ message: "Link de recuperação gerado no console." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao solicitar recuperação." });
  }
};

export const redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { resetToken: token, resetTokenExpira: { gte: new Date() } },
    });

    if (!usuario) return res.status(400).json({ error: "Token inválido ou expirado." });

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaHash, resetToken: null, resetTokenExpira: null },
    });

    res.json({ message: "Senha redefinida com sucesso agora com hash!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao redefinir senha." });
  }
};

export const validarToken = async (req, res) => {
  const { token } = req.query;
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { resetToken: token, resetTokenExpira: { gte: new Date() } },
    });

    if (!usuario) return res.status(400).json({ error: "Token inválido ou expirado." });

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao validar token." });
  }
};
