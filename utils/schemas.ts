import { z } from 'zod';
import { isValidCPF } from './validators';
import { PlanType, TransactionType } from '../types';

// CPF Schema
export const cpfSchema = z.string()
  .min(11, "CPF incompleto")
  .refine((val) => isValidCPF(val), {
    message: "CPF inválido",
  });

// Address Schema
export const addressSchema = z.object({
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado (UF) deve ter 2 letras"),
  zipCode: z.string().min(8, "CEP inválido")
});

// Registration Schema
export const registerSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: cpfSchema,
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  address: addressSchema,
  plan: z.nativeEnum(PlanType)
});

// Transaction Schema
export const transactionSchema = z.object({
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  amount: z.number().positive("O valor deve ser positivo"),
  date: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    date.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return date <= today;
  }, { message: "Data futura não permitida" }),
  type: z.nativeEnum(TransactionType),
  category: z.string().min(1, "Categoria é obrigatória"),
  accountId: z.string().optional(),
  cardId: z.string().optional()
}).refine((data) => {
    if (data.type === TransactionType.DEBIT || data.type === TransactionType.RECEIVE) {
        return !!data.accountId;
    }
    return true;
}, {
    message: "Selecione uma conta bancária",
    path: ["accountId"]
}).refine((data) => {
    if (data.type === TransactionType.CREDIT) {
        return !!data.cardId;
    }
    return true;
}, {
    message: "Selecione um cartão de crédito",
    path: ["cardId"]
});