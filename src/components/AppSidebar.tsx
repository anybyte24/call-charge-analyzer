import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Brain,
  Download,
  Server,
  Activity,
  Workflow,
  History,
  Zap,
  Upload,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
  FolderOpen
} from 'lucide-react';

interface SidebarItem {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  description?: string;
}

const mainItems: SidebarItem[] = [
  { title: 'Carica Dati', value: 'upload', icon: Upload, description: 'Importa file CSV' },
  { title: 'Dashboard', value: 'dashboard', icon: TrendingUp, description: 'Visualizza analytics' },
  { title: 'Configurazione', value: 'settings', icon: Settings, description: 'Gestisci impostazioni' },
];

const analyticsItems: SidebarItem[] = [
  { title: 'Export Avanzato', value: 'export', icon: Download, description: 'Esporta dati' },
  { title: 'AI Insights', value: 'ai-insights', icon: Sparkles, description: 'Analisi intelligenti' },
  { title: 'Metriche Live', value: 'realtime', icon: Activity, description: 'Monitoraggio real-time' },
  { title: 'Automazione', value: 'automation', icon: Zap, description: 'Workflow automatici' },
  { title: 'AI Avanzato', value: 'ai-enhanced', icon: Brain, description: 'Insights avanzati' },
  { title: 'FTP Import', value: 'ftp-import', icon: FolderOpen, description: 'Importazione automatica' },
];

const reportsItems: SidebarItem[] = [
  { title: 'Report Analisi', value: 'history', icon: FileText, description: 'Report dettagliati' },
  { title: 'Gestione Clienti', value: 'clients', icon: Users, description: 'Database clienti' },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ activeTab, onTabChange }) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const isActive = (value: string) => activeTab === value;

  const renderMenuItems = (items: SidebarItem[], collapsed: boolean) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.value}>
          <SidebarMenuButton
            onClick={() => onTabChange(item.value)}
            className={`${
              isActive(item.value) 
                ? 'sidebar-item-active-premium' 
                : 'sidebar-item-premium'
            } mb-1`}
          >
            <item.icon className={`h-5 w-5 ${isActive(item.value) ? 'text-white' : ''} transition-colors`} />
            {!collapsed && (
              <div className="flex flex-col items-start ml-3">
                <span className="font-semibold text-sm">{item.title}</span>
                {item.description && (
                  <span className="text-xs opacity-70 mt-0.5">{item.description}</span>
                )}
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className="border-r bg-white/50 backdrop-blur-md">
      <SidebarHeader className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-brand-accent bg-clip-text text-transparent">
                Call Analytics
              </h2>
              <p className="text-xs text-muted-foreground">Enterprise Suite</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
            Navigazione Principale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems, collapsed)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
            Strumenti Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(analyticsItems, collapsed)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
            Report & Gestione
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(reportsItems, collapsed)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};