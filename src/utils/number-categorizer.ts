
import { PrefixConfig } from '@/types/call-analysis';

export class NumberCategorizer {
  static defaultPrefixConfig: PrefixConfig[] = [
    // Numeri verdi e speciali (priorità massima - prefissi più specifici)
    { prefix: '800', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '803', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '199', category: 'special', description: 'Numero Premium', costPerMinute: 0.90 },
    { prefix: '899', category: 'special', description: 'Numero Premium', costPerMinute: 0.90 },
    { prefix: '190', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    { prefix: '191', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    { prefix: '192', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    { prefix: '187', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    { prefix: '188', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    
    // Fissi specifici (3 cifre - priorità alta)
    { prefix: '010', category: 'landline', description: 'Fisso Genova', costPerMinute: 0.03 },
    { prefix: '011', category: 'landline', description: 'Fisso Torino', costPerMinute: 0.03 },
    { prefix: '051', category: 'landline', description: 'Fisso Bologna', costPerMinute: 0.03 },
    { prefix: '055', category: 'landline', description: 'Fisso Firenze', costPerMinute: 0.03 },
    { prefix: '081', category: 'landline', description: 'Fisso Napoli', costPerMinute: 0.03 },
    { prefix: '091', category: 'landline', description: 'Fisso Palermo', costPerMinute: 0.03 },
    { prefix: '040', category: 'landline', description: 'Fisso Trieste', costPerMinute: 0.03 },
    { prefix: '045', category: 'landline', description: 'Fisso Verona', costPerMinute: 0.03 },
    { prefix: '049', category: 'landline', description: 'Fisso Padova', costPerMinute: 0.03 },
    
    // Fissi 2 cifre
    { prefix: '02', category: 'landline', description: 'Fisso Milano', costPerMinute: 0.03 },
    { prefix: '06', category: 'landline', description: 'Fisso Roma', costPerMinute: 0.03 },
    
    // Mobile TIM (3 cifre specifiche)
    { prefix: '330', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '331', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '333', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '334', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '335', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '336', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '337', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '338', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '339', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '340', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '341', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '342', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '343', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '344', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '345', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '346', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '347', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '348', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '349', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    
    // Mobile Vodafone (3 cifre specifiche)
    { prefix: '350', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '351', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '352', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '353', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '354', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '355', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '356', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '357', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '358', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '359', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '360', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '361', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '362', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '363', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '364', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '365', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '366', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '367', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '368', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '369', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '380', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '383', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '388', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '389', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    
    // Mobile Wind/Tre (3 cifre specifiche)
    { prefix: '320', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '321', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '322', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '323', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '324', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '327', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '328', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '329', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '390', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '391', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '392', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '393', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '394', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '395', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '396', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '397', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '398', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '399', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    
    // Prefissi generici (SOLO ALLA FINE - priorità bassa)
    { prefix: '0', category: 'landline', description: 'Fisso', costPerMinute: 0.05 },
    { prefix: '3', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '7', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '1', category: 'special', description: 'Numero Speciale', costPerMinute: 0.50 },
    
    // Prefissi internazionali
    { prefix: '+1', category: 'special', description: 'USA/Canada', costPerMinute: 0.25 },
    { prefix: '+44', category: 'special', description: 'Regno Unito', costPerMinute: 0.20 },
    { prefix: '+33', category: 'special', description: 'Francia', costPerMinute: 0.18 },
    { prefix: '+49', category: 'special', description: 'Germania', costPerMinute: 0.18 },
    { prefix: '+34', category: 'special', description: 'Spagna', costPerMinute: 0.18 },
    { prefix: '+41', category: 'special', description: 'Svizzera', costPerMinute: 0.30 },
    { prefix: '+43', category: 'special', description: 'Austria', costPerMinute: 0.22 },
    { prefix: '+86', category: 'special', description: 'Cina', costPerMinute: 0.35 },
    { prefix: '+81', category: 'special', description: 'Giappone', costPerMinute: 0.40 },
    { prefix: '+91', category: 'special', description: 'India', costPerMinute: 0.30 },
    { prefix: '+55', category: 'special', description: 'Brasile', costPerMinute: 0.28 },
    { prefix: '+7', category: 'special', description: 'Russia', costPerMinute: 0.35 }
  ];

  static cleanPhoneNumber(number: string): string {
    // Rimuovi tutti i caratteri non numerici eccetto il +
    return number.replace(/[^+0-9]/g, '');
  }

  static removeItalianPrefix(number: string): string {
    const clean = this.cleanPhoneNumber(number);
    
    console.log('🔍 Removing Italian prefix from:', clean);
    
    // Rimuovi prefisso italiano in tutte le forme possibili
    if (clean.startsWith('+39')) {
      const result = clean.substring(3);
      console.log('✅ Removed +39 prefix, result:', result);
      return result;
    }
    
    if (clean.startsWith('0039')) {
      const result = clean.substring(4);
      console.log('✅ Removed 0039 prefix, result:', result);
      return result;
    }
    
    if (clean.startsWith('39') && clean.length >= 8) {
      const result = clean.substring(2);
      console.log('✅ Removed 39 prefix, result:', result);
      return result;
    }
    
    console.log('ℹ️ No Italian prefix found, using original:', clean);
    return clean;
  }

  static categorizeNumber(originalNumber: string, prefixConfig: PrefixConfig[] = this.defaultPrefixConfig) {
    console.log('🎯 === STARTING CATEGORIZATION ===');
    console.log('📞 Original number:', originalNumber);
    
    const cleanNumber = this.cleanPhoneNumber(originalNumber);
    console.log('🧽 Cleaned number:', cleanNumber);
    
    // Gestisci numeri internazionali NON italiani
    if (cleanNumber.startsWith('+') && !cleanNumber.startsWith('+39')) {
      console.log('🌍 International (non-Italian) number detected');
      return this.categorizeInternational(cleanNumber, prefixConfig);
    }
    
    // Per tutti i numeri italiani (con o senza prefisso), rimuovi il prefisso
    const italianNumber = this.removeItalianPrefix(cleanNumber);
    console.log('🇮🇹 Italian number for analysis:', italianNumber);
    
    if (!italianNumber || italianNumber.length < 3) {
      console.log('❌ Invalid Italian number');
      return { type: 'unknown' as const, description: 'Altro', costPerMinute: 0 };
    }
    
    return this.categorizeItalianNumber(italianNumber, prefixConfig);
  }

  static categorizeInternational(number: string, prefixConfig: PrefixConfig[]) {
    console.log('🌍 Categorizing international number:', number);
    
    // Ordina i prefissi internazionali per lunghezza (più lunghi prima)
    const intlPrefixes = prefixConfig
      .filter(p => p.prefix.startsWith('+') && p.prefix !== '+39')
      .sort((a, b) => b.prefix.length - a.prefix.length);
    
    for (const config of intlPrefixes) {
      if (number.startsWith(config.prefix)) {
        console.log('✅ International match:', config.prefix, '→', config.description);
        return {
          type: config.category,
          description: config.description,
          costPerMinute: config.costPerMinute
        };
      }
    }
    
    console.log('❓ Unknown international number');
    return { type: 'unknown' as const, description: 'Internazionale Sconosciuto', costPerMinute: 0.50 };
  }

  static categorizeItalianNumber(number: string, prefixConfig: PrefixConfig[]) {
    console.log('🇮🇹 Categorizing Italian number:', number);
    
    // Filtra solo prefissi italiani (non internazionali) e ordina per lunghezza
    const italianPrefixes = prefixConfig
      .filter(p => !p.prefix.startsWith('+'))
      .sort((a, b) => {
        // Prima ordina per lunghezza (più lunghi prima)
        if (a.prefix.length !== b.prefix.length) {
          return b.prefix.length - a.prefix.length;
        }
        // Poi ordina alfabeticamente per stabilità
        return a.prefix.localeCompare(b.prefix);
      });
    
    console.log('📋 Checking prefixes in order:', italianPrefixes.map(p => p.prefix).slice(0, 10));
    
    for (const config of italianPrefixes) {
      if (number.startsWith(config.prefix)) {
        console.log('✅ MATCH FOUND:', config.prefix, '→', config.description);
        return {
          type: config.category,
          description: config.description,
          costPerMinute: config.costPerMinute
        };
      }
    }
    
    console.log('❌ No matching prefix found for:', number);
    return { type: 'unknown' as const, description: 'Altro', costPerMinute: 0 };
  }
}
