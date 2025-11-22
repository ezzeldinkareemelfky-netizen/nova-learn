
import React from 'react';
import { Home, BookOpen, MessageCircle, BarChart2, Users } from 'lucide-react';
import { Screen } from '../types';
import StarBackground from './StarBackground';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, setScreen }) => {
  // Hide nav on Auth screen
  if (currentScreen === Screen.AUTH) {
    return (
      <div className="relative w-full h-screen text-white overflow-hidden bg-space-900 safe-area-top safe-area-bottom">
        <StarBackground />
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
          {children}
        </div>
      </div>
    );
  }

  const NavItem = ({ screen, icon: Icon, label }: { screen: Screen; icon: any; label: string }) => {
    const isActive = currentScreen === screen;
    return (
      <button
        onClick={() => setScreen(screen)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
          isActive ? 'text-neon-cyan' : 'text-slate-400 hover:text-white'
        } transition-colors duration-200 active:scale-95`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        {/* <span className="text-[10px] font-medium">{label}</span> */}
      </button>
    );
  };

  return (
    <div className="relative w-full h-screen bg-space-900 text-white overflow-hidden flex flex-col safe-area-top">
      <StarBackground />
      
      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pb-24 no-scrollbar scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 w-full h-20 pb-[env(safe-area-inset-bottom)] bg-space-900/90 backdrop-blur-xl border-t border-white/10 flex justify-between items-center px-6 z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)] safe-area-bottom">
        <NavItem screen={Screen.DASHBOARD} icon={Home} label="Home" />
        <NavItem screen={Screen.STUDY_PLAN} icon={BookOpen} label="Plan" />
        <div className="relative -top-6">
            <button 
                onClick={() => setScreen(Screen.CHAT)}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(176,38,255,0.5)] border-4 border-space-900 transform transition hover:scale-105 active:scale-95"
            >
                <MessageCircle size={32} fill="white" className="text-white" />
            </button>
        </div>
        <NavItem screen={Screen.COMMUNITY} icon={Users} label="Community" />
        <NavItem screen={Screen.PROGRESS} icon={BarChart2} label="Progress" />
      </div>
    </div>
  );
};

export default Layout;