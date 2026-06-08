import nodemailer from 'nodemailer';

// Ajuste no transporter para evitar bloqueios de segurança
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // True para 465, False para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarEmailNotificacao = async (destinatario, nomeAluno, status, motivo = "") => {
  const assunto = status === "APROVADA" ? "✅ Atividade Aprovada!" : "❌ Ajuste Necessário na Atividade";
  
  const corpo = `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Olá, ${nomeAluno}!</h2>
      <p>O coordenador avaliou sua atividade complementar no sistema.</p>
      <p><strong>Resultado:</strong> <span style="color: ${status === "APROVADA" ? "green" : "red"}">${status}</span></p>
      ${status === "REJEITADA" ? `<p><strong>O que corrigir:</strong> ${motivo}</p>` : ""}
      <br>
      <p>Acesse o portal para mais detalhes.</p>
      <hr>
      <small>Sistema de Horas Complementares - Senac</small>
    </div>
  `;

  try {
    await transporter.sendMail({
      // 👉 MUDANÇA: Usando o seu e-mail real do .env para não ser barrado como Spam
      from: `"Sistema Senac" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html: corpo,
    });
    console.log(`📧 E-mail de notificação enviado para: ${destinatario}`);
  } catch (error) {
    console.error("❌ Falha ao enviar e-mail:", error);
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
    const info = await transporter.sendMail({
      from: `"Portal de Atividades" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: "Recuperação de Senha - Portal Senac",
      html: corpoHtml,
    });
    console.log("✅ E-mail formatado enviado! ID:", info.messageId);
  } catch (error) {
    console.error("❌ ERRO FATAL AO ENVIAR RECUPERAÇÃO:", error);
    throw new Error("Falha no serviço de e-mail"); 
  }
};