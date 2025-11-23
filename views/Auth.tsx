
import React, { useState } from 'react';
import { User, LearningStyle } from '../types';
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Globe } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface AuthProps {
  onLogin: (user: User) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, lang, setLang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
        setError("Please fill in all fields");
        return;
    }

    try {
        // Get existing users database from local storage safely
        let usersDb: Record<string, any> = {};
        try {
            const usersDbStr = localStorage.getItem('nova_users_db');
            if (usersDbStr) {
                usersDb = JSON.parse(usersDbStr);
            }
        } catch (parseError) {
            console.error("User DB corrupted, resetting", parseError);
            usersDb = {};
            localStorage.setItem('nova_users_db', '{}');
        }

        if (isLogin) {
            // --- LOGIN LOGIC ---
            const userData = usersDb[email.toLowerCase()];
            
            if (userData && userData.password === password) {
                onLogin({
                  ...userData.user,
                  language: lang
                });
            } else {
                setError("Invalid email or password");
            }
        } else {
            // --- SIGN UP LOGIC ---
            if (!name) {
                setError("Please enter your name");
                return;
            }

            if (usersDb[email.toLowerCase()]) {
                setError("User with this email already exists");
                return;
            }

            // Create new user object
            const newUser: User = {
              name: name,
              email: email.toLowerCase(),
              learningStyle: LearningStyle.UNDEFINED,
              streak: 1,
              points: 0,
              level: 1,
              language: lang,
              achievements: [
                 { id: '1', title: 'Nova Novice', description: 'Created your account', icon: '🚀', unlocked: true },
                 { id: '2', title: 'Style Seeker', description: 'Completed learning style test', icon: '🧠', unlocked: false },
                 { id: '3', title: 'Focus Master', description: 'Complete a Pomodoro session', icon: '⏱️', unlocked: false },
                 { id: '4', title: 'Social Star', description: 'Make your first community post', icon: '🌟', unlocked: false },
                 { id: '5', title: 'Task Titan', description: 'Complete 3 study tasks', icon: '✅', unlocked: false },
                 { id: '6', title: 'Streak Week', description: '7 day login streak', icon: '🔥', unlocked: false },
              ],
            };

            // Save to "Database"
            usersDb[email.toLowerCase()] = {
                user: newUser,
                password: password // Note: In a real app, never store plain passwords!
            };
            localStorage.setItem('nova_users_db', JSON.stringify(usersDb));

            onLogin(newUser);
        }
    } catch (err) {
        setError("An unexpected error occurred. Please try clearing your browser data.");
        console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md animate-float px-4">
      <button onClick={toggleLang} className="absolute top-4 right-4 text-slate-400 flex items-center gap-2">
          <Globe size={18} /> {lang.toUpperCase()}
      </button>

      <div className="text-center mb-10">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-neon-blue to-neon-purple rounded-3xl flex items-center justify-center shadow-2xl mb-4 transform rotate-12">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-14 h-14 text-white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Nova Learn
        </h1>
        <p className="text-slate-400 mt-2">Your Cosmic Study Companion</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple"></div>
        
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isLogin ? t.welcomeBack : t.joinCrew}
        </h2>
        
        {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-sm animate-pulse">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
             <div className="relative group">
                <UserIcon size={20} className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-neon-blue transition-colors rtl:right-3 rtl:left-auto" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder} 
                  className="w-full bg-space-700/50 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:border-neon-blue text-white placeholder-slate-500 transition-colors"
                />
             </div>
            )}
            
            <div className="relative group">
              <Mail size={20} className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-neon-blue transition-colors rtl:right-3 rtl:left-auto" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full bg-space-700/50 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:border-neon-blue text-white placeholder-slate-500 transition-colors"
              />
            </div>

            <div className="relative group">
              <Lock size={20} className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-neon-blue transition-colors rtl:right-3 rtl:left-auto" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passPlaceholder}
                className="w-full bg-space-700/50 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:border-neon-blue text-white placeholder-slate-500 transition-colors"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 rounded-xl font-bold text-lg shadow-lg shadow-neon-blue/30 hover:shadow-neon-blue/50 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              {isLogin ? t.login : t.signup} <ArrowRight size={20} className="rotate-rtl-180" />
            </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isLogin ? t.noAccount : t.hasAccount}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="ml-2 text-neon-cyan font-medium hover:underline"
            >
              {isLogin ? t.signup : t.login}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
