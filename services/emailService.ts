import { User } from '../types';

// Os e-mails são enviados pelo endpoint serverless /api/email — a chave do
// SendGrid vive apenas no servidor.

/** Faz POST para `/api/email` e retorna `true` se a resposta indicar sucesso. */
const callEmailApi = async (payload: Record<string, any>): Promise<boolean> => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Email API Error:', await response.text());
      return false;
    }

    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

export const emailService = {
  /** Envia e-mail de boas-vindas ao novo usuário. */
  async sendWelcomeEmail(user: User) {
    return callEmailApi({
      action: 'welcome',
      user: { email: user.email, first_name: user.first_name }
    });
  },

  /** Notifica o usuário sobre a ativação do plano Premium. */
  async sendPremiumConfirmation(user: User) {
    return callEmailApi({
      action: 'premium-confirmation',
      user: { email: user.email, first_name: user.first_name }
    });
  },

  /** Encaminha mensagem do formulário de contato via `/api/email`. */
  async sendContactMessage(name: string, fromEmail: string, subject: string, message: string) {
    return callEmailApi({ action: 'contact', name, fromEmail, subject, message });
  }
};
