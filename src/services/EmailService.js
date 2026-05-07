import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
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
      from: '"Sistema Senac" <noreply@senac.com>',
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
  const corpo = `
    <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #ddd; padding: 20px;">
      <h2 style="color: #004587;">Recuperação de Senha - Senac</h2>
      <p>Olá, <strong>${nomeUsuario}</strong>,</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Se não foi você, ignore este e-mail.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #004587; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Redefinir Minha Senha
        </a>
      </div>
      <p style="font-size: 12px; color: #777;">Este link é válido por 1 hora.</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Suporte Senac" <noreply@senac.com>',
    to: destinatario,
    subject: "Recuperação de Senha",
    html: corpo,
  });
};
