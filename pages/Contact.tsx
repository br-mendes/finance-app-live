import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Send, CheckCircle, MessageSquare } from 'lucide-react';
import { emailService } from '../services/emailService';
import { useToast } from '../components/ui/Toast';

export const Contact: React.FC = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const success = await emailService.sendContactMessage(
            formData.name,
            formData.email,
            formData.subject,
            formData.message
        );

        if (success) {
            setSubmitted(true);
            addToast('Mensagem enviada com sucesso!', 'success');
            // Reset after showing success
            setTimeout(() => {
                 setSubmitted(false);
                 setFormData({ name: '', email: '', subject: '', message: '' });
            }, 5000);
        } else {
            addToast('Erro ao enviar mensagem. Tente novamente.', 'error');
        }
    } catch (error) {
        addToast('Ocorreu um erro inesperado.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="text-primary-600" size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900">Fale Conosco</h1>
        <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto">
          Tem alguma dúvida, sugestão ou precisa de ajuda com sua conta? 
          Preencha o formulário abaixo e nossa equipe entrará em contato.
        </p>
      </div>

      <Card className="shadow-lg border-t-4 border-t-primary-500">
          {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="text-green-600" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
                  <p className="text-gray-600 max-w-md mb-8">
                      Recebemos seu contato e retornaremos para <strong>{formData.email}</strong> o mais breve possível.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                      Enviar nova mensagem
                  </Button>
              </div>
          ) : (
              <form onSubmit={handleSubmit} className="space-y-6 p-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                          <input
                              type="text"
                              required
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-3 bg-gray-50 focus:bg-white transition-colors"
                              placeholder="Seu nome"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                          <input
                              type="email"
                              required
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-3 bg-gray-50 focus:bg-white transition-colors"
                              placeholder="seu@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assunto <span className="text-red-500">*</span></label>
                      <input
                          type="text"
                          required
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-3 bg-gray-50 focus:bg-white transition-colors"
                          placeholder="Sobre o que você quer falar?"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem <span className="text-red-500">*</span></label>
                      <textarea
                          required
                          rows={6}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-3 bg-gray-50 focus:bg-white transition-colors resize-y"
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          placeholder="Digite sua mensagem aqui..."
                      ></textarea>
                  </div>

                  <div className="pt-2">
                      <Button type="submit" size="lg" loading={loading} fullWidth className="h-12 text-base shadow-md hover:shadow-lg transition-all">
                          <Send size={20} className="mr-2" />
                          Enviar Mensagem
                      </Button>
                  </div>
              </form>
          )}
      </Card>
    </div>
  );
};