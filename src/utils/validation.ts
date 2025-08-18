import { z } from 'zod';

// File validation schemas
export const csvFileSchema = z.object({
  name: z.string().regex(/\.(csv|CSV)$/, 'Il file deve essere in formato CSV'),
  size: z.number().max(10 * 1024 * 1024, 'Il file non può superare i 10MB'),
  type: z.string().regex(/^text\/csv$|^application\/vnd\.ms-excel$/, 'Tipo di file non valido'),
});

// Call data validation
export const callRecordSchema = z.object({
  callerNumber: z.string().min(1, 'Numero chiamante richiesto'),
  calledNumber: z.string().min(1, 'Numero chiamato richiesto'),
  duration: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Formato durata non valido (HH:MM:SS)'),
  timeCall: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Formato ora non valido (HH:MM:SS)'),
  dateCall: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Formato data non valido (DD-MM-YYYY)'),
});

// Client validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Nome cliente richiesto').max(100, 'Nome troppo lungo'),
  color: z.string().optional(),
  notes: z.string().max(500, 'Note troppo lunghe').optional(),
});

// Pricing validation
export const pricingSchema = z.object({
  landlineRate: z.number().min(0, 'Tariffa non può essere negativa').max(10, 'Tariffa troppo alta'),
  mobileRate: z.number().min(0, 'Tariffa non può essere negativa').max(10, 'Tariffa troppo alta'),
  monthlyFlatFee: z.number().min(0, 'Canone non può essere negativo').max(1000, 'Canone troppo alto'),
  forfaitOnly: z.boolean(),
  currency: z.string().length(3, 'Codice valuta deve essere di 3 caratteri'),
});

// Validation utilities
export const validateFile = (file: File): { valid: boolean; errors: string[] } => {
  try {
    csvFileSchema.parse({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(err => err.message),
      };
    }
    return { valid: false, errors: ['Errore di validazione sconosciuto'] };
  }
};

export const validateCallRecord = (record: any): { valid: boolean; errors: string[] } => {
  try {
    callRecordSchema.parse(record);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return { valid: false, errors: ['Errore di validazione sconosciuto'] };
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000); // Limit length
};

export const isValidPhoneNumber = (number: string): boolean => {
  // Basic phone number validation (can be extended)
  const phoneRegex = /^[\d\+\-\(\)\s#]{3,20}$/;
  return phoneRegex.test(number);
};

export const isValidDuration = (duration: string): boolean => {
  const durationRegex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;
  return durationRegex.test(duration);
};

export const parseSecureFloat = (value: string | number): number => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  
  const parsed = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, 999999.99));
};

export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  try {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
};