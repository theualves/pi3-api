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
  // Dica: Usando a logo oficial pública do Senac PE
  const logoUrl = "https://www.pe.senac.br/wp-content/uploads/2018/02/logo-senac-pe.png";

  const corpoHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f9;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f9; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
              
              <tr>
                <td align="center" style="background-color: #004A8D; padding: 30px 20px;">
                  <img src="${logoUrl}" alt="Senac" width="160" style="display: block; max-width: 100%; height: auto;" />
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px; color: #333333;">
                  <h2 style="color: #004A8D; margin-top: 0; text-align: center;">Recuperação de Acesso</h2>
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Olá, <strong>${nomeUsuario}</strong>,
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Portal de Atividades</strong>. Clique no botão abaixo para cadastrar sua nova senha com segurança:
                  </p>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${link}" style="background-color: #004A8D; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                          Redefinir Minha Senha
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="font-size: 14px; line-height: 1.6; color: #777777; margin-top: 40px;">
                    <em>Atenção: Este link é válido por apenas 1 hora.</em> Se você não solicitou essa alteração, por favor ignore este e-mail.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td align="center" style="background-color: #f8f9fa; padding: 20px; border-top: 1px solid #eeeeee;">
                  <p style="font-size: 12px; color: #999999; margin: 0;">
                    &copy; ${new Date().getFullYear()} Sistema de Horas Complementares - Senac PE. Todos os direitos reservados.
                  </p>
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
      from: `"Portal Acadêmico" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: "Recuperação de Senha - Portal de Atividades",
      html: corpoHtml,
    });
    console.log("✅ E-mail de recuperação aceito pelo provedor! ID:", info.messageId);
  } catch (error) {
    console.error("❌ ERRO FATAL AO ENVIAR RECUPERAÇÃO:", error);
    throw new Error("Falha no serviço de e-mail"); 
  }
};