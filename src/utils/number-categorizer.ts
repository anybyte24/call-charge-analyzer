
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
    
    // PREFISSI INTERNAZIONALI DETTAGLIATI (ordine per lunghezza - più lunghi prima)
    
    // AFGHANISTAN (0093)
    { prefix: '009393', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009370', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009371', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009372', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009373', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009374', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009375', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009376', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009377', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009378', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '009379', category: 'international', description: 'Afghanistan Mobile', costPerMinute: 0.40 },
    { prefix: '0093', category: 'international', description: 'Afghanistan', costPerMinute: 0.40 },
    
    // ALBANIA (00355)
    { prefix: '003556', category: 'international', description: 'Albania Mobile', costPerMinute: 0.23 },
    { prefix: '003557', category: 'international', description: 'Albania Mobile', costPerMinute: 0.23 },
    { prefix: '003558', category: 'international', description: 'Albania Mobile', costPerMinute: 0.23 },
    { prefix: '003559', category: 'international', description: 'Albania Mobile', costPerMinute: 0.23 },
    { prefix: '00355', category: 'international', description: 'Albania', costPerMinute: 0.13 },
    
    // ALGERIA (00213)
    { prefix: '002135', category: 'international', description: 'Algeria Mobile', costPerMinute: 0.23 },
    { prefix: '002136', category: 'international', description: 'Algeria Mobile', costPerMinute: 0.23 },
    { prefix: '002137', category: 'international', description: 'Algeria Mobile', costPerMinute: 0.23 },
    { prefix: '00213', category: 'international', description: 'Algeria', costPerMinute: 0.13 },
    
    // ANDORRA (00376)
    { prefix: '003763', category: 'international', description: 'Andorra Mobile', costPerMinute: 0.40 },
    { prefix: '003764', category: 'international', description: 'Andorra Mobile', costPerMinute: 0.40 },
    { prefix: '003765', category: 'international', description: 'Andorra Mobile', costPerMinute: 0.40 },
    { prefix: '003766', category: 'international', description: 'Andorra Mobile', costPerMinute: 0.40 },
    { prefix: '00376', category: 'international', description: 'Andorra', costPerMinute: 0.05 },
    
    // ANGOLA (00244)
    { prefix: '00244', category: 'international', description: 'Angola', costPerMinute: 0.23 },
    
    // ARGENTINA (0054)
    { prefix: '005411', category: 'international', description: 'Argentina Mobile', costPerMinute: 0.23 },
    { prefix: '005415', category: 'international', description: 'Argentina Mobile', costPerMinute: 0.23 },
    { prefix: '005491', category: 'international', description: 'Argentina Mobile', costPerMinute: 0.23 },
    { prefix: '0054', category: 'international', description: 'Argentina', costPerMinute: 0.05 },
    
    // ARMENIA (00374)
    { prefix: '003749', category: 'international', description: 'Armenia Mobile', costPerMinute: 0.40 },
    { prefix: '00374', category: 'international', description: 'Armenia', costPerMinute: 0.23 },
    
    // AUSTRALIA (0061)
    { prefix: '00614', category: 'international', description: 'Australia Mobile', costPerMinute: 0.23 },
    { prefix: '0061', category: 'international', description: 'Australia', costPerMinute: 0.03 },
    
    // AUSTRIA (0043) - dettaglio esistente
    { prefix: '00431', category: 'international', description: 'Austria Fisso - Vienna', costPerMinute: 0.03 },
    { prefix: '0043316', category: 'international', description: 'Austria Fisso - Graz', costPerMinute: 0.03 },
    { prefix: '0043512', category: 'international', description: 'Austria Fisso - Innsbruck', costPerMinute: 0.03 },
    { prefix: '004364', category: 'international', description: 'Austria Mobile', costPerMinute: 0.23 },
    { prefix: '004365', category: 'international', description: 'Austria Mobile', costPerMinute: 0.23 },
    { prefix: '004366', category: 'international', description: 'Austria Mobile', costPerMinute: 0.23 },
    { prefix: '004367', category: 'international', description: 'Austria Mobile', costPerMinute: 0.23 },
    { prefix: '004368', category: 'international', description: 'Austria Mobile', costPerMinute: 0.23 },
    { prefix: '004369', category: 'international', description: 'Austria Mobile', costPerMinute: 0.23 },
    { prefix: '0043', category: 'international', description: 'Austria', costPerMinute: 0.03 },
    
    // AZERBAIJAN (00994)
    { prefix: '009944', category: 'international', description: 'Azerbaijan Mobile', costPerMinute: 0.23 },
    { prefix: '009945', category: 'international', description: 'Azerbaijan Mobile', costPerMinute: 0.23 },
    { prefix: '009950', category: 'international', description: 'Azerbaijan Mobile', costPerMinute: 0.23 },
    { prefix: '009951', category: 'international', description: 'Azerbaijan Mobile', costPerMinute: 0.23 },
    { prefix: '009955', category: 'international', description: 'Azerbaijan Mobile', costPerMinute: 0.23 },
    { prefix: '00994', category: 'international', description: 'Azerbaijan', costPerMinute: 0.23 },
    
    // BAHRAIN (00973)
    { prefix: '009733', category: 'international', description: 'Bahrain Mobile', costPerMinute: 0.40 },
    { prefix: '009736', category: 'international', description: 'Bahrain Mobile', costPerMinute: 0.40 },
    { prefix: '009737', category: 'international', description: 'Bahrain Mobile', costPerMinute: 0.40 },
    { prefix: '009739', category: 'international', description: 'Bahrain Mobile', costPerMinute: 0.40 },
    { prefix: '00973', category: 'international', description: 'Bahrain', costPerMinute: 0.23 },
    
    // BANGLADESH (00880)
    { prefix: '008801', category: 'international', description: 'Bangladesh Mobile', costPerMinute: 0.40 },
    { prefix: '00880', category: 'international', description: 'Bangladesh', costPerMinute: 0.23 },
    
    // BELARUS (00375)
    { prefix: '003752', category: 'international', description: 'Belarus Mobile', costPerMinute: 0.40 },
    { prefix: '003759', category: 'international', description: 'Belarus Mobile', costPerMinute: 0.40 },
    { prefix: '00375', category: 'international', description: 'Belarus', costPerMinute: 0.23 },
    
    // BELGIO (0032) - dettaglio esistente
    { prefix: '00322', category: 'international', description: 'Belgio Fisso - Bruxelles', costPerMinute: 0.02 },
    { prefix: '00323', category: 'international', description: 'Belgio Fisso - Anversa', costPerMinute: 0.02 },
    { prefix: '00329', category: 'international', description: 'Belgio Fisso - Gent', costPerMinute: 0.02 },
    { prefix: '003216', category: 'international', description: 'Belgio Fisso - Leuven', costPerMinute: 0.02 },
    { prefix: '003245', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.40 },
    { prefix: '003246', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.40 },
    { prefix: '003247', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.40 },
    { prefix: '003248', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.40 },
    { prefix: '003249', category: 'international', description: 'Belgio Mobile', costPerMinute: 0.40 },
    { prefix: '0032', category: 'international', description: 'Belgio', costPerMinute: 0.02 },
    
    // BOLIVIA (00591)
    { prefix: '005917', category: 'international', description: 'Bolivia Mobile', costPerMinute: 0.23 },
    { prefix: '00591', category: 'international', description: 'Bolivia', costPerMinute: 0.23 },
    
    // BOSNIA (00387)
    { prefix: '003876', category: 'international', description: 'Bosnia Mobile', costPerMinute: 0.23 },
    { prefix: '00387', category: 'international', description: 'Bosnia', costPerMinute: 0.23 },
    
    // BOTSWANA (00267)
    { prefix: '002677', category: 'international', description: 'Botswana Mobile', costPerMinute: 0.40 },
    { prefix: '00267', category: 'international', description: 'Botswana', costPerMinute: 0.23 },
    
    // BRASILE (0055)
    { prefix: '005511', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '005521', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '005531', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '005541', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '005551', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '005561', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '005571', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '005581', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '005585', category: 'international', description: 'Brasile Mobile', costPerMinute: 0.23 },
    { prefix: '0055', category: 'international', description: 'Brasile', costPerMinute: 0.05 },
    
    // BRUNEI (00673)
    { prefix: '00673', category: 'international', description: 'Brunei', costPerMinute: 0.13 },
    
    // BULGARIA (00359)
    { prefix: '003598', category: 'international', description: 'Bulgaria Mobile', costPerMinute: 0.40 },
    { prefix: '003599', category: 'international', description: 'Bulgaria Mobile', costPerMinute: 0.40 },
    { prefix: '00359', category: 'international', description: 'Bulgaria', costPerMinute: 0.05 },
    
    // CANADA (001)
    { prefix: '001', category: 'international', description: 'Canada/Stati Uniti', costPerMinute: 0.03 },
    
    // CHILE (0056)
    { prefix: '00569', category: 'international', description: 'Cile Mobile', costPerMinute: 0.23 },
    { prefix: '0056', category: 'international', description: 'Cile', costPerMinute: 0.23 },
    
    // CINA (0086)
    { prefix: '008613', category: 'international', description: 'Cina Mobile', costPerMinute: 0.05 },
    { prefix: '008615', category: 'international', description: 'Cina Mobile', costPerMinute: 0.05 },
    { prefix: '008618', category: 'international', description: 'Cina Mobile', costPerMinute: 0.05 },
    { prefix: '0086', category: 'international', description: 'Cina', costPerMinute: 0.05 },
    
    // COLOMBIA (0057)
    { prefix: '00573', category: 'international', description: 'Colombia Mobile', costPerMinute: 0.13 },
    { prefix: '0057', category: 'international', description: 'Colombia', costPerMinute: 0.13 },
    
    // COSTA RICA (00506)
    { prefix: '005068', category: 'international', description: 'Costa Rica Mobile', costPerMinute: 0.13 },
    { prefix: '00506', category: 'international', description: 'Costa Rica', costPerMinute: 0.09 },
    
    // CROAZIA (00385)
    { prefix: '003859', category: 'international', description: 'Croazia Mobile', costPerMinute: 0.23 },
    { prefix: '00385', category: 'international', description: 'Croazia', costPerMinute: 0.05 },
    
    // REPUBBLICA CECA (00420)
    { prefix: '00420', category: 'international', description: 'Repubblica Ceca', costPerMinute: 0.05 },
    
    // DANIMARCA (0045)
    { prefix: '0045', category: 'international', description: 'Danimarca', costPerMinute: 0.02 },
    
    // ECUADOR (00593)
    { prefix: '005939', category: 'international', description: 'Ecuador Mobile', costPerMinute: 0.23 },
    { prefix: '00593', category: 'international', description: 'Ecuador', costPerMinute: 0.23 },
    
    // EGITTO (0020)
    { prefix: '002010', category: 'international', description: 'Egitto Mobile', costPerMinute: 0.23 },
    { prefix: '002011', category: 'international', description: 'Egitto Mobile', costPerMinute: 0.23 },
    { prefix: '002012', category: 'international', description: 'Egitto Mobile', costPerMinute: 0.23 },
    { prefix: '0020', category: 'international', description: 'Egitto', costPerMinute: 0.23 },
    
    // ESTONIA (00372)
    { prefix: '003725', category: 'international', description: 'Estonia Mobile', costPerMinute: 0.40 },
    { prefix: '00372', category: 'international', description: 'Estonia', costPerMinute: 0.03 },
    
    // FINLANDIA (00358)
    { prefix: '003584', category: 'international', description: 'Finlandia Mobile', costPerMinute: 0.23 },
    { prefix: '003585', category: 'international', description: 'Finlandia Mobile', costPerMinute: 0.23 },
    { prefix: '00358', category: 'international', description: 'Finlandia', costPerMinute: 0.05 },
    
    // FRANCIA (0033) - dettaglio esistente CORRETTO
    { prefix: '003301', category: 'international', description: 'Francia Fisso - Parigi', costPerMinute: 0.02 },
    { prefix: '003302', category: 'international', description: 'Francia Fisso - Nord-Ovest', costPerMinute: 0.02 },
    { prefix: '003303', category: 'international', description: 'Francia Fisso - Nord-Est', costPerMinute: 0.02 },
    { prefix: '003304', category: 'international', description: 'Francia Fisso - Sud-Est', costPerMinute: 0.02 },
    { prefix: '003305', category: 'international', description: 'Francia Fisso - Sud-Ovest', costPerMinute: 0.02 },
    { prefix: '00336', category: 'international', description: 'Francia Mobile', costPerMinute: 0.23 },
    { prefix: '003307', category: 'international', description: 'Francia Mobile', costPerMinute: 0.23 },
    { prefix: '0033', category: 'international', description: 'Francia', costPerMinute: 0.02 },
    
    // GERMANIA (0049) - dettaglio esistente
    { prefix: '004930', category: 'international', description: 'Germania Fisso - Berlino', costPerMinute: 0.02 },
    { prefix: '004989', category: 'international', description: 'Germania Fisso - Monaco', costPerMinute: 0.02 },
    { prefix: '004940', category: 'international', description: 'Germania Fisso - Amburgo', costPerMinute: 0.02 },
    { prefix: '004969', category: 'international', description: 'Germania Fisso - Francoforte', costPerMinute: 0.02 },
    { prefix: '004921', category: 'international', description: 'Germania Fisso - Düsseldorf', costPerMinute: 0.02 },
    { prefix: '0049711', category: 'international', description: 'Germania Fisso - Stoccarda', costPerMinute: 0.02 },
    { prefix: '0049221', category: 'international', description: 'Germania Fisso - Colonia', costPerMinute: 0.02 },
    { prefix: '004915', category: 'international', description: 'Germania Mobile', costPerMinute: 0.23 },
    { prefix: '004916', category: 'international', description: 'Germania Mobile', costPerMinute: 0.23 },
    { prefix: '004917', category: 'international', description: 'Germania Mobile', costPerMinute: 0.23 },
    { prefix: '0049', category: 'international', description: 'Germania', costPerMinute: 0.02 },
    
    // GRECIA (0030)
    { prefix: '003069', category: 'international', description: 'Grecia Mobile', costPerMinute: 0.23 },
    { prefix: '0030', category: 'international', description: 'Grecia', costPerMinute: 0.02 },
    
    // HONG KONG (00852)
    { prefix: '008525', category: 'international', description: 'Hong Kong Mobile', costPerMinute: 0.13 },
    { prefix: '008526', category: 'international', description: 'Hong Kong Mobile', costPerMinute: 0.13 },
    { prefix: '008529', category: 'international', description: 'Hong Kong Mobile', costPerMinute: 0.13 },
    { prefix: '00852', category: 'international', description: 'Hong Kong', costPerMinute: 0.05 },
    
    // UNGHERIA (0036)
    { prefix: '003620', category: 'international', description: 'Ungheria Mobile', costPerMinute: 0.23 },
    { prefix: '003630', category: 'international', description: 'Ungheria Mobile', costPerMinute: 0.23 },
    { prefix: '003631', category: 'international', description: 'Ungheria Mobile', costPerMinute: 0.23 },
    { prefix: '003670', category: 'international', description: 'Ungheria Mobile', costPerMinute: 0.23 },
    { prefix: '0036', category: 'international', description: 'Ungheria', costPerMinute: 0.03 },
    
    // ISLANDA (00354)
    { prefix: '003546', category: 'international', description: 'Islanda Mobile', costPerMinute: 0.40 },
    { prefix: '003548', category: 'international', description: 'Islanda Mobile', costPerMinute: 0.40 },
    { prefix: '00354', category: 'international', description: 'Islanda', costPerMinute: 0.03 },
    
    // INDIA (0091)
    { prefix: '00917', category: 'international', description: 'India Mobile', costPerMinute: 0.23 },
    { prefix: '00918', category: 'international', description: 'India Mobile', costPerMinute: 0.23 },
    { prefix: '00919', category: 'international', description: 'India Mobile', costPerMinute: 0.23 },
    { prefix: '0091', category: 'international', description: 'India', costPerMinute: 0.23 },
    
    // INDONESIA (0062)
    { prefix: '00628', category: 'international', description: 'Indonesia Mobile', costPerMinute: 0.23 },
    { prefix: '0062', category: 'international', description: 'Indonesia', costPerMinute: 0.13 },
    
    // IRAN (0098)
    { prefix: '00989', category: 'international', description: 'Iran Mobile', costPerMinute: 0.23 },
    { prefix: '0098', category: 'international', description: 'Iran', costPerMinute: 0.13 },
    
    // IRAQ (00964)
    { prefix: '009647', category: 'international', description: 'Iraq Mobile', costPerMinute: 0.40 },
    { prefix: '00964', category: 'international', description: 'Iraq', costPerMinute: 0.23 },
    
    // IRLANDA (00353)
    { prefix: '003538', category: 'international', description: 'Irlanda Mobile', costPerMinute: 0.23 },
    { prefix: '00353', category: 'international', description: 'Irlanda', costPerMinute: 0.02 },
    
    // ISRAELE (00972)
    { prefix: '009725', category: 'international', description: 'Israele Mobile', costPerMinute: 0.23 },
    { prefix: '00972', category: 'international', description: 'Israele', costPerMinute: 0.03 },
    
    // GIAPPONE (0081)
    { prefix: '00818', category: 'international', description: 'Giappone Mobile', costPerMinute: 0.23 },
    { prefix: '00819', category: 'international', description: 'Giappone Mobile', costPerMinute: 0.23 },
    { prefix: '0081', category: 'international', description: 'Giappone', costPerMinute: 0.08 },
    
    // GIORDANIA (00962)
    { prefix: '009627', category: 'international', description: 'Giordania Mobile', costPerMinute: 0.23 },
    { prefix: '00962', category: 'international', description: 'Giordania', costPerMinute: 0.23 },
    
    // KAZAKHSTAN (007)
    { prefix: '007701', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007702', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007705', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007707', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007708', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007775', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007776', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007777', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007778', category: 'international', description: 'Kazakhstan Mobile', costPerMinute: 0.23 },
    { prefix: '007', category: 'international', description: 'Kazakhstan/Russia', costPerMinute: 0.13 },
    
    // KENYA (00254)
    { prefix: '002547', category: 'international', description: 'Kenya Mobile', costPerMinute: 0.40 },
    { prefix: '00254', category: 'international', description: 'Kenya', costPerMinute: 0.23 },
    
    // KUWAIT (00965)
    { prefix: '009655', category: 'international', description: 'Kuwait Mobile', costPerMinute: 0.23 },
    { prefix: '009656', category: 'international', description: 'Kuwait Mobile', costPerMinute: 0.23 },
    { prefix: '009659', category: 'international', description: 'Kuwait Mobile', costPerMinute: 0.23 },
    { prefix: '00965', category: 'international', description: 'Kuwait', costPerMinute: 0.23 },
    
    // LETTONIA (00371)
    { prefix: '003712', category: 'international', description: 'Lettonia Mobile', costPerMinute: 0.23 },
    { prefix: '003716', category: 'international', description: 'Lettonia Mobile Speciale', costPerMinute: 0.40 },
    { prefix: '00371', category: 'international', description: 'Lettonia', costPerMinute: 0.13 },
    
    // LIBANO (00961)
    { prefix: '009613', category: 'international', description: 'Libano Mobile', costPerMinute: 0.23 },
    { prefix: '009617', category: 'international', description: 'Libano Mobile', costPerMinute: 0.23 },
    { prefix: '00961', category: 'international', description: 'Libano', costPerMinute: 0.13 },
    
    // LITUANIA (00370)
    { prefix: '003706', category: 'international', description: 'Lituania Mobile', costPerMinute: 0.23 },
    { prefix: '00370', category: 'international', description: 'Lituania', costPerMinute: 0.09 },
    
    // LUSSEMBURGO (00352)
    { prefix: '003526', category: 'international', description: 'Lussemburgo Mobile', costPerMinute: 0.23 },
    { prefix: '00352', category: 'international', description: 'Lussemburgo', costPerMinute: 0.05 },
    
    // MACEDONIA (00389)
    { prefix: '003897', category: 'international', description: 'Macedonia Mobile', costPerMinute: 0.40 },
    { prefix: '00389', category: 'international', description: 'Macedonia', costPerMinute: 0.13 },
    
    // MALESIA (0060)
    { prefix: '006010', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '006011', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '006012', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '006013', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '006014', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '006016', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '006017', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '006018', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '006019', category: 'international', description: 'Malesia Mobile', costPerMinute: 0.08 },
    { prefix: '0060', category: 'international', description: 'Malesia', costPerMinute: 0.08 },
    
    // MALTA (00356)
    { prefix: '003569', category: 'international', description: 'Malta Mobile', costPerMinute: 0.40 },
    { prefix: '00356', category: 'international', description: 'Malta', costPerMinute: 0.13 },
    
    // MAROCCO (00212)
    { prefix: '002126', category: 'international', description: 'Marocco Mobile', costPerMinute: 0.40 },
    { prefix: '00212', category: 'international', description: 'Marocco', costPerMinute: 0.23 },
    
    // MESSICO (0052)
    { prefix: '005215', category: 'international', description: 'Messico Mobile', costPerMinute: 0.23 },
    { prefix: '0052', category: 'international', description: 'Messico', costPerMinute: 0.23 },
    
    // MOLDAVIA (00373)
    { prefix: '003736', category: 'international', description: 'Moldavia Mobile', costPerMinute: 0.23 },
    { prefix: '003737', category: 'international', description: 'Moldavia Mobile', costPerMinute: 0.23 },
    { prefix: '00373', category: 'international', description: 'Moldavia', costPerMinute: 0.13 },
    
    // MONACO (00377)
    { prefix: '003776', category: 'international', description: 'Monaco Mobile', costPerMinute: 0.23 },
    { prefix: '00377', category: 'international', description: 'Monaco', costPerMinute: 0.03 },
    
    // MONTENEGRO (00382)
    { prefix: '003826', category: 'international', description: 'Montenegro Mobile', costPerMinute: 0.40 },
    { prefix: '00382', category: 'international', description: 'Montenegro', costPerMinute: 0.13 },
    
    // PAESI BASSI (0031) - dettaglio esistente
    { prefix: '003120', category: 'international', description: 'Paesi Bassi Fisso - Amsterdam', costPerMinute: 0.02 },
    { prefix: '003170', category: 'international', description: 'Paesi Bassi Fisso - Rotterdam', costPerMinute: 0.02 },
    { prefix: '003130', category: 'international', description: 'Paesi Bassi Fisso - Utrecht', costPerMinute: 0.02 },
    { prefix: '003140', category: 'international', description: 'Paesi Bassi Fisso - Eindhoven', costPerMinute: 0.02 },
    { prefix: '003161', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.23 },
    { prefix: '003162', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.23 },
    { prefix: '003163', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.23 },
    { prefix: '003164', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.23 },
    { prefix: '003165', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.23 },
    { prefix: '003166', category: 'international', description: 'Paesi Bassi Mobile', costPerMinute: 0.23 },
    { prefix: '0031', category: 'international', description: 'Paesi Bassi', costPerMinute: 0.02 },
    
    // NUOVA ZELANDA (0064)
    { prefix: '006421', category: 'international', description: 'Nuova Zelanda Mobile', costPerMinute: 0.40 },
    { prefix: '006422', category: 'international', description: 'Nuova Zelanda Mobile', costPerMinute: 0.40 },
    { prefix: '006427', category: 'international', description: 'Nuova Zelanda Mobile', costPerMinute: 0.40 },
    { prefix: '0064', category: 'international', description: 'Nuova Zelanda', costPerMinute: 0.08 },
    
    // NIGERIA (00234)
    { prefix: '002347', category: 'international', description: 'Nigeria Mobile', costPerMinute: 0.23 },
    { prefix: '002348', category: 'international', description: 'Nigeria Mobile', costPerMinute: 0.23 },
    { prefix: '002349', category: 'international', description: 'Nigeria Mobile', costPerMinute: 0.23 },
    { prefix: '00234', category: 'international', description: 'Nigeria', costPerMinute: 0.13 },
    
    // NORVEGIA (0047)
    { prefix: '00474', category: 'international', description: 'Norvegia Mobile', costPerMinute: 0.23 },
    { prefix: '00479', category: 'international', description: 'Norvegia Mobile', costPerMinute: 0.23 },
    { prefix: '0047', category: 'international', description: 'Norvegia', costPerMinute: 0.05 },
    
    // PAKISTAN (0092)
    { prefix: '00923', category: 'international', description: 'Pakistan Mobile', costPerMinute: 0.23 },
    { prefix: '0092', category: 'international', description: 'Pakistan', costPerMinute: 0.23 },
    
    // PANAMA (00507)
    { prefix: '005076', category: 'international', description: 'Panama Mobile', costPerMinute: 0.23 },
    { prefix: '00507', category: 'international', description: 'Panama', costPerMinute: 0.13 },
    
    // PERU (0051)
    { prefix: '00519', category: 'international', description: 'Peru Mobile', costPerMinute: 0.23 },
    { prefix: '0051', category: 'international', description: 'Peru', costPerMinute: 0.09 },
    
    // FILIPPINE (0063)
    { prefix: '00639', category: 'international', description: 'Filippine Mobile', costPerMinute: 0.23 },
    { prefix: '0063', category: 'international', description: 'Filippine', costPerMinute: 0.23 },
    
    // POLONIA (0048)
    { prefix: '004850', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004851', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004853', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004857', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004860', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004866', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004869', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004872', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004873', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004878', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004879', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '004888', category: 'international', description: 'Polonia Mobile', costPerMinute: 0.23 },
    { prefix: '0048', category: 'international', description: 'Polonia', costPerMinute: 0.03 },
    
    // PORTOGALLO (00351)
    { prefix: '003519', category: 'international', description: 'Portogallo Mobile', costPerMinute: 0.23 },
    { prefix: '00351', category: 'international', description: 'Portogallo', costPerMinute: 0.02 },
    
    // QATAR (00974)
    { prefix: '009743', category: 'international', description: 'Qatar Mobile', costPerMinute: 0.40 },
    { prefix: '009745', category: 'international', description: 'Qatar Mobile', costPerMinute: 0.40 },
    { prefix: '009746', category: 'international', description: 'Qatar Mobile', costPerMinute: 0.40 },
    { prefix: '009747', category: 'international', description: 'Qatar Mobile', costPerMinute: 0.40 },
    { prefix: '00974', category: 'international', description: 'Qatar', costPerMinute: 0.40 },
    
    // REGNO UNITO (0044) - dettaglio esistente
    { prefix: '004420', category: 'international', description: 'Regno Unito Fisso - Londra', costPerMinute: 0.02 },
    { prefix: '0044121', category: 'international', description: 'Regno Unito Fisso - Birmingham', costPerMinute: 0.02 },
    { prefix: '0044161', category: 'international', description: 'Regno Unito Fisso - Manchester', costPerMinute: 0.02 },
    { prefix: '0044113', category: 'international', description: 'Regno Unito Fisso - Leeds', costPerMinute: 0.02 },
    { prefix: '0044141', category: 'international', description: 'Regno Unito Fisso - Glasgow', costPerMinute: 0.02 },
    { prefix: '0044131', category: 'international', description: 'Regno Unito Fisso - Edimburgo', costPerMinute: 0.02 },
    { prefix: '004474', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.23 },
    { prefix: '004475', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.23 },
    { prefix: '004476', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.23 },
    { prefix: '004477', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.23 },
    { prefix: '004478', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.23 },
    { prefix: '004479', category: 'international', description: 'Regno Unito Mobile', costPerMinute: 0.23 },
    { prefix: '0044', category: 'international', description: 'Regno Unito', costPerMinute: 0.02 },
    
    // ROMANIA (0040)
    { prefix: '004072', category: 'international', description: 'Romania Mobile', costPerMinute: 0.23 },
    { prefix: '004073', category: 'international', description: 'Romania Mobile', costPerMinute: 0.23 },
    { prefix: '004074', category: 'international', description: 'Romania Mobile', costPerMinute: 0.23 },
    { prefix: '004075', category: 'international', description: 'Romania Mobile', costPerMinute: 0.23 },
    { prefix: '004076', category: 'international', description: 'Romania Mobile', costPerMinute: 0.23 },
    { prefix: '004078', category: 'international', description: 'Romania Mobile', costPerMinute: 0.23 },
    { prefix: '0040', category: 'international', description: 'Romania', costPerMinute: 0.09 },
    
    // RUSSIA (007)
    { prefix: '00795', category: 'international', description: 'Russia Mobile', costPerMinute: 0.23 },
    { prefix: '00796', category: 'international', description: 'Russia Mobile', costPerMinute: 0.23 },
    { prefix: '00797', category: 'international', description: 'Russia Mobile', costPerMinute: 0.23 },
    { prefix: '00798', category: 'international', description: 'Russia Mobile', costPerMinute: 0.23 },
    { prefix: '00799', category: 'international', description: 'Russia Mobile', costPerMinute: 0.23 },
    { prefix: '007', category: 'international', description: 'Russia', costPerMinute: 0.13 },
    
    // ARABIA SAUDITA (00966)
    { prefix: '009665', category: 'international', description: 'Arabia Saudita Mobile', costPerMinute: 0.23 },
    { prefix: '00966', category: 'international', description: 'Arabia Saudita', costPerMinute: 0.23 },
    
    // SERBIA (00381)
    { prefix: '003816', category: 'international', description: 'Serbia Mobile', costPerMinute: 0.40 },
    { prefix: '00381', category: 'international', description: 'Serbia', costPerMinute: 0.13 },
    
    // SINGAPORE (0065)
    { prefix: '00658', category: 'international', description: 'Singapore Mobile', costPerMinute: 0.23 },
    { prefix: '00659', category: 'international', description: 'Singapore Mobile', costPerMinute: 0.23 },
    { prefix: '0065', category: 'international', description: 'Singapore', costPerMinute: 0.08 },
    
    // SLOVACCHIA (00421)
    { prefix: '004219', category: 'international', description: 'Slovacchia Mobile', costPerMinute: 0.23 },
    { prefix: '00421', category: 'international', description: 'Slovacchia', costPerMinute: 0.09 },
    
    // SLOVENIA (00386)
    { prefix: '003863', category: 'international', description: 'Slovenia Mobile', costPerMinute: 0.40 },
    { prefix: '003864', category: 'international', description: 'Slovenia Mobile', costPerMinute: 0.40 },
    { prefix: '00386', category: 'international', description: 'Slovenia', costPerMinute: 0.05 },
    
    // SUD AFRICA (0027)
    { prefix: '002771', category: 'international', description: 'Sud Africa Mobile', costPerMinute: 0.23 },
    { prefix: '002772', category: 'international', description: 'Sud Africa Mobile', costPerMinute: 0.23 },
    { prefix: '002773', category: 'international', description: 'Sud Africa Mobile', costPerMinute: 0.23 },
    { prefix: '002774', category: 'international', description: 'Sud Africa Mobile', costPerMinute: 0.23 },
    { prefix: '002776', category: 'international', description: 'Sud Africa Mobile', costPerMinute: 0.23 },
    { prefix: '002778', category: 'international', description: 'Sud Africa Mobile', costPerMinute: 0.23 },
    { prefix: '002779', category: 'international', description: 'Sud Africa Mobile', costPerMinute: 0.23 },
    { prefix: '0027', category: 'international', description: 'Sud Africa', costPerMinute: 0.13 },
    
    // COREA DEL SUD (0082)
    { prefix: '008201', category: 'international', description: 'Corea del Sud Mobile', costPerMinute: 0.23 },
    { prefix: '0082', category: 'international', description: 'Corea del Sud', costPerMinute: 0.08 },
    
    // SPAGNA (0034) - dettaglio esistente
    { prefix: '003491', category: 'international', description: 'Spagna Fisso - Madrid', costPerMinute: 0.02 },
    { prefix: '003493', category: 'international', description: 'Spagna Fisso - Barcelona', costPerMinute: 0.02 },
    { prefix: '003495', category: 'international', description: 'Spagna Fisso - Valencia', costPerMinute: 0.02 },
    { prefix: '003496', category: 'international', description: 'Spagna Fisso - Alicante', costPerMinute: 0.02 },
    { prefix: '003494', category: 'international', description: 'Spagna Fisso - Siviglia', costPerMinute: 0.02 },
    { prefix: '003498', category: 'international', description: 'Spagna Fisso - Bilbao', costPerMinute: 0.02 },
    { prefix: '003497', category: 'international', description: 'Spagna Fisso - Asturias', costPerMinute: 0.02 },
    { prefix: '003492', category: 'international', description: 'Spagna Fisso - La Coruña', costPerMinute: 0.02 },
    { prefix: '00346', category: 'international', description: 'Spagna Mobile', costPerMinute: 0.23 },
    { prefix: '00347', category: 'international', description: 'Spagna Mobile', costPerMinute: 0.23 },
    { prefix: '00348', category: 'international', description: 'Spagna Mobile', costPerMinute: 0.23 },
    { prefix: '00349', category: 'international', description: 'Spagna Mobile', costPerMinute: 0.23 },
    { prefix: '0034', category: 'international', description: 'Spagna', costPerMinute: 0.02 },
    
    // SRI LANKA (0094)
    { prefix: '009471', category: 'international', description: 'Sri Lanka Mobile', costPerMinute: 0.23 },
    { prefix: '009472', category: 'international', description: 'Sri Lanka Mobile', costPerMinute: 0.23 },
    { prefix: '009475', category: 'international', description: 'Sri Lanka Mobile', costPerMinute: 0.23 },
    { prefix: '009477', category: 'international', description: 'Sri Lanka Mobile', costPerMinute: 0.23 },
    { prefix: '009478', category: 'international', description: 'Sri Lanka Mobile', costPerMinute: 0.23 },
    { prefix: '0094', category: 'international', description: 'Sri Lanka', costPerMinute: 0.13 },
    
    // SVEZIA (0046)
    { prefix: '004670', category: 'international', description: 'Svezia Mobile', costPerMinute: 0.40 },
    { prefix: '004672', category: 'international', description: 'Svezia Mobile', costPerMinute: 0.40 },
    { prefix: '004673', category: 'international', description: 'Svezia Mobile', costPerMinute: 0.40 },
    { prefix: '004676', category: 'international', description: 'Svezia Mobile', costPerMinute: 0.40 },
    { prefix: '0046', category: 'international', description: 'Svezia', costPerMinute: 0.02 },
    
    // SVIZZERA (0041) - dettaglio esistente
    { prefix: '004122', category: 'international', description: 'Svizzera Fisso - Ginevra', costPerMinute: 0.02 },
    { prefix: '004144', category: 'international', description: 'Svizzera Fisso - Zurigo', costPerMinute: 0.02 },
    { prefix: '004131', category: 'international', description: 'Svizzera Fisso - Basilea', costPerMinute: 0.02 },
    { prefix: '004121', category: 'international', description: 'Svizzera Fisso - Losanna', costPerMinute: 0.02 },
    { prefix: '004161', category: 'international', description: 'Svizzera Fisso - Basilea', costPerMinute: 0.02 },
    { prefix: '004174', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.19 },
    { prefix: '004175', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.19 },
    { prefix: '004176', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.19 },
    { prefix: '004177', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.19 },
    { prefix: '004178', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.19 },
    { prefix: '004179', category: 'international', description: 'Svizzera Mobile', costPerMinute: 0.19 },
    { prefix: '0041', category: 'international', description: 'Svizzera', costPerMinute: 0.02 },
    
    // TAIWAN (00886)
    { prefix: '008869', category: 'international', description: 'Taiwan Mobile', costPerMinute: 0.23 },
    { prefix: '00886', category: 'international', description: 'Taiwan', costPerMinute: 0.05 },
    
    // THAILANDIA (0066)
    { prefix: '00668', category: 'international', description: 'Thailandia Mobile', costPerMinute: 0.23 },
    { prefix: '00669', category: 'international', description: 'Thailandia Mobile', costPerMinute: 0.23 },
    { prefix: '0066', category: 'international', description: 'Thailandia', costPerMinute: 0.08 },
    
    // TUNISIA (00216)
    { prefix: '002162', category: 'international', description: 'Tunisia Mobile', costPerMinute: 0.40 },
    { prefix: '002169', category: 'international', description: 'Tunisia Mobile', costPerMinute: 0.40 },
    { prefix: '00216', category: 'international', description: 'Tunisia', costPerMinute: 0.23 },
    
    // TURCHIA (0090)
    { prefix: '009050', category: 'international', description: 'Turchia Mobile', costPerMinute: 0.23 },
    { prefix: '009051', category: 'international', description: 'Turchia Mobile', costPerMinute: 0.23 },
    { prefix: '009052', category: 'international', description: 'Turchia Mobile', costPerMinute: 0.23 },
    { prefix: '009053', category: 'international', description: 'Turchia Mobile', costPerMinute: 0.23 },
    { prefix: '009054', category: 'international', description: 'Turchia Mobile', costPerMinute: 0.23 },
    { prefix: '009055', category: 'international', description: 'Turchia Mobile', costPerMinute: 0.23 },
    { prefix: '009056', category: 'international', description: 'Turchia Mobile', costPerMinute: 0.23 },
    { prefix: '0090', category: 'international', description: 'Turchia', costPerMinute: 0.05 },
    
    // UCRAINA (00380)
    { prefix: '003803', category: 'international', description: 'Ucraina Mobile', costPerMinute: 0.23 },
    { prefix: '003805', category: 'international', description: 'Ucraina Mobile', costPerMinute: 0.23 },
    { prefix: '003806', category: 'international', description: 'Ucraina Mobile', costPerMinute: 0.23 },
    { prefix: '003809', category: 'international', description: 'Ucraina Mobile', costPerMinute: 0.23 },
    { prefix: '00380', category: 'international', description: 'Ucraina', costPerMinute: 0.13 },
    
    // EMIRATI ARABI UNITI (00971)
    { prefix: '009715', category: 'international', description: 'Emirati Arabi Mobile', costPerMinute: 0.23 },
    { prefix: '00971', category: 'international', description: 'Emirati Arabi Uniti', costPerMinute: 0.23 },
    
    // URUGUAY (00598)
    { prefix: '005989', category: 'international', description: 'Uruguay Mobile', costPerMinute: 0.40 },
    { prefix: '00598', category: 'international', description: 'Uruguay', costPerMinute: 0.23 },
    
    // VENEZUELA (0058)
    { prefix: '005841', category: 'international', description: 'Venezuela Mobile', costPerMinute: 0.23 },
    { prefix: '005842', category: 'international', description: 'Venezuela Mobile', costPerMinute: 0.23 },
    { prefix: '005843', category: 'international', description: 'Venezuela Mobile', costPerMinute: 0.23 },
    { prefix: '005844', category: 'international', description: 'Venezuela Mobile', costPerMinute: 0.23 },
    { prefix: '0058', category: 'international', description: 'Venezuela', costPerMinute: 0.08 },
    
    // VIETNAM (0084)
    { prefix: '008412', category: 'international', description: 'Vietnam Mobile', costPerMinute: 0.23 },
    { prefix: '008416', category: 'international', description: 'Vietnam Mobile', costPerMinute: 0.23 },
    { prefix: '008418', category: 'international', description: 'Vietnam Mobile', costPerMinute: 0.23 },
    { prefix: '008419', category: 'international', description: 'Vietnam Mobile', costPerMinute: 0.23 },
    { prefix: '0084', category: 'international', description: 'Vietnam', costPerMinute: 0.23 },
    
    // SERVIZI SPECIALI
    { prefix: '001888', category: 'special', description: 'Servizi Speciali Internazionali', costPerMinute: 2.00 },
    { prefix: '001900', category: 'special', description: 'Servizi Speciali Internazionali', costPerMinute: 2.00 },
    { prefix: '0041800', category: 'special', description: 'Servizi Speciali Svizzeri', costPerMinute: 2.00 },
    { prefix: '0041900', category: 'special', description: 'Servizi Speciali Svizzeri', costPerMinute: 2.00 },
    { prefix: '00870', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00871', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00872', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00873', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00874', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00875', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00876', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00877', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00878', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00879', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00880', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00881', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00882', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00883', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    { prefix: '00888', category: 'special', description: 'Servizi Satellitari', costPerMinute: 2.00 },
    
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
