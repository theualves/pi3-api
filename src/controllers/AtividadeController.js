import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { enviarEmailNotificacao } from "../services/EmailService.js";

export const criarAtividade = async (req, res) => {
  try {
    const { titulo, categoria, horasSolicitadas, comprovante, alunoId } = req.body;
    const atividade = await prisma.atividade.create({
      data: {
        titulo,
        categoria,
        horasSolicitadas: Number(horasSolicitadas),
        comprovante,
        alunoId,
      },
    });

    res.status(201).json(atividade);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

export const listarAtividades = async (req, res) => {
  const { cursoId, turma, categoria, status, nome, cpf, processadas } = req.query;

  let filtroStatus = status || undefined;

  if (processadas === "true") {
    filtroStatus = { not: "PENDENTE" };
  }

  const atividades = await prisma.atividade.findMany({
    where: {
      status: filtroStatus,
      categoria: categoria || undefined,
      aluno: {
        cursoId: cursoId || undefined,
        turma: turma || undefined,
        cpf: cpf ? { contains: cpf } : undefined,
        usuario: {
          nome: nome ? { contains: nome } : undefined,
        },
      },
    },
    include: {
      aluno: {
        include: {
          usuario: true,
          curso: true,
        },
      },
      validadaPor: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(atividades);
};

export const validarAtividade = async (req, res) => {
  const { id } = req.params;
  const { status, horasAprovadas, motivo } = req.body;
  
  // Captura o ID do Coordenador/Validador diretamente do token JWT assinado
  const validadorId = req.usuario.id;

  try {
    const atividade = await prisma.atividade.update({
      where: { id },
      data: {
        status,
        horasAprovadas: status === "APROVADA" ? Number(horasAprovadas || 0) : 0,
        motivo: motivo || null,
        validadaPorId: validadorId,
        validadaEm: new Date(),
      },
      include: {
        aluno: {
          include: {
            usuario: true,
          },
        },
        validadaPor: {
          select: { nome: true, email: true },
        },
      },
    });

    if (atividade.aluno?.usuario?.email) {
      enviarEmailNotificacao(
        atividade.aluno.usuario.email,
        atividade.aluno.usuario.nome,
        status,
        motivo
      );
    }

    res.json(atividade);
  } catch (error) {
    console.error("Erro ao validar atividade:", error);
    res.status(500).json({ error: "Erro ao processar a validação." });
  }
};

export const baixarComprovante = async (req, res) => {
  const { id } = req.params;

  try {
    const atividade = await prisma.atividade.findUnique({
      where: { id },
      select: { comprovante: true },
    });

    if (!atividade) {
      return res.status(404).json({ error: "Atividade não encontrada." });
    }

    if (atividade.comprovante.startsWith("http://") || atividade.comprovante.startsWith("https://")) {
      return res.json({ url: atividade.comprovante });
    }

    const caminhoAbsoluto = path.isAbsolute(atividade.comprovante)
      ? atividade.comprovante
      : path.resolve(process.cwd(), atividade.comprovante);

    if (!fs.existsSync(caminhoAbsoluto)) {
      return res.status(404).json({ error: "Comprovante não encontrado no servidor." });
    }

    return res.download(caminhoAbsoluto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao baixar comprovante." });
  }
};