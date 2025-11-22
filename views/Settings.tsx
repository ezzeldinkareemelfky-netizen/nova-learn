
import React from 'react';
import { User, Screen, Task } from '../types';
import { Moon, Globe, RefreshCcw, Bell, LogOut, User as UserIcon, Award, Shield, ChevronRight, ArrowLeft, Calendar as CalendarIcon, ToggleLeft, ToggleRight, Download } from 'lucide-react';

interface SettingsProps {
  user: User;
  tasks: Task[];
  onLogout: () => void;
  onRetakeQuiz: () => void;
  onBack: () => void;
  doNotDisturb: boolean;
  setDoNotDisturb: (val: boolean) => void;
  installApp?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, tasks, onLogout, onRetakeQuiz, onBack, doNotDisturb, setDoNotDisturb, installApp }) => {
  
  const handleCalendarSync = () => {
      // Generate ICS file content
      let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//NovaLearn//StudyPlan//EN\n";
      
      tasks.forEach(task => {
          // For demo purposes, we assume tasks are 'today'. In a real app, we'd parse task.time properly
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const dateStr = `${year}${month}${day}`;
          
          icsContent += "BEGIN:VEVENT\n";
          icsContent += `SUMMARY:${task.title} (${task.subject})\n`;
          icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`; 
          icsContent += `DESCRIPTION:Study session for ${task.subject}\n`;
          icsContent += "END:VEVENT\n";
      });

      icsContent += "END:VCALENDAR";

      // Create download link
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'nova_study_plan.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const SettingItem = ({ icon: Icon, label, value, onClick, toggle }: { icon: any, label: string, value?: string, onClick?: () => void, toggle?: boolean }) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-space-800 border border-white/5 rounded-2xl cursor-pointer hover:bg-space-700 transition-colors mb-3 group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
                <Icon size={20} />
            </div>
            <span className="font-medium group-hover:text-neon-cyan transition-colors">{label}</span>
        </div>
        {toggle !== undefined ? (
            <div className={toggle ? "text-neon-cyan" : "text-slate-600"}>
                {toggle ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </div>
        ) : (
            value ? <span className="text-slate-400 text-sm">{value}</span> : <ChevronRight size={16} className="text-slate-600" />
        )}
    </div>
  );

  return (
    <div className="p-6 pt-10 pb-24">
      <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 mr-2">
              <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">My Profile</h2>
      </div>

      {/* Profile & Gamification Card */}
      <div className="bg-gradient-to-br from-space-800 via-space-800 to-indigo-900/40 p-6 rounded-3xl border border-white/10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-neon-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="flex items-center gap-5 mb-6 relative z-10">
              <div className="w-20 h-20 rounded-full bg-space-900 overflow-hidden border-4 border-neon-purple/50 shadow-lg shadow-neon-purple/20">
                  <img src="https://picsum.photos/200" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                  <h3 className="font-bold text-xl">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded-md border border-neon-cyan/30">
                          Lvl {user.level}
                      </span>
                      <span className="text-slate-400 text-sm">{user.learningStyle} Learner</span>
                  </div>
              </div>
          </div>

          {/* XP Bar */}
          <div className="relative z-10">
              <div className="flex justify-between text-xs mb-2 font-medium">
                  <span className="text-slate-300">{user.points} XP</span>
                  <span className="text-slate-500">Next Level: {user.level * 1000 + 1000} XP</span>
              </div>
              <div className="w-full h-3 bg-space-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple" 
                    style={{ width: `${(user.points % 1000) / 10}%` }}
                  ></div>
              </div>
          </div>
      </div>

      {/* Achievements Grid */}
      <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award size={20} className="text-yellow-500" />
                  Achievements
              </h3>
              <span className="text-xs text-slate-400">{user.achievements.filter(a => a.unlocked).length}/{user.achievements.length} Unlocked</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
              {user.achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`aspect-square rounded-2xl border p-3 flex flex-col items-center justify-center text-center gap-2 transition-all ${
                        achievement.unlocked 
                            ? 'bg-white/5 border-neon-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                            : 'bg-space-900 border-white/5 opacity-50 grayscale'
                    }`}
                    title={achievement.description}
                  >
                      <div className="text-2xl">{achievement.icon}</div>
                      <p className="text-[10px] font-medium leading-tight">{achievement.title}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* Install App Banner */}
      {installApp && (
          <button 
            onClick={installApp}
            className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-neon-cyan to-blue-500 text-black font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
          >
              <Download size={20} />
              Install App on Home Screen
          </button>
      )}

      {/* Settings Options */}
      <h3 className="text-slate-500 uppercase tracking-wider text-xs font-bold mb-3 ml-1">Preferences</h3>
      <div className="space-y-1">
          <SettingItem 
            icon={Shield} 
            label="Do Not Disturb" 
            toggle={doNotDisturb}
            onClick={() => setDoNotDisturb(!doNotDisturb)} 
          />
          <SettingItem 
            icon={CalendarIcon} 
            label="Sync to Google Calendar" 
            value="Download .ics" 
            onClick={handleCalendarSync}
          />
          <SettingItem icon={Globe} label="Language" value="English" />
          <SettingItem icon={RefreshCcw} label="Retake Learning Style Test" onClick={onRetakeQuiz} />
      </div>

      <div className="mt-8 mb-8">
          <button 
            onClick={onLogout}
            className="w-full py-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
              <LogOut size={20} />
              Log Out
          </button>
          
          <button 
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            className="w-full mt-4 py-2 text-xs text-slate-500 hover:text-slate-300"
          >
              Clear App Data (Debug)
          </button>
      </div>
    </div>
  );
};

export default Settings;
