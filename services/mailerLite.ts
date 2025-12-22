const MAILERLITE_API_KEY = process.env.VITE_MAILERLITE_API_KEY || '';
const MAILERLITE_BASE_URL = 'https://connect.mailerlite.com/api';

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
  if (!MAILERLITE_API_KEY) return;
  try {
    await fetch(`${MAILERLITE_BASE_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        fields: {
          name: data.name,
          plan: data.plan
        },
        groups: ['financeapp-users']
      })
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