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
  Search
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
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
              <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="lg:hidden" />
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                      <Brain className="h-3 w-3 mr-1" />
                      AI-powered insights
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search */}
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <Search className="h-4 w-4 mr-2" />
                    Cerca...
                  </Button>

                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                      >
                        {notifications}
                      </Badge>
                    )}
                  </Button>

                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* User Menu */}
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-6">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-card/50 backdrop-blur-sm">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>© 2024 Call Analytics Enterprise</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Sistema avanzato per l'analisi e fatturazione delle chiamate telefoniche
                    </span>
                  </div>
                  
                  <div className="hidden sm:flex items-center gap-4">
                    <span>Status: Operativo</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};