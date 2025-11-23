
import React, { useState } from 'react';
import { User, Task } from '../types';
import { Globe, RefreshCcw, LogOut, Award, Shield, ChevronRight, ArrowLeft, Calendar as CalendarIcon, ToggleLeft, ToggleRight, Download, Key, Image } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface SettingsProps {
  user: User;
  tasks: Task[];
  onLogout: () => void;
  onRetakeQuiz: () => void;
  onBack: () => void;
  doNotDisturb: boolean;
  setDoNotDisturb: (val: boolean) => void;
  installApp?: () => void;
  onUpdateUser: (user: User) => void;
  lang: Language;
}

const Settings: React.FC<SettingsProps> = ({ user, tasks, onLogout, onRetakeQuiz, onBack, doNotDisturb, setDoNotDisturb, installApp, onUpdateUser, lang }) => {
  const [apiKey, setApiKey] = useState(user.apiKey || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  
  const t = translations[lang];

  const handleSaveProfile = () => {
      onUpdateUser({
          ...user,
          apiKey: apiKey,
          avatar: avatarUrl
      });
      setIsEditingKey(false);
      setIsEditingAvatar(false);
  };

  const handleLanguageToggle = () => {
      const newLang = lang === 'en' ? 'ar' : 'en';
      onUpdateUser({
          ...user,
          language: newLang
      });
  };

  const handleCalendarSync = () => {
      // Generate ICS file content
      let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//NovaLearn//StudyPlan//EN\n";
      
      tasks.forEach(task => {
          const dateStr = task.date.replace(/-/g, '');
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
                {toggle ? <ToggleRight size={28} className="rotate-rtl-180" /> : <ToggleLeft size={28} className="rotate-rtl-180" />}
            </div>
        ) : (
            value ? <span className="text-slate-400 text-sm">{value}</span> : <ChevronRight size={16} className="text-slate-600 rotate-rtl-180" />
        )}
    </div>
  );

  return (
    <div className="p-6 pt-10 pb-24">
      <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 ltr:mr-2 rtl:ml-2">
              <ArrowLeft size={24} className="rotate-rtl-180" />
          </button>
          <h2 className="text-2xl font-bold">{t.profile}</h2>
      </div>

      {/* Profile & Gamification Card */}
      <div className="bg-gradient-to-br from-space-800 via-space-800 to-indigo-900/40 p-6 rounded-3xl border border-white/10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-neon-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="flex items-center gap-5 mb-6 relative z-10">
              <div className="w-20 h-20 rounded-full bg-space-900 overflow-hidden border-4 border-neon-purple/50 shadow-lg shadow-neon-purple/20">
                  <img src={user.avatar || "https://picsum.photos/200"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-xl">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded-md border border-neon-cyan/30">
                          {t.lvl} {user.level}
                      </span>
                      <span className="text-slate-400 text-sm">{user.learningStyle}</span>
                  </div>
              </div>
          </div>

          {/* XP Bar */}
          <div className="relative z-10">
              <div className="flex justify-between text-xs mb-2 font-medium">
                  <span className="text-slate-300">{user.points} {t.xp}</span>
                  <span className="text-slate-500">{t.nextLevel}: {user.level * 1000 + 1000}</span>
              </div>
              <div className="w-full h-3 bg-space-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple" 
                    style={{ width: `${(user.points % 1000) / 10}%` }}
                  ></div>
              </div>
          </div>
      </div>

      {/* Customization Section */}
      <div className="mb-6 bg-space-800/50 rounded-3xl p-4 border border-white/5">
          <h3 className="text-slate-500 uppercase tracking-wider text-xs font-bold mb-3 ml-1">{t.accountSettings}</h3>
          
          {/* Avatar Edit */}
          <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Image size={16} /> {t.profilePic}
                  </div>
                  <button 
                    onClick={() => isEditingAvatar ? handleSaveProfile() : setIsEditingAvatar(true)}
                    className="text-xs text-neon-cyan hover:underline"
                  >
                      {isEditingAvatar ? t.save : t.edit}
                  </button>
              </div>
              {isEditingAvatar && (
                  <input 
                    type="text" 
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="w-full bg-space-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-neon-cyan focus:outline-none"
                  />
              )}
          </div>

          {/* API Key Edit */}
          <div>
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Key size={16} /> {t.apiKey}
                  </div>
                  <button 
                    onClick={() => isEditingKey ? handleSaveProfile() : setIsEditingKey(true)}
                    className="text-xs text-neon-cyan hover:underline"
                  >
                      {isEditingKey ? t.save : t.edit}
                  </button>
              </div>
              {isEditingKey ? (
                  <input 
                    type="text" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-space-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-neon-cyan focus:outline-none font-mono"
                  />
              ) : (
                  <p className="text-xs text-slate-500 font-mono bg-space-900 p-2 rounded-lg truncate">
                      {user.apiKey ? '••••••••••••••••••••••' : 'No Key Set'}
                  </p>
              )}
          </div>
      </div>

      {/* Achievements Grid */}
      <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award size={20} className="text-yellow-500" />
                  {t.achievements}
              </h3>
              <span className="text-xs text-slate-400">{user.achievements.filter(a => a.unlocked).length}/{user.achievements.length} {t.unlocked}</span>
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
              {t.installApp}
          </button>
      )}

      {/* Settings Options */}
      <h3 className="text-slate-500 uppercase tracking-wider text-xs font-bold mb-3 ml-1">{t.preferences}</h3>
      <div className="space-y-1">
          <SettingItem 
            icon={Shield} 
            label={t.doNotDisturb} 
            toggle={doNotDisturb}
            onClick={() => setDoNotDisturb(!doNotDisturb)} 
          />
          <SettingItem 
            icon={CalendarIcon} 
            label={t.syncCalendar} 
            value="ICS" 
            onClick={handleCalendarSync}
          />
          <SettingItem 
            icon={Globe} 
            label={t.language} 
            value={lang === 'en' ? 'English' : 'العربية'} 
            onClick={handleLanguageToggle}
          />
          <SettingItem icon={RefreshCcw} label={t.retakeTest} onClick={onRetakeQuiz} />
      </div>

      <div className="mt-8 mb-8">
          <button 
            onClick={onLogout}
            className="w-full py-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
              <LogOut size={20} className="rotate-rtl-180" />
              {t.logout}
          </button>
      </div>
    </div>
  );
};

export default Settings;
