
import React, { useState } from 'react';
import { Plus, MoreVertical, CheckCircle, Circle, X, Trash2 } from 'lucide-react';
import { Task } from '../types';

interface StudyPlanProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const StudyPlan: React.FC<StudyPlanProps> = ({ tasks, onToggleTask, onAddTask, onDeleteTask }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle || !newTaskSubject) return;

      const newTask: Task = {
          id: Date.now().toString(),
          title: newTaskTitle,
          subject: newTaskSubject,
          time: newTaskTime || 'Anytime',
          duration: 1,
          completed: false,
          color: 'from-indigo-500 to-purple-600'
      };

      onAddTask(newTask);
      setShowAddModal(false);
      setNewTaskTitle('');
      setNewTaskSubject('');
      setNewTaskTime('');
  };

  return (
    <div className="p-6 pt-10 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Study Plan</h2>
        <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
            <Plus size={20} />
        </button>
      </div>

      {/* Calendar Strip */}
      <div className="flex justify-between items-center mb-8 overflow-x-auto no-scrollbar pb-2">
        {days.map((day, idx) => (
            <div key={day} className={`flex flex-col items-center min-w-[3.5rem] p-3 rounded-2xl border ${idx === 2 ? 'bg-neon-purple border-neon-purple shadow-lg shadow-neon-purple/40' : 'bg-space-800 border-white/5'}`}>
                <span className={`text-xs mb-1 ${idx === 2 ? 'text-white' : 'text-slate-400'}`}>{day}</span>
                <span className="font-bold text-lg">{8 + idx}</span>
            </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-4 relative">
          <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-slate-700/50"></div>
          
          {tasks.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                  <p>No tasks yet. Add one to get started!</p>
              </div>
          )}

          {tasks.map((task) => (
              <div key={task.id} className="relative pl-12 group">
                  {/* Connector Dot */}
                  <div 
                    onClick={() => onToggleTask(task.id)}
                    className={`absolute left-2 top-6 w-5 h-5 border-2 rounded-full flex items-center justify-center z-10 transition-all cursor-pointer ${task.completed ? 'bg-neon-cyan border-neon-cyan' : 'bg-space-900 border-slate-600 hover:border-neon-cyan'}`}
                  >
                      {task.completed && <CheckCircle size={14} className="text-black" />}
                  </div>
                  
                  <span className="absolute left-[-5px] top-6 text-xs text-slate-500 w-16 text-right hidden md:block">{task.time.split('-')[0]}</span>
                  
                  <div 
                    className={`p-4 rounded-2xl bg-gradient-to-r ${task.completed ? 'from-space-800 to-space-700 grayscale opacity-60' : task.color} shadow-lg relative overflow-hidden transform transition-all duration-300 cursor-pointer group-hover:scale-[1.01]`}
                  >
                        <div className="relative z-10 flex justify-between items-start">
                            <div onClick={() => onToggleTask(task.id)} className="flex-1">
                                <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>{task.title}</h3>
                                <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                                    {task.subject} • {task.time}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <div onClick={() => onToggleTask(task.id)} className="p-1 rounded-full bg-white/20 cursor-pointer">
                                    {task.completed ? <CheckCircle size={20} className="text-white" /> : <Circle size={20} className="text-white/70" />}
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                    className="text-white/50 hover:text-red-300 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        {!task.completed && <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>}
                  </div>
              </div>
          ))}

          {/* Empty Slot / Add Button */}
          <div 
            onClick={() => setShowAddModal(true)}
            className="relative pl-12 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          >
              <div className="absolute left-2 top-6 w-5 h-5 bg-space-900 border-2 border-slate-600 rounded-full z-10"></div>
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-600 flex items-center justify-center h-24 hover:border-neon-cyan transition-colors">
                  <span className="text-slate-400 text-sm flex items-center gap-2"><Plus size={16}/> Add Study Block</span>
              </div>
          </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="bg-space-800 border border-white/10 w-full max-w-md rounded-3xl p-6 relative animate-float" style={{animationDuration: '0s'}}>
                <button 
                    onClick={() => setShowAddModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X size={24} />
                </button>
                <h3 className="text-xl font-bold mb-6">Add Study Task</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 ml-1">Title</label>
                        <input 
                            type="text" 
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            placeholder="e.g. Read Chapter 4" 
                            className="w-full bg-space-700 border border-white/10 rounded-xl p-3 mt-1 focus:border-neon-cyan focus:outline-none text-white"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 ml-1">Subject</label>
                        <input 
                            type="text" 
                            value={newTaskSubject}
                            onChange={e => setNewTaskSubject(e.target.value)}
                            placeholder="e.g. Biology" 
                            className="w-full bg-space-700 border border-white/10 rounded-xl p-3 mt-1 focus:border-neon-cyan focus:outline-none text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 ml-1">Time (Optional)</label>
                        <input 
                            type="text" 
                            value={newTaskTime}
                            onChange={e => setNewTaskTime(e.target.value)}
                            placeholder="e.g. 2:00 PM" 
                            className="w-full bg-space-700 border border-white/10 rounded-xl p-3 mt-1 focus:border-neon-cyan focus:outline-none text-white"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-neon-cyan text-black font-bold py-3 rounded-xl mt-4 hover:bg-cyan-300 transition-colors"
                    >
                        Add Task
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlan;
