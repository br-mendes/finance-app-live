import { User } from '../types';

// NOTE: In a production environment, this API Key should be stored in environment variables (process.env)
// and these calls should happen server-side (e.g., Supabase Edge Functions or Node.js backend)
// to prevent exposing the key to the client.
// We check for Vite Env Var first, then fallback to the provided key for demo purposes.
const RESEND_API_KEY = import.meta.env?.VITE_RESEND_API_KEY || '017e1f38-7843-44fc-adff-412e33f2f289';

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'FinanceAPP <onboarding@resend.dev>', // Default testing domain for Resend
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Resend API Error:', errorData);
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
        <a href="https://financeapp.com/#/" style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Dashboard</a>
      </div>
    `;
    return sendEmail(user.email, subject, html);
  },

  async sendContactMessage(name: string, fromEmail: string, subject: string, message: string) {
    // In a real app, 'to' would be the admin email. 
    // Since Resend Free Tier allows sending ONLY to the registered account email, 
    // we assume the 'fromEmail' (user) is also the destination for this demo to ensure delivery,
    // or you strictly send to your own registered email.
    
    // For this demo, we send to the user as a "Copy of your message" to prove it works.
    const emailSubject = `[Contato FinanceAPP] ${subject}`;
    const html = `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #0ea5e9;">Nova Mensagem de Contato</h2>
        <p><strong>De:</strong> ${name} (${fromEmail})</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <hr/>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `;
    return sendEmail(fromEmail, emailSubject, html);
  }
};