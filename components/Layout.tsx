
import React from 'react';
import { Home, BookOpen, MessageCircle, BarChart2, Users, Layers, GraduationCap } from 'lucide-react';
import { Screen } from '../types';
import StarBackground from './StarBackground';
import { translations, Language } from '../utils/translations';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  lang?: Language;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, setScreen, lang = 'en' }) => {
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

  const t = translations[lang];

  const NavItem = ({ screen, icon: Icon, label }: { screen: Screen; icon: any; label: string }) => {
    const isActive = currentScreen === screen;
    return (
      <button
        onClick={() => setScreen(screen)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
          isActive ? 'text-neon-cyan' : 'text-slate-400 hover:text-white'
        } transition-colors duration-200 active:scale-95`}
      >
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[9px] font-medium">{label}</span>
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
      <div className="absolute bottom-0 left-0 w-full h-20 pb-[env(safe-area-inset-bottom)] bg-space-900/90 backdrop-blur-xl border-t border-white/10 flex justify-between items-center px-4 z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)] safe-area-bottom">
        <NavItem screen={Screen.DASHBOARD} icon={Home} label={t.home} />
        <NavItem screen={Screen.STUDY_PLAN} icon={BookOpen} label={t.plan} />
        
        <div className="relative -top-6 mx-2">
            <button 
                onClick={() => setScreen(Screen.CHAT)}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(176,38,255,0.5)] border-4 border-space-900 transform transition hover:scale-105 active:scale-95"
            >
                <MessageCircle size={28} fill="white" className="text-white" />
            </button>
        </div>
        
        <NavItem screen={Screen.EXAM_GENERATOR} icon={GraduationCap} label={t.exams} />
        <NavItem screen={Screen.FLASHCARDS} icon={Layers} label={t.cards} />
      </div>
    </div>
  );
};

export default Layout;
