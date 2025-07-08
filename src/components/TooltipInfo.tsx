import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info, TrendingUp, Phone, Clock, Euro } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipInfoProps {
  content: React.ReactNode;
  icon?: 'help' | 'info' | 'trending' | 'phone' | 'clock' | 'euro';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const TooltipInfo: React.FC<TooltipInfoProps> = ({
  content,
  icon = 'help',
  side = 'top',
  className
}) => {
  const IconComponent = {
    help: HelpCircle,
    info: Info,
    trending: TrendingUp,
    phone: Phone,
    clock: Clock,
    euro: Euro
  }[icon];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconComponent 
            className={cn(
              "h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors",
              className
            )} 
          />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Predefined tooltips for common KPIs
export const KPITooltips = {
  totalCalls: (
    <div className="space-y-1">
      <p className="font-semibold">Totale Chiamate</p>
      <p className="text-sm">Numero totale di chiamate effettuate nel periodo analizzato.</p>
    </div>
  ),
  
  totalDuration: (
    <div className="space-y-1">
      <p className="font-semibold">Durata Totale</p>
      <p className="text-sm">Somma di tutte le durate delle chiamate in ore, minuti e secondi.</p>
    </div>
  ),
  
  totalCost: (
    <div className="space-y-1">
      <p className="font-semibold">Costo Totale</p>
      <p className="text-sm">Costo complessivo calcolato in base alle tariffe configurate per ogni categoria di numero.</p>
    </div>
  ),
  
  uniqueCallers: (
    <div className="space-y-1">
      <p className="font-semibold">Numeri Chiamanti</p>
      <p className="text-sm">Numero di numeri telefonici unici che hanno effettuato chiamate.</p>
    </div>
  ),
  
  averageCost: (
    <div className="space-y-1">
      <p className="font-semibold">Costo Medio</p>
      <p className="text-sm">Costo medio per singola chiamata calcolato dividendo il costo totale per il numero di chiamate.</p>
    </div>
  ),
  
  averageDuration: (
    <div className="space-y-1">
      <p className="font-semibold">Durata Media</p>
      <p className="text-sm">Durata media per singola chiamata calcolata dividendo la durata totale per il numero di chiamate.</p>
    </div>
  ),
  
  hourlyDistribution: (
    <div className="space-y-1">
      <p className="font-semibold">Distribuzione Oraria</p>
      <p className="text-sm">Mostra come le chiamate si distribuiscono nelle 24 ore della giornata per identificare i picchi di utilizzo.</p>
    </div>
  ),
  
  categoryBreakdown: (
    <div className="space-y-1">
      <p className="font-semibold">Analisi per Categoria</p>
      <p className="text-sm">Suddivisione delle chiamate per tipo (Mobile, Fisso, Internazionale, etc.) con relativi costi e percentuali.</p>
    </div>
  ),
  
  topNumbers: (
    <div className="space-y-1">
      <p className="font-semibold">Numeri Più Chiamati</p>
      <p className="text-sm">Classifica dei numeri chiamati più frequentemente, utile per identificare contatti ricorrenti e ottimizzare i costi.</p>
    </div>
  ),
  
  repeatedCalls: (
    <div className="space-y-1">
      <p className="font-semibold">Chiamate Ripetute</p>
      <p className="text-sm">Numeri chiamati più di una volta. Percentuale elevata può indicare necessità di abbonamenti o tariffe agevolate.</p>
    </div>
  ),
  
  peakHours: (
    <div className="space-y-1">
      <p className="font-semibold">Ore di Picco</p>
      <p className="text-sm">Fasce orarie con il maggior numero di chiamate. Utile per pianificare l'utilizzo e ottimizzare le tariffe orarie.</p>
    </div>
  ),
  
  costEfficiency: (
    <div className="space-y-1">
      <p className="font-semibold">Efficienza Costi</p>
      <p className="text-sm">Rapporto tra durata e costo delle chiamate. Valori alti indicano una buona efficienza nella gestione dei costi.</p>
    </div>
  )
};

export default TooltipInfo;