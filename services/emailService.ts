import { User } from '../types';

// NOTE: In a production environment, this API Key should be stored in environment variables (process.env)
// and these calls should happen server-side (e.g., Supabase Edge Functions or Node.js backend)
// to prevent exposing the key to the client.
// Fix: Use process.env to avoid 'Property env does not exist on type ImportMeta' error
const SENDGRID_API_KEY = process.env.VITE_SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = 'financeappbr@gmail.com'; // Must be a verified sender in SendGrid

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API Key is missing. Check your VITE_SENDGRID_API_KEY environment variable.');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }]
          }
        ],
        from: { email: SENDGRID_FROM_EMAIL, name: 'FinanceAPP' },
        subject: subject,
        content: [
          {
            type: 'text/html',
            value: html
          }
        ]
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('SendGrid API Error:', errorData);
        return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

export const emailService = {
  async sendWelcomeEmail(user: User) {
    const subject = `Bem-vindo ao FinanceAPP, ${user.first_name}!`;
    const html = `
      <div style="font-family: sans-serif; color: #333;">
        <h1 style="color: #0ea5e9;">Bem-vindo ao FinanceAPP! 🚀</h1>
        <p>Olá <strong>${user.first_name}</strong>,</p>
        <p>Estamos muito felizes em ter você conosco. Agora você tem o controle total da sua vida financeira na palma da sua mão.</p>
        <p>O que você pode fazer agora:</p>
        <ul>
          <li>Cadastrar suas contas bancárias</li>
          <li>Organizar seus cartões de crédito</li>
          <li>Definir metas para realizar seus sonhos</li>
        </ul>
        <p>Se precisar de ajuda, responda a este email.</p>
        <p>Atenciosamente,<br/>Equipe FinanceAPP</p>
      </div>
    `;
    return sendEmail(user.email, subject, html);
  },

  async sendPremiumConfirmation(user: User) {
    const subject = 'Sua assinatura Premium foi ativada! 🌟';
    const html = `
      <div style="font-family: sans-serif; color: #333;">
        <h1 style="color: #f59e0b;">Você agora é Premium! 👑</h1>
        <p>Olá <strong>${user.first_name}</strong>,</p>
        <p>O pagamento foi confirmado e sua conta foi atualizada com sucesso.</p>
        <p>Aproveite seus novos benefícios:</p>
        <ul>
          <li>Contas e Cartões Ilimitados</li>
          <li>Radar do Mercado com IA</li>
          <li>Exportação de relatórios em PDF</li>
        </ul>
        <br/>
        <a href="https://finance-app-live.vercel.app/#/" style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Dashboard</a>
      </div>
    `;
    return sendEmail(user.email, subject, html);
  },

  async sendContactMessage(name: string, fromEmail: string, subject: string, message: string) {
    // Send to Admin
    const adminEmail = 'financeappbr@gmail.com';
    const emailSubject = `[Contato FinanceAPP] ${subject}`;
    
    const htmlAdmin = `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #0ea5e9;">Nova Mensagem de Contato</h2>
        <p><strong>De:</strong> ${name} (${fromEmail})</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <hr/>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `;

    // Try to send to admin
    const adminSent = await sendEmail(adminEmail, emailSubject, htmlAdmin);

    // If successful, send confirmation to user (optional but nice)
    if (adminSent) {
        const htmlUser = `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #0ea5e9;">Recebemos sua mensagem!</h2>
            <p>Olá ${name},</p>
            <p>Obrigado por entrar em contato. Nossa equipe analisará sua mensagem e retornará em breve.</p>
            <hr/>
            <p><strong>Sua mensagem:</strong></p>
            <p><em>${message}</em></p>
          </div>
        `;
        await sendEmail(fromEmail, `Recebemos seu contato: ${subject}`, htmlUser);
    }
    
    return adminSent;
  }
};