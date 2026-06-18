export const enviarEmailNotificacao = async (destinatario, nomeAluno, status, motivo = "") => {
  const assunto = status === "APROVADA" ? "✅ Atividade Aprovada!" : "❌ Ajuste Necessário na Atividade";
  
  // Define a cor de destaque baseada no status
  const corStatus = status === "APROVADA" ? "#28a745" : "#dc3545"; 
  const logoUrl = "https://senachoras.vercel.app/logo-email.png";
  const linkPortal = "https://senachoras.vercel.app"; // Link para o aluno acessar o sistema

  const corpoHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #EAEAEA;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #EAEAEA; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
              
              <tr>
                <td style="padding: 20px 30px;">
                  <img src="${logoUrl}" alt="Senac" width="100" style="display: block; border: none;" />
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #0073CE; padding: 20px 30px;">
                  <h2 style="color: #FFFFFF; font-size: 18px; margin: 0; font-weight: normal; text-transform: uppercase;">
                    ATUALIZAÇÃO DE ATIVIDADE COMPLEMENTAR
                  </h2>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px 20px 30px; color: #333333;">
                  <h3 style="color: #125F6E; font-size: 18px; margin-top: 0; margin-bottom: 25px; text-transform: uppercase;">
                    AVALIAÇÃO DA COORDENAÇÃO
                  </h3>
                  
                  <p style="font-size: 14px; margin-bottom: 20px; color: #4A4A4A;">
                    Olá, <strong>${nomeAluno}</strong>,
                  </p>
                  
                  <p style="font-size: 14px; margin-bottom: 20px; color: #4A4A4A; line-height: 1.5;">
                    Sua submissão de atividade complementar no sistema Horas+ acabou de ser avaliada.
                  </p>

                  <p style="font-size: 16px; margin-bottom: 20px; color: #4A4A4A;">
                    <strong>Resultado da Avaliação:</strong> 
                    <span style="color: ${corStatus}; font-weight: bold;">${status}</span>
                  </p>

                  ${status === "REJEITADA" || status === "REPROVADA" ? `
                    <div style="background-color: #FFF3F3; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 25px;">
                      <p style="margin: 0; font-size: 14px; color: #4A4A4A;">
                        <strong>O que precisa ser corrigido:</strong><br>${motivo}
                      </p>
                    </div>
                  ` : ""}

                  <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; margin-top: 10px;">
                    <tr>
                      <td align="center" bgcolor="#F58220" style="border-radius: 4px;">
                        <a href="${linkPortal}" target="_blank" style="font-size: 14px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 24px; display: inline-block; border-radius: 4px; font-weight: bold;">
                          Acessar o Portal
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="font-size: 12px; color: #777777;">
                    Para mais detalhes ou dúvidas, acesse o portal ou procure sua coordenação.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td align="center" style="padding: 20px 30px;">
                  <p style="color: #125F6E; font-size: 18px; margin: 0 0 5px 0;">Atenciosamente,</p>
                  <p style="color: #125F6E; font-size: 14px; margin: 0;">Coordenação - Senac Pernambuco</p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding: 10px 30px 30px 30px;">
                  <p style="color: #125F6E; font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">Siga nos</p>
                  <a href="https://www.linkedin.com/company/senacpe" style="text-decoration: none; margin: 0 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="20" alt="LinkedIn" style="filter: brightness(0) saturate(100%) invert(32%) sepia(21%) saturate(1512%) hue-rotate(149deg) brightness(97%) contrast(93%);" />
                  </a>
                  <a href="https://www.instagram.com/senacpe/" style="text-decoration: none; margin: 0 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" alt="Instagram" style="filter: brightness(0) saturate(100%) invert(32%) sepia(21%) saturate(1512%) hue-rotate(149deg) brightness(97%) contrast(93%);" />
                  </a>
                  <a href="https://x.com/senacpe" style="text-decoration: none; margin: 0 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733590.png" width="20" alt="Twitter" style="filter: brightness(0) saturate(100%) invert(32%) sepia(21%) saturate(1512%) hue-rotate(149deg) brightness(97%) contrast(93%);" />
                  </a>
                </td>
              </tr>
              
              <tr>
                <td align="center" style="background-color: #F4F4F4; padding: 25px;">
                  <img src="https://senachoras.vercel.app/LOGO-SENAC80.png" alt="Senac" width="80" style="display: block; border: none;" />
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, 
      },
      body: JSON.stringify({
        sender: { name: "Portal de Atividades", email: process.env.EMAIL_USER },
        to: [{ email: destinatario }],
        subject: assunto,
        htmlContent: corpoHtml,
      }),
    });

    if (!response.ok) throw new Error("Falha na API do Brevo");
    console.log(`✅ E-mail formatado de notificação enviado para: ${destinatario}`);
  } catch (error) {
    console.error("❌ Falha ao enviar e-mail de notificação:", error);
  }
};

export const enviarEmailRecuperacao = async (destinatario, nomeUsuario, link) => {
  const logoUrl = "https://senachoras.vercel.app/logo-email.png";

  const corpoHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #EAEAEA;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #EAEAEA; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
              
              <tr>
                <td style="padding: 20px 30px;">
                  <img src="${logoUrl}" alt="Senac" width="100" style="display: block; border: none;" />
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #0073CE; padding: 20px 30px;">
                  <h2 style="color: #FFFFFF; font-size: 18px; margin: 0; font-weight: normal; text-transform: uppercase;">
                    RECUPERAÇÃO DE ACESSO: PORTAL DE ATIVIDADES
                  </h2>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px 20px 30px; color: #333333;">
                  <h3 style="color: #125F6E; font-size: 18px; margin-top: 0; margin-bottom: 25px; text-transform: uppercase;">
                    REDEFINIÇÃO DE SENHA
                  </h3>
                  
                  <p style="font-size: 14px; margin-bottom: 20px; color: #4A4A4A;">
                    Olá, ${nomeUsuario}
                  </p>
                  
                  <p style="font-size: 14px; margin-bottom: 30px; color: #4A4A4A; line-height: 1.5;">
                    Recebemos uma solicitação para redefinir a senha da sua conta no sistema de Horas Complementares. Clique no botão abaixo para criar sua nova senha:
                  </p>

                  <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                    <tr>
                      <td align="center" bgcolor="#0073CE" style="border-radius: 4px;">
                        <a href="${link}" target="_blank" style="font-size: 14px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 24px; display: inline-block; border-radius: 4px; font-weight: bold;">
                          Redefinir Minha Senha
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="font-size: 12px; color: #777777;">
                    Se você não solicitou essa alteração, ignore este e-mail.<br>Este link expira em 1 hora.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td align="center" style="padding: 20px 30px;">
                  <p style="color: #125F6E; font-size: 18px; margin: 0 0 5px 0;">Atenciosamente,</p>
                  <p style="color: #125F6E; font-size: 14px; margin: 0;">Senac Pernambuco</p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding: 10px 30px 30px 30px;">
                  <p style="color: #125F6E; font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">Siga nos</p>
                  <a href="https://www.linkedin.com/company/senacpe" style="text-decoration: none; margin: 0 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="20" alt="LinkedIn" style="filter: brightness(0) saturate(100%) invert(32%) sepia(21%) saturate(1512%) hue-rotate(149deg) brightness(97%) contrast(93%);" />
                  </a>
                  <a href="https://www.instagram.com/senacpe/" style="text-decoration: none; margin: 0 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" alt="Instagram" style="filter: brightness(0) saturate(100%) invert(32%) sepia(21%) saturate(1512%) hue-rotate(149deg) brightness(97%) contrast(93%);" />
                  </a>
                  <a href="https://x.com/senacpe" style="text-decoration: none; margin: 0 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733590.png" width="20" alt="Twitter" style="filter: brightness(0) saturate(100%) invert(32%) sepia(21%) saturate(1512%) hue-rotate(149deg) brightness(97%) contrast(93%);" />
                  </a>
                </td>
              </tr>
              
              <tr>
                <td align="center" style="background-color: #F4F4F4; padding: 25px;">
                  <img src="https://senachoras.vercel.app/LOGO-SENAC80.png" alt="Senac" width="80" style="display: block; border: none;" />
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, 
      },
      body: JSON.stringify({
        sender: { name: "Portal de Atividades", email: process.env.EMAIL_USER },
        to: [{ email: destinatario }],
        subject: "Recuperação de Senha - Portal Senac",
        htmlContent: corpoHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro interno do Brevo:", errorData);
      throw new Error("Falha na API");
    }

    console.log("✅ E-mail formatado enviado via Brevo!");
  } catch (error) {
    console.error("❌ ERRO FATAL AO ENVIAR RECUPERAÇÃO:", error);
    throw new Error("Falha no serviço de e-mail"); 
  }
};