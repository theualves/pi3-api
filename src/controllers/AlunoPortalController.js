import fs from "node:fs";
import path from "node:path";
import {
  LIMITE_HORAS_PADRAO,
  STATUS_EDITAVEIS,
  buscarAlunoPorId,
  buscarDadosDashboardAluno,
  listarCursosAtivosAluno,
  listarSolicitacoesDoAluno,
  buscarSolicitacaoDoAlunoPorId,
  criarSolicitacaoDoAluno,
  atualizarSolicitacaoDoAluno,
  excluirSolicitacaoDoAluno,
} from "../models/alunoPortalModel.js";
import { prisma } from "../lib/prisma.js";


const CATEGORIAS_VALIDAS = new Set(["ENSINO", "PESQUISA", "EXTENSAO"]);
const STATUS_VALIDOS = new Set(["PENDENTE", "APROVADA", "REJEITADA"]);

const normalizarTexto = (valor) => (valor ? String(valor).trim().toUpperCase() : undefined);

const normalizarOrdenacao = (valor) => {
  const valorNormalizado = normalizarTexto(valor);

  if (!valorNormalizado) {
    return undefined;
  }

  if (["ASC", "CRESCENTE"].includes(valorNormalizado)) {
    return "asc";
  }

  if (["DESC", "DECRESCENTE"].includes(valorNormalizado)) {
    return "desc";
  }

  return undefined;
};

const parseDataISO = (valor) => {
  if (!valor) {
    return undefined;
  }

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
};

const montarDadosArquivo = (arquivo) => {
  if (!arquivo) {
    return {};
  }

  const caminhoRelativo = path.relative(process.cwd(), arquivo.path).replaceAll("\\", "/");

  return {
    comprovante: caminhoRelativo,
    nomeArquivoComprovante: arquivo.originalname,
    mimeTypeComprovante: arquivo.mimetype,
    tamanhoComprovante: arquivo.size,
  };
};

const removerArquivoSeExistir = (caminhoArquivo) => {
  try {
    if (!caminhoArquivo) {
      return;
    }

    if (caminhoArquivo.startsWith("http://") || caminhoArquivo.startsWith("https://")) {
      return;
    }

    const caminhoAbsoluto = path.isAbsolute(caminhoArquivo)
      ? caminhoArquivo
      : path.resolve(process.cwd(), caminhoArquivo);

    if (fs.existsSync(caminhoAbsoluto)) {
      fs.unlinkSync(caminhoAbsoluto);
    }
  } catch (error) {
    console.error("Erro ao remover arquivo:", error);
  }
};

const formatarSolicitacao = (atividade) => ({
  id: atividade.id,
  titulo: atividade.titulo,
  descricao: atividade.descricao,
  categoria: atividade.categoria,
  dataInicio: atividade.dataInicio,
  cargaHoraria: atividade.horasSolicitadas,
  status: atividade.status,
  motivoRecusa: atividade.motivo,
  dataEnvio: atividade.createdAt,
  dataValidacao: atividade.validadaEm,
  horasAprovadas: atividade.horasAprovadas,
  comprovante: atividade.comprovante,
  podeEditar: STATUS_EDITAVEIS.has(atividade.status),
  podeExcluir: STATUS_EDITAVEIS.has(atividade.status),
});

// Ajuste para encontrar o aluno usando o ID que o Front já tem (usuarioId)
const garantirAluno = async (idDaMochila, res) => {
  // Tenta buscar o aluno pelo usuarioId (o ID que está no seu localStorage)
  const aluno = await prisma.aluno.findFirst({
    where: {
      OR: [
        { id: idDaMochila },       // Caso seja o ID de Aluno
        { usuarioId: idDaMochila } // Caso seja o ID de Usuário (o seu caso atual!)
      ]
    },
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
      curso: true
    }
  });

  if (!aluno) {
    res.status(404).json({ error: "Aluno não encontrado com o ID fornecido." });
    return null;
  }

  return aluno;
};

export const obterDashboardAluno = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const limiteHoras = req.query.limiteHoras ? Number(req.query.limiteHoras) : LIMITE_HORAS_PADRAO;

    if (!Number.isFinite(limiteHoras) || limiteHoras <= 0) {
      return res.status(400).json({ error: "limiteHoras deve ser um número maior que zero." });
    }

    const aluno = await garantirAluno(alunoId, res);
    if (!aluno) {
      return;
    }

    const dashboard = await buscarDadosDashboardAluno(alunoId, limiteHoras);

    return res.json({
      aluno: {
        id: aluno.id,
        nome: aluno.usuario.nome,
      },
      ...dashboard,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar dados do dashboard do aluno." });
  }
};

export const listarMeusCursos = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const cursos = await listarCursosAtivosAluno(alunoId);

    if (!cursos) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    return res.json({
      total: cursos.length,
      cursos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar cursos ativos do aluno." });
  }
};

export const listarMinhasSolicitacoes = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const aluno = await garantirAluno(alunoId, res);
    if (!aluno) {
      return;
    }

    const categoria = normalizarTexto(req.query.categoria);
    const status = normalizarTexto(req.query.status);

    if (categoria && !CATEGORIAS_VALIDAS.has(categoria)) {
      return res.status(400).json({ error: "Categoria inválida. Use ENSINO, PESQUISA ou EXTENSAO." });
    }

    if (status && !STATUS_VALIDOS.has(status)) {
      return res.status(400).json({ error: "Status inválido. Use PENDENTE, APROVADA ou REJEITADA." });
    }

    const filtroHorasInformado = req.query.ordenarHoras || req.query.horas;
    const filtroDataInformado = req.query.ordenarData || req.query.data;
    const ordenarHoras = normalizarOrdenacao(filtroHorasInformado);
    const ordenarData = normalizarOrdenacao(filtroDataInformado);

    if (filtroHorasInformado && !ordenarHoras) {
      return res.status(400).json({ error: "Filtro de horas inválido. Use asc ou desc." });
    }

    if (filtroDataInformado && !ordenarData) {
      return res.status(400).json({ error: "Filtro de data inválido. Use asc ou desc." });
    }

    const dataInicio = req.query.dataInicio ? parseDataISO(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? parseDataISO(req.query.dataFim) : undefined;

    if ((req.query.dataInicio && !dataInicio) || (req.query.dataFim && !dataFim)) {
      return res.status(400).json({ error: "Use datas válidas no formato ISO (YYYY-MM-DD)." });
    }

    if (dataInicio && dataFim && dataInicio > dataFim) {
      return res.status(400).json({ error: "dataInicio não pode ser maior que dataFim." });
    }

    const solicitacoes = await listarSolicitacoesDoAluno(alunoId, {
      categoria,
      status,
      ordenarHoras,
      ordenarData,
      dataInicio,
      dataFim,
    });

    return res.json({
      total: solicitacoes.length,
      solicitacoes: solicitacoes.map(formatarSolicitacao),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar solicitações do aluno." });
  }
};

export const listarHistoricoAluno = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const aluno = await garantirAluno(alunoId, res);
    if (!aluno) {
      return;
    }

    const historico = await listarSolicitacoesDoAluno(alunoId, {
      status: "APROVADA",
      ordenarData: "desc",
    });

    return res.json({
      total: historico.length,
      historico: historico.map(formatarSolicitacao),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar histórico do aluno." });
  }
};

export const criarNovaSolicitacaoAluno = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const aluno = await garantirAluno(alunoId, res);
    if (!aluno) {
      removerArquivoSeExistir(req.file?.path);
      return;
    }

    const { titulo, categoria, dataInicio, cargaHoraria, horasSolicitadas, descricao } = req.body;

    if (!titulo || !categoria || (!cargaHoraria && !horasSolicitadas) || !dataInicio) {
      removerArquivoSeExistir(req.file?.path);
      return res.status(400).json({
        error: "Preencha os campos obrigatórios: titulo, categoria, dataInicio e cargaHoraria.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Envie um comprovante em PDF, JPG ou PNG de até 5MB." });
    }

    const categoriaNormalizada = normalizarTexto(categoria);

    if (!CATEGORIAS_VALIDAS.has(categoriaNormalizada)) {
      removerArquivoSeExistir(req.file.path);
      return res.status(400).json({ error: "Categoria inválida. Use ENSINO, PESQUISA ou EXTENSAO." });
    }

    const horas = Number(cargaHoraria || horasSolicitadas);
    if (!Number.isFinite(horas) || horas <= 0) {
      removerArquivoSeExistir(req.file.path);
      return res.status(400).json({ error: "cargaHoraria deve ser um número maior que zero." });
    }

    const dataInicioConvertida = parseDataISO(dataInicio);
    if (!dataInicioConvertida) {
      removerArquivoSeExistir(req.file.path);
      return res.status(400).json({ error: "dataInicio inválida. Use o formato ISO (YYYY-MM-DD)." });
    }

    const dadosArquivo = montarDadosArquivo(req.file);
    const atividade = await criarSolicitacaoDoAluno({
      titulo: String(titulo).trim(),
      descricao: descricao ? String(descricao).trim() : null,
      categoria: categoriaNormalizada,
      dataInicio: dataInicioConvertida,
      horasSolicitadas: horas,
      alunoId: aluno.id,
      status: "PENDENTE",
      ...dadosArquivo,
    });

    return res.status(201).json(formatarSolicitacao(atividade));
  } catch (error) {
    console.error(error);
    removerArquivoSeExistir(req.file?.path);
    return res.status(500).json({ error: "Erro ao criar solicitação de atividade." });
  }
};

export const editarSolicitacaoAluno = async (req, res) => {
  try {
    const { alunoId, atividadeId } = req.params;

    const solicitacao = await buscarSolicitacaoDoAlunoPorId(alunoId, atividadeId);
    if (!solicitacao) {
      removerArquivoSeExistir(req.file?.path);
      return res.status(404).json({ error: "Solicitação não encontrada para este aluno." });
    }

    if (!STATUS_EDITAVEIS.has(solicitacao.status)) {
      removerArquivoSeExistir(req.file?.path);
      return res.status(409).json({
        error: "Somente solicitações pendentes ou rejeitadas podem ser editadas.",
      });
    }

    const dadosAtualizacao = {};
    const { titulo, categoria, dataInicio, cargaHoraria, horasSolicitadas, descricao } = req.body;

    if (titulo !== undefined) {
      const tituloLimpo = String(titulo).trim();
      if (!tituloLimpo) {
        removerArquivoSeExistir(req.file?.path);
        return res.status(400).json({ error: "titulo não pode ser vazio." });
      }
      dadosAtualizacao.titulo = tituloLimpo;
    }

    if (descricao !== undefined) {
      dadosAtualizacao.descricao = descricao ? String(descricao).trim() : null;
    }

    if (categoria !== undefined) {
      const categoriaNormalizada = normalizarTexto(categoria);
      if (!CATEGORIAS_VALIDAS.has(categoriaNormalizada)) {
        removerArquivoSeExistir(req.file?.path);
        return res.status(400).json({ error: "Categoria inválida. Use ENSINO, PESQUISA ou EXTENSAO." });
      }
      dadosAtualizacao.categoria = categoriaNormalizada;
    }

    if (dataInicio !== undefined) {
      const dataInicioConvertida = parseDataISO(dataInicio);
      if (!dataInicioConvertida) {
        removerArquivoSeExistir(req.file?.path);
        return res.status(400).json({ error: "dataInicio inválida. Use o formato ISO (YYYY-MM-DD)." });
      }
      dadosAtualizacao.dataInicio = dataInicioConvertida;
    }

    if (cargaHoraria !== undefined || horasSolicitadas !== undefined) {
      const horas = Number(cargaHoraria || horasSolicitadas);
      if (!Number.isFinite(horas) || horas <= 0) {
        removerArquivoSeExistir(req.file?.path);
        return res.status(400).json({ error: "cargaHoraria deve ser um número maior que zero." });
      }
      dadosAtualizacao.horasSolicitadas = horas;
    }

    if (req.file) {
      Object.assign(dadosAtualizacao, montarDadosArquivo(req.file));
    }

    if (!Object.keys(dadosAtualizacao).length) {
      removerArquivoSeExistir(req.file?.path);
      return res.status(400).json({ error: "Nenhum campo enviado para atualização." });
    }

    Object.assign(dadosAtualizacao, {
      status: "PENDENTE",
      motivo: null,
      horasAprovadas: null,
      validadaPorId: null,
      validadaEm: null,
    });

    const atividadeAtualizada = await atualizarSolicitacaoDoAluno(atividadeId, dadosAtualizacao);

    if (req.file && solicitacao.comprovante && solicitacao.comprovante !== atividadeAtualizada.comprovante) {
      removerArquivoSeExistir(solicitacao.comprovante);
    }

    return res.json(formatarSolicitacao(atividadeAtualizada));
  } catch (error) {
    console.error(error);
    removerArquivoSeExistir(req.file?.path);
    return res.status(500).json({ error: "Erro ao editar solicitação." });
  }
};

export const excluirSolicitacaoAluno = async (req, res) => {
  try {
    const { alunoId, atividadeId } = req.params;
    const solicitacao = await buscarSolicitacaoDoAlunoPorId(alunoId, atividadeId);

    if (!solicitacao) {
      return res.status(404).json({ error: "Solicitação não encontrada para este aluno." });
    }

    if (!STATUS_EDITAVEIS.has(solicitacao.status)) {
      return res.status(409).json({
        error: "Somente solicitações pendentes ou rejeitadas podem ser excluídas.",
      });
    }

    await excluirSolicitacaoDoAluno(atividadeId);
    removerArquivoSeExistir(solicitacao.comprovante);

    return res.json({ message: "Solicitação excluída com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao excluir solicitação." });
  }
};
