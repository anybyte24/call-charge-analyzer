import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SEO } from '@/components/SEO';
import { 
  Menu, 
  Activity, 
  Brain, 
  Sparkles,
  User,
  Bell,
  Search,
  Settings
} from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (value: string) => void;
  title?: string;
  subtitle?: string;
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange,
  title = "Call Analytics",
  subtitle = "Enterprise Suite"
}) => {
  const [notifications] = useState(3);

  return (
    <div className="page-container">
      <SEO 
        title="Call Analytics Enterprise Suite"
        description="Sistema avanzato per l'analisi e fatturazione delle chiamate telefoniche con AI-powered insights"
      />
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Sidebar */}
          <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />

          {/* Main Content */}
          <div className="flex-1 flex flex-col relative z-10">
            {/* Premium Header */}
            <header className="premium-card-glass border-b border-border/30 h-20 flex items-center justify-between px-8 backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-brand-accent bg-clip-text text-transparent">
                      {title}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="btn-secondary-premium gap-2 h-10">
                  <Search className="h-4 w-4" />
                  <span className="hidden md:inline">Cerca analytics...</span>
                </Button>
                
                <Button variant="outline" size="sm" className="btn-secondary-premium relative h-10">
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                  >
                    3
                  </Badge>
                </Button>
                
                <ThemeToggle />
                
                <Button variant="outline" size="sm" className="btn-secondary-premium gap-2 h-10">
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Profilo</span>
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
              <div className="content-wrapper">
                <div className="animate-fade-in">
                  {children}
                </div>
              </div>
            </main>

            {/* Premium Footer */}
            <footer className="premium-card-glass border-t border-border/30 p-6 text-center backdrop-blur-xl">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="font-medium">
                  © 2024 Call Analytics Enterprise Suite v2.1.0 | Sistema Operativo
                </p>
              </div>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};