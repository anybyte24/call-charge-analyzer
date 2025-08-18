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
} from 'lucide-react';

interface SidebarItem {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  description?: string;
}

const mainItems: SidebarItem[] = [
  { title: 'Carica Dati', value: 'upload', icon: Upload, description: 'Importa file di chiamate' },
  { title: 'Dashboard', value: 'dashboard', icon: BarChart3, description: 'Analisi e grafici' },
  { title: 'Configurazione', value: 'settings', icon: Settings, description: 'Gestione clienti e tariffe' },
];

const analyticsItems: SidebarItem[] = [
  { title: 'Export', value: 'export', icon: Download, description: 'Esporta dati' },
  { title: 'AI Insights', value: 'ai-insights', icon: Brain, description: 'Analisi intelligenti' },
  { title: 'Real-time', value: 'realtime', icon: Activity, description: 'Metriche in tempo reale' },
  { title: 'Automazioni', value: 'automation', icon: Workflow, description: 'Workflow automatici' },
  { title: 'AI Avanzato', value: 'ai-enhanced', icon: Zap, description: 'Analisi avanzate' },
  { title: 'FTP Import', value: 'ftp-import', icon: Server, description: 'Importazione automatica' },
];

const historyItems: SidebarItem[] = [
  { title: 'Storico Analisi', value: 'history', icon: History, description: 'Sessioni precedenti' },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ activeTab, onTabChange }) => {
  const collapsed = false; // Simplified for now
  const location = useLocation();

  const isActive = (value: string) => activeTab === value;

  const renderMenuItems = (items: SidebarItem[], collapsed: boolean) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.value}>
          <SidebarMenuButton
            onClick={() => onTabChange(item.value)}
            className={`w-full justify-start transition-all duration-200 ${
              isActive(item.value)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && (
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className={`border-r bg-card/50 backdrop-blur-sm ${collapsed ? 'w-16' : 'w-80'}`}>
      <SidebarContent className="p-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Navigazione
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems, collapsed)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Tools */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Strumenti Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(analyticsItems, collapsed)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* History */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Storico
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(historyItems, collapsed)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        {!collapsed && (
          <div className="mt-auto pt-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Call Analytics Enterprise
              <br />
              <span className="font-medium">v2.0.0</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};