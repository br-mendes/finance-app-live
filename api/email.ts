// Endpoint serverless (Vercel) para e-mails (SendGrid) e newsletter
// (MailerLite). As chaves ficam apenas no servidor. As ações são tipadas e
// os templates montados aqui para o endpoint não servir de relay aberto.

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || process.env.VITE_SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = 'financeappbr@gmail.com'; // Remetente verificado no SendGrid
const ADMIN_EMAIL = 'financeappbr@gmail.com';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY || process.env.VITE_MAILERLITE_API_KEY || '';
const MAILERLITE_BASE_URL = 'https://connect.mailerlite.com/api';

/** Envia um e-mail via SendGrid; retorna `false` sem lançar em caso de falha. */
const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  if (!SENDGRID_API_KEY) {
    console.warn('[API Email] SENDGRID_API_KEY ausente — envio ignorado.');
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
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDGRID_FROM_EMAIL, name: 'FinanceAPP' },
        subject,
        content: [{ type: 'text/html', value: html }]
      })
    });

    if (!response.ok) {
      console.error('[API Email] SendGrid error:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('[API Email] Failed to send:', error);
    return false;
  }
};

/** Envia e-mail de boas-vindas após o cadastro do usuário. */
const sendWelcome = async (user: { email: string; first_name: string }) => {
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
};

/** Notifica o usuário de que o plano Premium foi ativado com sucesso. */
const sendPremiumConfirmation = async (user: { email: string; first_name: string }) => {
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
};

/** Escapa caracteres HTML para evitar XSS nos templates de e-mail. */
const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Encaminha mensagem do formulário de contato ao admin e confirma recebimento ao remetente. */
const sendContactMessage = async (name: string, fromEmail: string, subject: string, message: string) => {
  const sName = escapeHtml(name);
  const sEmail = escapeHtml(fromEmail);
  const sSubject = escapeHtml(subject);
  const sMessage = escapeHtml(message);

  const emailSubject = `[Contato FinanceAPP] ${sSubject}`;
  const htmlAdmin = `
    <div style="font-family: sans-serif; color: #333;">
      <h2 style="color: #0ea5e9;">Nova Mensagem de Contato</h2>
      <p><strong>De:</strong> ${sName} (${sEmail})</p>
      <p><strong>Assunto:</strong> ${sSubject}</p>
      <hr/>
      <p style="white-space: pre-wrap;">${sMessage}</p>
    </div>
  `;

  const adminSent = await sendEmail(ADMIN_EMAIL, emailSubject, htmlAdmin);

  if (adminSent) {
    const htmlUser = `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #0ea5e9;">Recebemos sua mensagem!</h2>
        <p>Olá ${sName},</p>
        <p>Obrigado por entrar em contato. Nossa equipe analisará sua mensagem e retornará em breve.</p>
        <hr/>
        <p><strong>Sua mensagem:</strong></p>
        <p><em>${sMessage}</em></p>
      </div>
    `;
    await sendEmail(fromEmail, `Recebemos seu contato: ${sSubject}`, htmlUser);
  }

  return adminSent;
};

/** Insere ou atualiza um assinante no MailerLite. Retorna `false` se a API retornar erro. */
const upsertSubscriber = async (data: { email: string; name?: string; plan?: string }) => {
  if (!MAILERLITE_API_KEY) return false;
  try {
    const response = await fetch(`${MAILERLITE_BASE_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        fields: { name: data.name, plan: data.plan },
        groups: ['financeapp-users']
      })
    });
    if (!response.ok) {
      console.error('[API Email] MailerLite error:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('[API Email] MailerLite error:', error);
    return false;
  }
};

/** Endpoint Vercel: roteia ações de e-mail (welcome, premium-confirmation, contact, subscribe). */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};

    switch (body.action) {
      case 'welcome': {
        if (!body.user?.email) return res.status(400).json({ error: 'user obrigatório' });
        return res.status(200).json({ success: await sendWelcome(body.user) });
      }
      case 'premium-confirmation': {
        if (!body.user?.email) return res.status(400).json({ error: 'user obrigatório' });
        return res.status(200).json({ success: await sendPremiumConfirmation(body.user) });
      }
      case 'contact': {
        const { name, fromEmail, subject, message } = body;
        if (!name || !fromEmail || !message) return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
        return res.status(200).json({ success: await sendContactMessage(name, fromEmail, subject || '', message) });
      }
      case 'subscribe': {
        if (!body.email) return res.status(400).json({ error: 'email obrigatório' });
        return res.status(200).json({ success: await upsertSubscriber(body) });
      }
      default:
        return res.status(400).json({ error: 'Ação inválida' });
    }
  } catch (error: any) {
    console.error('[API Email Error]', error.message);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
