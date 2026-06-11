// A chave do MailerLite vive apenas no endpoint serverless /api/email.

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, any>;
}

export const EmailTemplates = {
  WELCOME_FREE: 'welcome-free',
  WELCOME_PREMIUM: 'welcome-premium',
  PAYMENT_CONFIRMED: 'payment-confirmed',
  PASSWORD_RESET: 'password-reset',
};

export const upsertSubscriber = async (data: { email: string, name?: string, plan?: string }) => {
  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'subscribe', ...data })
    });
  } catch (error) {
    console.error('Error adding subscriber:', error);
  }
};

export const sendTransactionalEmail = async (data: EmailData) => {
    // Nota: Em um app real, usaríamos a API de transacional do MailerLite ou similar
    // Aqui simulamos o envio registrando o interesse
    console.log(`[Email Mock] Enviando e-mail para ${data.to}: ${data.subject} (Template: ${data.template})`);
    return true;
};

export const sendWelcomeEmail = async (userData: {
  email: string;
  name: string;
  plan: 'free' | 'premium';
}) => {
  await upsertSubscriber({ email: userData.email, name: userData.name, plan: userData.plan });
  return sendTransactionalEmail({
    to: userData.email,
    subject: userData.plan === 'premium' ? '🎉 Bem-vindo ao FinanceApp Premium!' : 'Bem-vindo ao FinanceApp!',
    template: userData.plan === 'premium' ? EmailTemplates.WELCOME_PREMIUM : EmailTemplates.WELCOME_FREE,
    variables: { name: userData.name }
  });
};

export const sendPasswordResetEmail = async (data: {
  to: string;
  name: string;
  resetToken: string;
  resetLink: string;
  expiresAt: string;
}) => {
  // Nota: O HTML abaixo é o template visual para o e-mail
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha - FinanceApp</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">🔐 Recuperação de Senha</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px;">
        <h2>Olá, ${data.name}!</h2>
        
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no FinanceApp.</p>
        
        <div style="background: white; border: 2px dashed #0ea5e9; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #0ea5e9; margin-top: 0;">Seu Código de Recuperação</h3>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; margin: 15px 0;">
            ${data.resetToken.substring(0, 6)}
          </div>
          <p style="font-size: 14px; color: #666;">
            Código completo: ${data.resetToken}
          </p>
        </div>
        
        <p style="text-align: center;">
          <a href="${data.resetLink}" 
             style="display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Redefinir Senha
          </a>
        </p>
        
        <p><strong>Ou copie e cole este link no seu navegador:</strong><br>
        <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; word-break: break-all;">
          ${data.resetLink}
        </code></p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Importante:</strong> Este link é válido por 1 hora (até ${data.expiresAt}).
            Se você não solicitou esta redefinição, ignore este e-mail.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee;">
        <p>© ${new Date().getFullYear()} FinanceApp. Todos os direitos reservados.</p>
      </div>
    </body>
    </html>
  `;

  console.log(`[Email Mock] Gerando HTML de Reset para ${data.to}`);
  
  return sendTransactionalEmail({
    to: data.to,
    subject: '🔐 Recuperação de Senha - FinanceApp',
    template: EmailTemplates.PASSWORD_RESET,
    variables: {
      name: data.name,
      resetToken: data.resetToken,
      resetLink: data.resetLink,
      expiresAt: data.expiresAt,
      htmlContent: html // Simulação de envio do corpo do e-mail
    }
  });
};
