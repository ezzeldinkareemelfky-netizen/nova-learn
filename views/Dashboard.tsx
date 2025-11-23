
import React, { useEffect, useState } from 'react';
import { User, Screen, Task } from '../types';
import { generateDailyTip } from '../services/geminiService';
import { Play, Calendar, Zap, Clock, X, Pause, RotateCcw } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface DashboardProps {
  user: User;
  tasks: Task[];
  setScreen: (screen: Screen) => void;
  onPomodoroComplete: () => void;
  doNotDisturb: boolean;
  setDoNotDisturb: (val: boolean) => void;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks, setScreen, onPomodoroComplete, doNotDisturb, setDoNotDisturb, lang }) => {
  const [tip, setTip] = useState<string>(lang === 'ar' ? 'جاري تحميل الحكمة...' : 'Loading your cosmic wisdom...');
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [timer, setTimer] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  
  const t = translations[lang];

  useEffect(() => {
    const fetchTip = async () => {
      const dailyTip = await generateDailyTip(user.learningStyle, user.apiKey, lang);
      setTip(dailyTip);
    };
    fetchTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      onPomodoroComplete();
      setTimer(25 * 60); // Reset
      setShowPomodoro(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer, onPomodoroComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
      setIsActive(false);
      setTimer(25 * 60);
  };

  // Calculations for Summary (Only Today's tasks)
  const todaysTasks = tasks.filter(t => t.date === today);
  const totalTasks = todaysTasks.length;
  const completedTasks = todaysTasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate total duration of completed tasks today
  const completedHours = todaysTasks
    .filter(t => t.completed)
    .reduce((acc, curr) => acc + curr.duration, 0);

  const nextTask = todaysTasks.find(t => !t.completed);

  return (
    <div className="p-6 pt-10 pb-24 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-slate-400 text-sm uppercase tracking-wider">{t.goodMorning}</h2>
          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
        </div>
        <button 
          onClick={() => setScreen(Screen.SETTINGS)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-cyan to-blue-500 p-[2px] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-shadow"
        >
             <img src={user.avatar || "https://picsum.photos/200"} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-space-900" />
        </button>
      </div>

      {/* Daily Summary */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {t.todaySummary}
        </h3>

        <div className="grid grid-cols-2 gap-4">
             <div className="bg-space-800/50 p-4 rounded-2xl border border-white/5">
                <span className="text-slate-400 text-xs">{t.tasks}</span>
                <p className="text-2xl font-bold text-neon-cyan">{completionPercentage}%</p>
                <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                    <div 
                        className="bg-neon-cyan h-1 rounded-full transition-all duration-500" 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
             </div>
             <div className="bg-space-800/50 p-4 rounded-2xl border border-white/5">
                <span className="text-slate-400 text-xs">{t.studyTime}</span>
                <p className="text-2xl font-bold text-neon-purple">{completedHours}h</p>
                <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                    {/* Mock daily goal of 4 hours */}
                    <div 
                        className="bg-neon-purple h-1 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((completedHours / 4) * 100, 100)}%` }}
                    ></div>
                </div>
             </div>
        </div>

        <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-300 mb-2">{t.aiSuggestion}</h4>
            <div className="flex items-start gap-3 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 rounded-2xl border border-indigo-500/30">
                <Zap className="text-yellow-400 shrink-0 mt-1" size={18} />
                <p className="text-sm text-slate-200 leading-relaxed italic">
                    "{tip}"
                </p>
            </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
            onClick={() => setShowPomodoro(true)}
            className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 group"
        >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                <Clock size={24} />
            </div>
            <span className="font-medium text-sm">{t.pomodoro}</span>
        </button>
        <button 
            onClick={() => setScreen(Screen.QUIZ)}
            className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 group relative overflow-hidden"
        >
             {user.learningStyle.toString() === 'UNDEFINED' && (
                 <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
             )}
            <div className="w-12 h-12 rounded-2xl bg-neon-cyan/20 flex items-center justify-center text-neon-cyan group-hover:scale-110 transition-transform">
                <Zap size={24} />
            </div>
            <span className="font-medium text-sm">{t.styleTest}</span>
        </button>
      </div>

       {/* Start Session CTA */}
       {nextTask ? (
           <button 
            onClick={() => setScreen(Screen.STUDY_PLAN)}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple p-[1px] rounded-3xl group"
           >
               <div className="bg-space-900 rounded-3xl p-4 flex items-center justify-between group-hover:bg-space-800 transition-colors">
                   <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue">
                           <Play size={20} fill="currentColor" className="ml-1 rtl:mr-1 rtl:ml-0" />
                       </div>
                       <div className="text-left rtl:text-right">
                           <p className="font-bold">{t.start} {nextTask.title}</p>
                           <p className="text-xs text-slate-400">{t.nextUp}</p>
                       </div>
                   </div>
                   <Calendar size={20} className="text-slate-500 rtl:rotate-180" />
               </div>
           </button>
       ) : (
        <div className="w-full p-4 rounded-3xl bg-space-800 border border-white/5 text-center text-slate-400">
            <p>{t.allDone}</p>
        </div>
       )}

       {/* Pomodoro Modal */}
       {showPomodoro && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
           <div className="bg-space-800 border border-white/10 w-full max-w-sm rounded-3xl p-8 flex flex-col items-center relative">
             <button 
                onClick={() => setShowPomodoro(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
             >
               <X size={24} />
             </button>
             
             <h2 className="text-2xl font-bold mb-2">{t.deepFocus}</h2>
             <p className="text-slate-400 text-sm mb-8">25 min</p>
             
             <div className="w-48 h-48 rounded-full border-4 border-space-700 flex items-center justify-center relative mb-8">
               <div className="absolute inset-0 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin duration-[3000ms]" style={{ animationPlayState: isActive ? 'running' : 'paused' }}></div>
               <span className="text-5xl font-mono font-bold text-white">{formatTime(timer)}</span>
             </div>

             <div className="flex gap-4 w-full">
               <button 
                 onClick={toggleTimer}
                 className={`flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${isActive ? 'bg-yellow-500/20 text-yellow-400' : 'bg-neon-blue text-white'}`}
               >
                 {isActive ? <><Pause size={20}/> {t.pause}</> : <><Play size={20}/> {t.start}</>}
               </button>
               <button 
                 onClick={resetTimer}
                 className="w-14 bg-space-700 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-space-600"
               >
                 <RotateCcw size={20} />
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default Dashboard;
