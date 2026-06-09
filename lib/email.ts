import nodemailer from "nodemailer"

/*
 * Variáveis de ambiente necessárias (.env):
 *   SMTP_HOST     — ex: smtp.gmail.com ou mail.paroquiasaosebastiaocuiaba.com.br
 *   SMTP_PORT     — ex: 587 (TLS) ou 465 (SSL) ou 25
 *   SMTP_SECURE   — "true" para SSL (porta 465), "false" para STARTTLS
 *   SMTP_USER     — e-mail remetente
 *   SMTP_PASSWORD — senha ou app-password
 *   SMTP_FROM     — ex: "Paróquia São Sebastião <noreply@paroquiasaosebastiaocuiaba.com.br>"
 */

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   ?? "localhost",
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER     ?? "",
      pass: process.env.SMTP_PASSWORD ?? "",
    },
  })
}

interface MailOptions {
  to:      string
  subject: string
  html:    string
  text?:   string
}

export async function sendMail({ to, subject, html, text }: MailOptions) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || process.env.SMTP_HOST === "") {
    console.warn("[email] SMTP não configurado — e-mail não enviado.")
    return
  }
  const transporter = createTransporter()
  await transporter.sendMail({
    from:    process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, ""),
  })
}

export function buildPasswordResetEmail(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Redefinir senha</title></head>
<body style="margin:0;padding:0;background:#F5F2EC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EC;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E2DBD0;">
        <!-- Header -->
        <tr>
          <td style="background:#1A3258;padding:28px 32px;text-align:center;">
            <p style="margin:0;color:#C9A84C;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;">
              Paróquia São Sebastião
            </p>
            <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:bold;">
              Redefinição de Senha
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:#2C2C2C;font-size:15px;">Olá, ${name}!</p>
            <p style="margin:0 0 24px;color:#6B6560;font-size:14px;line-height:1.6;">
              Recebemos uma solicitação para redefinir a senha da sua conta na
              <strong>Área do Dizimista</strong>. Clique no botão abaixo para criar uma nova senha:
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center" style="padding:8px 0 24px;">
                  <a href="${resetUrl}"
                    style="display:inline-block;background:#C9A84C;color:#ffffff;text-decoration:none;
                           padding:14px 32px;border-radius:8px;font-size:14px;font-weight:bold;
                           letter-spacing:0.5px;">
                    Redefinir minha senha
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:#6B6560;font-size:13px;line-height:1.6;">
              Este link é válido por <strong>1 hora</strong>. Caso não tenha solicitado a redefinição,
              ignore este e-mail — sua senha permanece a mesma.
            </p>
            <p style="margin:16px 0 0;color:#9B9490;font-size:12px;word-break:break-all;">
              Se o botão não funcionar, copie e cole este link no navegador:<br>
              <a href="${resetUrl}" style="color:#C9A84C;">${resetUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F5F2EC;padding:20px 32px;border-top:1px solid #E2DBD0;text-align:center;">
            <p style="margin:0;color:#9B9490;font-size:12px;">
              Paróquia São Sebastião — Cuiabá, MT<br>
              Este é um e-mail automático, por favor não responda.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
