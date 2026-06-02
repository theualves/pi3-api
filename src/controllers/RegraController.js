import { prisma } from "../lib/prisma.js";
import { toBoolean, sendValidationError } from "../utils/validation.js";
import { handleControllerError } from "../utils/apiErrors.js";

/**
 * Salva ou atualiza a regra global do sistema (Padrão Singleton)
 */
export const salvarRegra = async (req, res) => {
  const { verificaCoordenador, exigeCertificado } = req.body;

  // Converte os inputs para booleano real (true/false) ou null se inválido
  const aprovacaoBool = toBoolean(verificaCoordenador);
  const certificadoBool = toBoolean(exigeCertificado);


  const validationErrors = [];
  
  if (verificaCoordenador !== undefined && aprovacaoBool === null) {
    validationErrors.push({
      field: "verificaCoordenador",
      message: "Informe true ou false.",
    });
  }
  
  if (exigeCertificado !== undefined && certificadoBool === null) {
    validationErrors.push({
      field: "exigeCertificado",
      message: "Informe true ou false.",
    });
  }

  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }


  try {
   
    const regraExistente = await prisma.regra.findFirst({ select: { id: true } });
    const idRegra = regraExistente?.id || "REGRA-GLOBAL-ID"; 

   
    const data = {
      verificaCoordenador: aprovacaoBool ?? false,
      exigeCertificado: certificadoBool ?? false,
    };

    
    const regra = await prisma.regra.upsert({
      where: { id: idRegra },
      update: data,
      create: { id: idRegra, ...data },
    });

    return res.json(regra);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao salvar regra.");
  }
};


export const buscarRegra = async (req, res) => {
  try {
    const regra = await prisma.regra.findFirst();
    
    return res.json(
      regra || {
        verificaCoordenador: false,
        exigeCertificado: false,
      }
    );
  } catch (error) {
    return handleControllerError(res, error, "Erro ao buscar regra.");
  }
};