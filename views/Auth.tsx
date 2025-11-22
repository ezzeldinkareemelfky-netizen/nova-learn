
import React, { useState } from 'react';
import { Screen, User, LearningStyle } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    const mockUser: User = {
      name: 'Malik',
      email: email || 'malik@nova.com',
      learningStyle: LearningStyle.UNDEFINED, // Force quiz on first load if undefined
      streak: 5,
      points: 0,
      level: 1,
      achievements: [],
    };
    onLogin(mockUser);
  };

  return (
    <div className="w-full max-w-md animate-float">
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

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Join the Crew'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
             <div>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full bg-space-700/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue text-white placeholder-slate-500 transition-colors"
                />
             </div>
            )}
            
            <div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" 
                className="w-full bg-space-700/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue text-white placeholder-slate-500 transition-colors"
              />
            </div>

            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full bg-space-700/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue text-white placeholder-slate-500 transition-colors"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 rounded-xl font-bold text-lg shadow-lg shadow-neon-blue/30 hover:shadow-neon-blue/50 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-neon-cyan font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
