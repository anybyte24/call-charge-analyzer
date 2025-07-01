import { PrefixConfig } from '@/types/call-analysis';

export class NumberCategorizer {
  static defaultPrefixConfig: PrefixConfig[] = [
    // Numeri verdi e speciali (priorità massima - prefissi più specifici)
    { prefix: '800', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '803', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '199', category: 'special', description: 'Numero Premium', costPerMinute: 0.90 },
    { prefix: '899', category: 'special', description: 'Numero Premium', costPerMinute: 0.90 },
    { prefix: '190', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '191', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '192', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '187', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '188', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    
    // Fissi completi (da 2 a 4 cifre - priorità alta)
    // Milano e provincia
    { prefix: '02', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Roma e provincia
    { prefix: '06', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Torino e Piemonte
    { prefix: '011', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0121', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0122', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0123', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0124', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0125', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0131', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0141', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0142', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0143', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0144', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0161', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0163', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0165', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0166', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0171', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0172', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0173', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0174', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0175', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Genova e Liguria
    { prefix: '010', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0182', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0183', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0184', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0185', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0187', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Lombardia
    { prefix: '030', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '031', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '032', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '035', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0362', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0363', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0364', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0365', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0371', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0372', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0373', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0374', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0375', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0376', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0377', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0381', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0382', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0383', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0384', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0385', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Veneto
    { prefix: '041', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '042', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '043', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '044', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '045', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '049', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Friuli Venezia Giulia
    { prefix: '040', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0427', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0428', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0431', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0432', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0433', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0434', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Emilia Romagna
    { prefix: '051', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '052', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '053', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '054', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0521', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0522', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0523', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0524', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0525', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0532', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0533', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0534', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0535', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0536', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0541', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0542', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0543', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0544', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0545', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0546', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0547', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0583', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Toscana
    { prefix: '055', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0564', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0565', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0566', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0571', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0572', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0573', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0574', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0575', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0577', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0578', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0584', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0585', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0586', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0587', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0588', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Lazio
    { prefix: '0761', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0771', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0773', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0774', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0775', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0776', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '0781', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Campania
    { prefix: '081', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '082', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '083', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // Sicilia
    { prefix: '091', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '092', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '093', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    { prefix: '095', category: 'landline', description: 'Fisso', costPerMinute: 0.03 },
    
    // TUTTI I MOBILE - Ora con descrizione generica "Mobile"
    { prefix: '330', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '331', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '333', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '334', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '335', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '336', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '337', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '338', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '339', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '340', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '341', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '342', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '343', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '344', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '345', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '346', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '347', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '348', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '349', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '350', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '351', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '352', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '353', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '354', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '355', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '356', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '357', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '358', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '359', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '360', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '361', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '362', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '363', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '364', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '365', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '366', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '367', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '368', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '369', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '380', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '383', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '388', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '389', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '320', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '321', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '322', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '323', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '324', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '327', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '328', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '329', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '390', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '391', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '392', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '393', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '394', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '395', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '396', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '397', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '398', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '399', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '370', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '371', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '372', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '373', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '374', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '375', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '376', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '377', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '378', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '379', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '325', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '326', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    
    // Prefissi generici (SOLO ALLA FINE - priorità bassa)
    { prefix: '0', category: 'landline', description: 'Fisso', costPerMinute: 0.05 },
    { prefix: '3', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '7', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '1', category: 'special', description: 'Numero Speciale', costPerMinute: 0.50 },
    
    // Prefissi internazionali
    { prefix: '+1', category: 'special', description: 'Internazionale', costPerMinute: 0.25 },
    { prefix: '+44', category: 'special', description: 'Internazionale', costPerMinute: 0.20 },
    { prefix: '+33', category: 'special', description: 'Internazionale', costPerMinute: 0.18 },
    { prefix: '+49', category: 'special', description: 'Internazionale', costPerMinute: 0.18 },
    { prefix: '+34', category: 'special', description: 'Internazionale', costPerMinute: 0.18 },
    { prefix: '+41', category: 'special', description: 'Internazionale', costPerMinute: 0.30 },
    { prefix: '+43', category: 'special', description: 'Internazionale', costPerMinute: 0.22 },
    { prefix: '+86', category: 'special', description: 'Internazionale', costPerMinute: 0.35 },
    { prefix: '+81', category: 'special', description: 'Internazionale', costPerMinute: 0.40 },
    { prefix: '+91', category: 'special', description: 'Internazionale', costPerMinute: 0.30 },
    { prefix: '+55', category: 'special', description: 'Internazionale', costPerMinute: 0.28 },
    { prefix: '+7', category: 'special', description: 'Internazionale', costPerMinute: 0.35 }
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
