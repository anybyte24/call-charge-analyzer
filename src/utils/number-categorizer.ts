import { PrefixConfig } from '@/types/call-analysis';

export class NumberCategorizer {
  static defaultPrefixConfig: PrefixConfig[] = [
    // Numeri verdi e speciali (priorità massima - prefissi più specifici)
    { prefix: '800', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '803', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '199', category: 'special', description: 'Numero Premium', costPerMinute: 0.15 },
    { prefix: '899', category: 'special', description: 'Numero Premium', costPerMinute: 0.90 },
    { prefix: '190', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '191', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '192', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '187', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '188', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    
    // SPAGNA (0034) - Prima i prefissi specifici, poi quelli generici
    // Fissi Spagna - principali città
    { prefix: '003491', category: 'international', description: 'Spagna Fisso - Madrid', costPerMinute: 0.18 },
    { prefix: '003493', category: 'international', description: 'Spagna Fisso - Barcelona', costPerMinute: 0.18 },
    { prefix: '003495', category: 'international', description: 'Spagna Fisso - Valencia', costPerMinute: 0.18 },
    { prefix: '003496', category: 'international', description: 'Spagna Fisso - Alicante', costPerMinute: 0.18 },
    { prefix: '003494', category: 'international', description: 'Spagna Fisso - Siviglia', costPerMinute: 0.18 },
    { prefix: '003498', category: 'international', description: 'Spagna Fisso - Bilbao', costPerMinute: 0.18 },
    { prefix: '003497', category: 'international', description: 'Spagna Fisso - Asturias', costPerMinute: 0.18 },
    { prefix: '003492', category: 'international', description: 'Spagna Fisso - La Coruña', costPerMinute: 0.18 },
    // Mobili Spagna
    { prefix: '00346', category: 'international', description: 'Spagna Mobile', costPerMinute: 0.22 },
    { prefix: '00347', category: 'international', description: 'Spagna Mobile', costPerMinute: 0.22 },
    { prefix: '00348', category: 'international', description: 'Spagna Mobile', costPerMinute: 0.22 },
    { prefix: '00349', category: 'international', description: 'Spagna Mobile', costPerMinute: 0.22 },
    // Spagna generica (DOPO i prefissi specifici)
    { prefix: '0034', category: 'international', description: 'Spagna', costPerMinute: 0.18 },
    
    // FRANCIA (0033) - Prima i prefissi specifici, poi quelli generici
    // Fissi Francia - regioni principali
    { prefix: '003301', category: 'international', description: 'Francia Fisso - Parigi', costPerMinute: 0.18 },
    { prefix: '003302', category: 'international', description: 'Francia Fisso - Nord-Ovest', costPerMinute: 0.18 },
    { prefix: '003303', category: 'international', description: 'Francia Fisso - Nord-Est', costPerMinute: 0.18 },
    { prefix: '003304', category: 'international', description: 'Francia Fisso - Sud-Est', costPerMinute: 0.18 },
    { prefix: '003305', category: 'international', description: 'Francia Fisso - Sud-Ovest', costPerMinute: 0.18 },
    // Mobili Francia
    { prefix: '003306', category: 'international', description: 'Francia Mobile', costPerMinute: 0.22 },
    { prefix: '003307', category: 'international', description: 'Francia Mobile', costPerMinute: 0.22 },
    // Francia generica (DOPO i prefissi specifici)
    { prefix: '0033', category: 'international', description: 'Francia', costPerMinute: 0.18 },
    
    // GERMANIA (0049) - Prima i prefissi specifici, poi quelli generici
    // Fissi Germania - principali città
    { prefix: '004930', category: 'international', description: 'Germania Fisso - Berlino', costPerMinute: 0.18 },
    { prefix: '004989', category: 'international', description: 'Germania Fisso - Monaco', costPerMinute: 0.18 },
    { prefix: '004940', category: 'international', description: 'Germania Fisso - Amburgo', costPerMinute: 0.18 },
    { prefix: '004969', category: 'international', description: 'Germania Fisso - Francoforte', costPerMinute: 0.18 },
    { prefix: '004921', category: 'international', description: 'Germania Fisso - Düsseldorf', costPerMinute: 0.18 },
    { prefix: '0049711', category: 'international', description: 'Germania Fisso - Stoccarda', costPerMinute: 0.18 },
    { prefix: '0049221', category: 'international', description: 'Germania Fisso - Colonia', costPerMinute: 0.18 },
    // Mobili Germania
    { prefix: '004915', category: 'international', description: 'Germania Mobile', costPerMinute: 0.22 },
    { prefix: '004916', category: 'international', description: 'Germania Mobile', costPerMinute: 0.22 },
    { prefix: '004917', category: 'international', description: 'Germania Mobile', costPerMinute: 0.22 },
    // Germania generica (DOPO i prefissi specifici)
    { prefix: '0049', category: 'international', description: 'Germania', costPerMinute: 0.18 },
    
    // REGNO UNITO (0044) - Prima i prefissi specifici, poi quelli generici
    // Fissi Regno Unito - principali città
    { prefix: '004420', category: 'international', description: 'Regno Unito Fisso - Londra', costPerMinute: 0.20 },
    { prefix: '0044121', category: 'international', description: 'Regno Unito Fisso - Birmingham', costPerMinute: 0.20 },
    { prefix: '0044161', category: 'international', description: 'Regno Unito Fisso - Manchester', costPerMinute: 0.20 },
    { prefix: '0044113', category: 'international', description: 'Regno Unito Fisso - Leeds', costPerMinute: 0.20 },
    { prefix: '0044141', category: 'international', description: 'Regno Unito Fisso - Glasgow', costPerMinute: 0.20 },
    { prefix: '0044131', category: 'international', description: 'Regno Unito Fisso - Edimburgo', costPerMinute: 0.20 },
    // Mobili Regno Unito
    { prefix: '004474', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.25 },
    { prefix: '004475', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.25 },
    { prefix: '004476', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.25 },
    { prefix: '004477', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.25 },
    { prefix: '004478', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.25 },
    { prefix: '004479', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.25 },
    // Regno Unito generico (DOPO i prefissi specifici)
    { prefix: '0044', category: 'international', description: 'Regno Unito', costPerMinute: 0.20 },
    
    // SVIZZERA (0041) - Prima i prefissi specifici, poi quelli generici
    // Fissi Svizzera - principali città
    { prefix: '004122', category: 'international', description: 'Svizzera Fisso - Ginevra', costPerMinute: 0.30 },
    { prefix: '004144', category: 'international', description: 'Svizzera Fisso - Zurigo', costPerMinute: 0.30 },
    { prefix: '004131', category: 'international', description: 'Svizzera Fisso - Basilea', costPerMinute: 0.30 },
    { prefix: '004121', category: 'international', description: 'Svizzera Fisso - Losanna', costPerMinute: 0.30 },
    { prefix: '004161', category: 'international', description: 'Svizzera Fisso - Basilea', costPerMinute: 0.30 },
    // Mobili Svizzera
    { prefix: '004174', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.35 },
    { prefix: '004175', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.35 },
    { prefix: '004176', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.35 },
    { prefix: '004177', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.35 },
    { prefix: '004178', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.35 },
    { prefix: '004179', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.35 },
    // Svizzera generica (DOPO i prefissi specifici)
    { prefix: '0041', category: 'international', description: 'Svizzera', costPerMinute: 0.30 },
    
    // AUSTRIA (0043) - Prima i prefissi specifici, poi quelli generici
    { prefix: '00431', category: 'international', description: 'Austria Fisso - Vienna', costPerMinute: 0.22 },
    { prefix: '0043316', category: 'international', description: 'Austria Fisso - Graz', costPerMinute: 0.22 },
    { prefix: '0043512', category: 'international', description: 'Austria Fisso - Innsbruck', costPerMinute: 0.22 },
    { prefix: '004364', category: 'international', description: 'Austria Mobile', costPerMinute: 0.27 },
    { prefix: '004365', category: 'international', description: 'Austria Mobile', costPerMinute: 0.27 },
    { prefix: '004366', category: 'international', description: 'Austria Mobile', costPerMinute: 0.27 },
    { prefix: '004367', category: 'international', description: 'Austria Mobile', costPerMinute: 0.27 },
    { prefix: '004368', category: 'international', description: 'Austria Mobile', costPerMinute: 0.27 },
    { prefix: '004369', category: 'international', description: 'Austria Mobile', costPerMinute: 0.27 },
    // Austria generica (DOPO i prefissi specifici)
    { prefix: '0043', category: 'international', description: 'Austria', costPerMinute: 0.22 },
    
    // PAESI BASSI (0031) - Prima i prefissi specifici, poi quelli generici
    { prefix: '003120', category: 'international', description: 'Paesi Bassi Fisso - Amsterdam', costPerMinute: 0.18 },
    { prefix: '003170', category: 'international', description: 'Paesi Bassi Fisso - Rotterdam', costPerMinute: 0.18 },
    { prefix: '003130', category: 'international', description: 'Paesi Bassi Fisso - Utrecht', costPerMinute: 0.18 },
    { prefix: '003140', category: 'international', description: 'Paesi Bassi Fisso - Eindhoven', costPerMinute: 0.18 },
    { prefix: '003161', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.22 },
    { prefix: '003162', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.22 },
    { prefix: '003163', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.22 },
    { prefix: '003164', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.22 },
    { prefix: '003165', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.22 },
    { prefix: '003166', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.22 },
    // Paesi Bassi generico (DOPO i prefissi specifici)
    { prefix: '0031', category: 'international', description: 'Paesi Bassi', costPerMinute: 0.18 },
    
    // BELGIO (0032) - Prima i prefissi specifici, poi quelli generici
    { prefix: '00322', category: 'international', description: 'Belgio Fisso - Bruxelles', costPerMinute: 0.18 },
    { prefix: '00323', category: 'international', description: 'Belgio Fisso - Anversa', costPerMinute: 0.18 },
    { prefix: '00329', category: 'international', description: 'Belgio Fisso - Gent', costPerMinute: 0.18 },
    { prefix: '003216', category: 'international', description: 'Belgio Fisso - Leuven', costPerMinute: 0.18 },
    { prefix: '003245', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.22 },
    { prefix: '003246', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.22 },
    { prefix: '003247', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.22 },
    { prefix: '003248', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.22 },
    { prefix: '003249', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.22 },
    // Belgio generico (DOPO i prefissi specifici)
    { prefix: '0032', category: 'international', description: 'Belgio', costPerMinute: 0.18 },
    
    // Altri paesi europei con distinzione fisso/mobile
    
    // Prefissi generici internazionali (fallback per paesi non dettagliati)
    { prefix: '00351', category: 'international', description: 'Portogallo', costPerMinute: 0.18 },
    { prefix: '00030', category: 'international', description: 'Grecia', costPerMinute: 0.25 },
    { prefix: '00045', category: 'international', description: 'Danimarca', costPerMinute: 0.22 },
    { prefix: '00046', category: 'international', description: 'Svezia', costPerMinute: 0.22 },
    { prefix: '00047', category: 'international', description: 'Norvegia', costPerMinute: 0.25 },
    { prefix: '00048', category: 'international', description: 'Polonia', costPerMinute: 0.20 },
    { prefix: '00420', category: 'international', description: 'Repubblica Ceca', costPerMinute: 0.20 },
    { prefix: '00421', category: 'international', description: 'Slovacchia', costPerMinute: 0.20 },
    { prefix: '00386', category: 'international', description: 'Slovenia', costPerMinute: 0.25 },
    { prefix: '00385', category: 'international', description: 'Croazia', costPerMinute: 0.25 },
    { prefix: '00381', category: 'international', description: 'Serbia', costPerMinute: 0.30 },
    { prefix: '00382', category: 'international', description: 'Montenegro', costPerMinute: 0.35 },
    { prefix: '00387', category: 'international', description: 'Bosnia Erzegovina', costPerMinute: 0.35 },
    { prefix: '00389', category: 'international', description: 'Macedonia del Nord', costPerMinute: 0.35 },
    { prefix: '00355', category: 'international', description: 'Albania', costPerMinute: 0.40 },
    { prefix: '001', category: 'international', description: 'Stati Uniti/Canada', costPerMinute: 0.25 },
    { prefix: '0086', category: 'international', description: 'Cina', costPerMinute: 0.35 },
    { prefix: '0081', category: 'international', description: 'Giappone', costPerMinute: 0.40 },
    { prefix: '0091', category: 'international', description: 'India', costPerMinute: 0.30 },
    { prefix: '0055', category: 'international', description: 'Brasile', costPerMinute: 0.28 },
    { prefix: '007', category: 'international', description: 'Russia', costPerMinute: 0.35 },
    { prefix: '0090', category: 'international', description: 'Turchia', costPerMinute: 0.25 },
    { prefix: '00212', category: 'international', description: 'Marocco', costPerMinute: 0.30 },
    { prefix: '00213', category: 'international', description: 'Algeria', costPerMinute: 0.35 },
    { prefix: '00216', category: 'international', description: 'Tunisia', costPerMinute: 0.30 },
    { prefix: '0020', category: 'international', description: 'Egitto', costPerMinute: 0.35 },
    
    // Fissi italiani completi con nomi delle città (priorità alta)
    // Milano e provincia
    { prefix: '02', category: 'landline', description: 'Milano', costPerMinute: 0.01 },
    
    // Roma e provincia
    { prefix: '06', category: 'landline', description: 'Roma', costPerMinute: 0.01 },
    
    // Torino e Piemonte
    { prefix: '011', category: 'landline', description: 'Torino', costPerMinute: 0.01 },
    { prefix: '0121', category: 'landline', description: 'Pinerolo', costPerMinute: 0.01 },
    { prefix: '0122', category: 'landline', description: 'Sestriere', costPerMinute: 0.01 },
    { prefix: '0123', category: 'landline', description: 'Lanzo Torinese', costPerMinute: 0.01 },
    { prefix: '0124', category: 'landline', description: 'Susa', costPerMinute: 0.01 },
    { prefix: '0125', category: 'landline', description: 'Ivrea', costPerMinute: 0.01 },
    { prefix: '0131', category: 'landline', description: 'Alessandria', costPerMinute: 0.01 },
    { prefix: '0141', category: 'landline', description: 'Asti', costPerMinute: 0.01 },
    { prefix: '0142', category: 'landline', description: 'Casale Monferrato', costPerMinute: 0.01 },
    { prefix: '0143', category: 'landline', description: 'Novi Ligure', costPerMinute: 0.01 },
    { prefix: '0144', category: 'landline', description: 'Acqui Terme', costPerMinute: 0.01 },
    { prefix: '0161', category: 'landline', description: 'Vercelli', costPerMinute: 0.01 },
    { prefix: '0163', category: 'landline', description: 'Borgosesia', costPerMinute: 0.01 },
    { prefix: '0165', category: 'landline', description: 'Aosta', costPerMinute: 0.01 },
    { prefix: '0166', category: 'landline', description: 'Courmayeur', costPerMinute: 0.01 },
    { prefix: '0171', category: 'landline', description: 'Cuneo', costPerMinute: 0.01 },
    { prefix: '0172', category: 'landline', description: 'Savigliano', costPerMinute: 0.01 },
    { prefix: '0173', category: 'landline', description: 'Alba', costPerMinute: 0.01 },
    { prefix: '0174', category: 'landline', description: 'Mondovì', costPerMinute: 0.01 },
    { prefix: '0175', category: 'landline', description: 'Saluzzo', costPerMinute: 0.01 },
    
    // Genova e Liguria
    { prefix: '010', category: 'landline', description: 'Genova', costPerMinute: 0.01 },
    { prefix: '0182', category: 'landline', description: 'Albenga', costPerMinute: 0.01 },
    { prefix: '0183', category: 'landline', description: 'Imperia', costPerMinute: 0.01 },
    { prefix: '0184', category: 'landline', description: 'San Remo', costPerMinute: 0.01 },
    { prefix: '0185', category: 'landline', description: 'Rapallo', costPerMinute: 0.01 },
    { prefix: '0187', category: 'landline', description: 'La Spezia', costPerMinute: 0.01 },
    
    // Lombardia
    { prefix: '030', category: 'landline', description: 'Brescia', costPerMinute: 0.01 },
    { prefix: '031', category: 'landline', description: 'Como', costPerMinute: 0.01 },
    { prefix: '032', category: 'landline', description: 'Varese', costPerMinute: 0.01 },
    { prefix: '035', category: 'landline', description: 'Bergamo', costPerMinute: 0.01 },
    { prefix: '0362', category: 'landline', description: 'Seregno', costPerMinute: 0.01 },
    { prefix: '0363', category: 'landline', description: 'Treviglio', costPerMinute: 0.01 },
    { prefix: '0364', category: 'landline', description: 'Breno', costPerMinute: 0.01 },
    { prefix: '0365', category: 'landline', description: 'Salò', costPerMinute: 0.01 },
    { prefix: '0371', category: 'landline', description: 'Lodi', costPerMinute: 0.01 },
    { prefix: '0372', category: 'landline', description: 'Cremona', costPerMinute: 0.01 },
    { prefix: '0373', category: 'landline', description: 'Crema', costPerMinute: 0.01 },
    { prefix: '0374', category: 'landline', description: 'Soresina', costPerMinute: 0.01 },
    { prefix: '0375', category: 'landline', description: 'Viadana', costPerMinute: 0.01 },
    { prefix: '0376', category: 'landline', description: 'Mantova', costPerMinute: 0.01 },
    { prefix: '0377', category: 'landline', description: 'Codogno', costPerMinute: 0.01 },
    { prefix: '0381', category: 'landline', description: 'Pavia', costPerMinute: 0.01 },
    { prefix: '0382', category: 'landline', description: 'Vigevano', costPerMinute: 0.01 },
    { prefix: '0383', category: 'landline', description: 'Voghera', costPerMinute: 0.01 },
    { prefix: '0384', category: 'landline', description: 'Mortara', costPerMinute: 0.01 },
    { prefix: '0385', category: 'landline', description: 'Stradella', costPerMinute: 0.01 },
    
    // Veneto
    { prefix: '041', category: 'landline', description: 'Venezia', costPerMinute: 0.01 },
    { prefix: '042', category: 'landline', description: 'Treviso', costPerMinute: 0.01 },
    { prefix: '043', category: 'landline', description: 'Vicenza', costPerMinute: 0.01 },
    { prefix: '044', category: 'landline', description: 'Chioggia', costPerMinute: 0.01 },
    { prefix: '045', category: 'landline', description: 'Verona', costPerMinute: 0.01 },
    { prefix: '049', category: 'landline', description: 'Padova', costPerMinute: 0.01 },
    
    // Toscana con dettagli delle città
    { prefix: '055', category: 'landline', description: 'Firenze', costPerMinute: 0.01 },
    { prefix: '0564', category: 'landline', description: 'Grosseto', costPerMinute: 0.01 },
    { prefix: '0565', category: 'landline', description: 'Piombino', costPerMinute: 0.01 },
    { prefix: '0566', category: 'landline', description: 'Follonica', costPerMinute: 0.01 },
    { prefix: '0571', category: 'landline', description: 'Empoli', costPerMinute: 0.01 },
    { prefix: '0572', category: 'landline', description: 'Montecatini Terme', costPerMinute: 0.01 },
    { prefix: '0573', category: 'landline', description: 'Pistoia', costPerMinute: 0.01 },
    { prefix: '0574', category: 'landline', description: 'Prato', costPerMinute: 0.01 },
    { prefix: '0575', category: 'landline', description: 'Arezzo', costPerMinute: 0.01 },
    { prefix: '0577', category: 'landline', description: 'Siena', costPerMinute: 0.01 },
    { prefix: '0578', category: 'landline', description: 'Chianciano Terme', costPerMinute: 0.01 },
    { prefix: '0583', category: 'landline', description: 'Lucca', costPerMinute: 0.01 },
    { prefix: '0584', category: 'landline', description: 'Viareggio', costPerMinute: 0.01 },
    { prefix: '0585', category: 'landline', description: 'Carrara', costPerMinute: 0.01 },
    { prefix: '0586', category: 'landline', description: 'Livorno', costPerMinute: 0.01 },
    { prefix: '0587', category: 'landline', description: 'Pontedera', costPerMinute: 0.01 },
    { prefix: '0588', category: 'landline', description: 'Volterra', costPerMinute: 0.01 },
    
    // Mobile - Operatori specifici
    // TIM
    { prefix: '330', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '331', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '333', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '334', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '335', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '336', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '337', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '338', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '339', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '360', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '361', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '362', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '363', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '366', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '368', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    { prefix: '370', category: 'mobile', description: 'TIM', costPerMinute: 0.09 },
    
    // Vodafone
    { prefix: '340', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    { prefix: '341', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    { prefix: '342', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    { prefix: '343', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    { prefix: '345', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    { prefix: '346', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    { prefix: '347', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    { prefix: '348', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    { prefix: '349', category: 'mobile', description: 'Vodafone', costPerMinute: 0.09 },
    
    // Wind/Tre
    { prefix: '320', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '321', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '322', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '323', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '324', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '327', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '328', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '329', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '380', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '383', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '388', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '389', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '390', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '391', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '392', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    { prefix: '393', category: 'mobile', description: 'Wind/Tre', costPerMinute: 0.09 },
    
    // Iliad
    { prefix: '350', category: 'mobile', description: 'Iliad', costPerMinute: 0.09 },
    { prefix: '351', category: 'mobile', description: 'Iliad', costPerMinute: 0.09 },
    
    // Fastweb Mobile
    { prefix: '371', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    { prefix: '372', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    { prefix: '373', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    { prefix: '374', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    { prefix: '375', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    { prefix: '376', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    { prefix: '377', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    { prefix: '378', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    { prefix: '379', category: 'mobile', description: 'Fastweb', costPerMinute: 0.09 },
    
    // Altri operatori mobili
    { prefix: '352', category: 'mobile', description: 'BT Italia', costPerMinute: 0.09 },
    { prefix: '353', category: 'mobile', description: 'Noverca', costPerMinute: 0.09 },
    { prefix: '354', category: 'mobile', description: 'Poste Mobile', costPerMinute: 0.09 },
    { prefix: '355', category: 'mobile', description: 'Lycamobile', costPerMinute: 0.09 },
    { prefix: '356', category: 'mobile', description: 'Plintron', costPerMinute: 0.09 },
    { prefix: '357', category: 'mobile', description: 'Mundio Mobile', costPerMinute: 0.09 },
    { prefix: '358', category: 'mobile', description: 'Coopvoce', costPerMinute: 0.09 },
    { prefix: '359', category: 'mobile', description: 'Daily Telecom', costPerMinute: 0.09 },
    
    // Prefissi generici (SOLO ALLA FINE - priorità bassa)
    { prefix: '0', category: 'landline', description: 'Fisso', costPerMinute: 0.01 },
    { prefix: '3', category: 'mobile', description: 'Mobile', costPerMinute: 0.09 },
    { prefix: '7', category: 'mobile', description: 'Mobile', costPerMinute: 0.09 },
    { prefix: '1', category: 'special', description: 'Numero Speciale', costPerMinute: 0.50 }
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
    
    // Gestisci numeri internazionali con prefisso 00XX (NON italiani)
    if ((cleanNumber.startsWith('00') && !cleanNumber.startsWith('0039')) || 
        (cleanNumber.startsWith('+') && !cleanNumber.startsWith('+39'))) {
      console.log('🌍 International number detected');
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
      .filter(p => p.prefix.startsWith('00') || (p.prefix.startsWith('+') && p.prefix !== '+39'))
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

  // Metodo aggiornato per mostrare categorie internazionali dettagliate nell'analisi chiamanti
  static getMacroCategory(category: string, type: string): string {
    switch (type) {
      case 'landline':
        return 'Fisso';
      case 'mobile':
        return 'Mobile';
      case 'special':
        return category.includes('Verde') ? 'Numero Verde' : 'Numero Premium';
      case 'international':
        // Per i numeri internazionali, mostra sia il paese che se è fisso/mobile
        if (category.includes('Spagna')) {
          if (category.includes('Mobile')) {
            return 'Spagna Mobile';
          } else if (category.includes('Fisso')) {
            return 'Spagna Fisso';
          }
          return 'Spagna';
        } else if (category.includes('Francia')) {
          if (category.includes('Mobile')) {
            return 'Francia Mobile';
          } else if (category.includes('Fisso')) {
            return 'Francia Fisso';
          }
          return 'Francia';
        } else if (category.includes('Germania')) {
          if (category.includes('Mobile')) {
            return 'Germania Mobile';
          } else if (category.includes('Fisso')) {
            return 'Germania Fisso';
          }
          return 'Germania';
        } else if (category.includes('Regno Unito')) {
          if (category.includes('Mobile')) {
            return 'Regno Unito Mobile';
          } else if (category.includes('Fisso')) {
            return 'Regno Unito Fisso';
          }
          return 'Regno Unito';
        } else if (category.includes('Svizzera')) {
          if (category.includes('Mobile')) {
            return 'Svizzera Mobile';
          } else if (category.includes('Fisso')) {
            return 'Svizzera Fisso';
          }
          return 'Svizzera';
        } else if (category.includes('Austria')) {
          if (category.includes('Mobile')) {
            return 'Austria Mobile';
          } else if (category.includes('Fisso')) {
            return 'Austria Fisso';
          }
          return 'Austria';
        } else if (category.includes('Paesi Bassi')) {
          if (category.includes('Mobile')) {
            return 'Paesi Bassi Mobile';
          } else if (category.includes('Fisso')) {
            return 'Paesi Bassi Fisso';
          }
          return 'Paesi Bassi';
        } else if (category.includes('Belgio')) {
          if (category.includes('Mobile')) {
            return 'Belgio Mobile';
          } else if (category.includes('Fisso')) {
            return 'Belgio Fisso';
          }
          return 'Belgio';
        }
        // Per altri paesi internazionali, ritorna il nome del paese
        return category;
      default:
        return 'Altro';
    }
  }
}
