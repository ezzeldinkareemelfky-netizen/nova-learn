
import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User, Task } from '../types';

interface ProgressProps {
  user: User;
  tasks: Task[];
}

const Progress: React.FC<ProgressProps> = ({ user, tasks }) => {
  
  // Calculate real stats from tasks
  const todayDate = new Date().toISOString().split('T')[0];
  const completedTasksToday = tasks.filter(t => t.completed && t.date === todayDate);
  const completedHoursToday = completedTasksToday.reduce((acc, t) => acc + t.duration, 0);
  
  const totalTasksToday = tasks.filter(t => t.date === todayDate).length;
  const percentage = totalTasksToday > 0 ? Math.round((completedTasksToday.length / totalTasksToday) * 100) : 0;

  // Generate Data for Chart (Last 7 Days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Sum duration of tasks completed on this date
      const hours = tasks
        .filter(t => t.completed && t.date === dateStr)
        .reduce((acc, t) => acc + t.duration, 0);
        
      chartData.push({ name: dayName, hours: hours });
  }

  const totalHoursAllTime = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.duration, 0);

  return (
    <div className="p-6 pt-10 pb-24 h-full overflow-y-auto">
       <h2 className="text-2xl font-bold mb-6">Progress Tracking</h2>

       {/* Main Stats Card */}
       <div className="bg-space-800/80 rounded-3xl p-6 border border-white/5 shadow-xl mb-6">
            <h3 className="text-slate-400 text-sm mb-4">Today's Focus</h3>
            <div className="flex items-center justify-between">
                <div className="relative w-32 h-32">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="60" stroke="#1E293B" strokeWidth="8" fill="none" />
                        <circle 
                            cx="64" 
                            cy="64" 
                            r="60" 
                            stroke="#00F0FF" 
                            strokeWidth="8" 
                            fill="none" 
                            strokeDasharray="377" 
                            strokeDashoffset={377 - (377 * percentage) / 100} 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out"
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-2xl font-bold">{percentage}%</span>
                         <span className="text-xs text-slate-400">Daily Goal</span>
                     </div>
                </div>
                <div className="space-y-4 text-right">
                    <div>
                        <p className="text-2xl font-bold">{totalHoursAllTime.toFixed(1)}h</p>
                        <p className="text-xs text-slate-400">Lifetime Hours</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-neon-purple">{completedHoursToday.toFixed(1)}h</p>
                        <p className="text-xs text-slate-400">Study Today</p>
                    </div>
                </div>
            </div>
       </div>

       {/* Chart */}
       <div className="bg-space-800/80 rounded-3xl p-6 border border-white/5 shadow-xl mb-6 h-64">
           <h3 className="text-slate-400 text-sm mb-4">Last 7 Days Activity</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
               <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tickLine={false} 
                axisLine={false} 
                fontSize={12}
                />
               <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
               />
               <Bar dataKey="hours" radius={[6, 6, 6, 6]}>
                 {chartData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={index === 6 ? '#B026FF' : '#4D4DFF'} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
       </div>

       {/* AI Insight */}
       <div className="p-4 rounded-2xl bg-gradient-to-br from-space-800 to-indigo-950 border border-indigo-500/30">
           <p className="text-sm leading-relaxed italic text-slate-300">
               "Great job! Your concentration is peaking. Since you're a {user.learningStyle} learner, try breaking up your next session with more {user.learningStyle === 'Visual' ? 'diagrams' : user.learningStyle === 'Auditory' ? 'podcasts' : 'practice problems'}."
               <br/>
               <span className="text-xs text-neon-cyan mt-2 block not-italic font-bold">- Nova AI Analysis</span>
           </p>
       </div>
    </div>
  );
};

export default Progress;
