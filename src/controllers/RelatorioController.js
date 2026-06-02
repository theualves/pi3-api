import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma.js";
import fs from "fs"; 


const construirFiltrosAtividade = (query) => {
  const { cursoId, periodo, categoria } = query;
  return {
    status: "APROVADA",
    categoria: categoria || undefined,
    aluno: {
      cursoId: cursoId || undefined,
      periodo: periodo ? Number(periodo) : undefined,
    },
  };
};


export const gerarRelatorio = async (req, res) => {
  try {
    const where = construirFiltrosAtividade(req.query);

    const dados = await prisma.atividade.findMany({
      where,
      include: {
        aluno: {
          include: { usuario: true },
        },
      },
    });

    const totalHorasAprovadas = dados.reduce(
      (acc, atividade) => acc + (atividade.horasAprovadas || 0),
      0
    );

    return res.json({
      totalRegistros: dados.length,
      totalHorasAprovadas,
      dados,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório JSON:", error);
    return res.status(500).json({ error: "Erro interno ao processar o relatório." });
  }
};

/**
 * 2. Gera e faz o download do relatório consolidado em PDF
 */
export const gerarRelatorioPdf = async (req, res) => {
  try {
    const { cursoId, periodo, categoria } = req.query;
    const where = construirFiltrosAtividade(req.query);

    const dados = await prisma.atividade.findMany({
      where,
      include: {
        aluno: {
          include: {
            usuario: true,
            curso: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Configuração do PDFKit usando Streams direto para a resposta (mais performático)
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio-horas.pdf");
    
    // Envia o PDF direto para o cliente conforme ele é gerado
    doc.pipe(res);

    // Design do Cabeçalho
    doc.fontSize(16).text("Relatório de Horas Complementares", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Curso: ${cursoId || "Todos"}`);
    doc.text(`Período: ${periodo || "Todos"}`);
    doc.text(`Categoria: ${categoria || "Todas"}`);
    doc.moveDown();

    // Listagem dos Alunos
    dados.forEach((atividade, index) => {
      doc.fontSize(11).text(`${index + 1}. ${atividade.aluno.usuario.nome} (${atividade.aluno.cpf})`);
      doc.text(`Curso: ${atividade.aluno.curso.nome}`);
      doc.text(`Atividade: ${atividade.titulo}`);
      doc.text(`Categoria: ${atividade.categoria}`);
      doc.text(`Horas aprovadas: ${atividade.horasAprovadas || 0}`);
      doc.text(`Motivo/Observação: ${atividade.motivo || "-"}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar relatório PDF:", error);
    // Como os headers podem já ter sido enviados pelo stream, ideal tratar antes
    if (!res.headersSent) {
      return res.status(500).json({ error: "Erro interno ao gerar o PDF." });
    }
  }
};


export const baixarComprovante = async (req, res) => {
  try {
    const { id } = req.params; 

    const atividade = await prisma.atividade.findUnique({
      where: { id },
    });

    if (!atividade || !atividade.comprovante) {
      return res.status(404).json({ error: "Comprovante não encontrado no sistema." });
    }

    // Se o seu campo 'comprovante' guarda o CAMINHO LOCAL do arquivo (ex: 'uploads/file.pdf')
    const caminhoArquivo = atividade.comprovante;

    if (!fs.existsSync(caminhoArquivo)) {
      return res.status(404).json({ error: "O arquivo físico não foi encontrado no servidor." });
    }

    // Configura os cabeçalhos dinamicamente com base no arquivo salvo
    res.setHeader("Content-Type", atividade.mimeTypeComprovante || "application/octet-stream");
    
  
    res.setHeader(
      "Content-Disposition", 
      `inline; filename="${atividade.nomeArquivoComprovante || "comprovante"}"`
    );

    
    const fileStream = fs.createReadStream(caminhoArquivo);
    return fileStream.pipe(res);

   
  } catch (error) {
    console.error("Erro ao buscar comprovante:", error);
    return res.status(500).json({ error: "Erro interno ao buscar comprovante." });
  }
};