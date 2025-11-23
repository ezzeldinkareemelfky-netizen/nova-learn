
import React, { useState, useRef } from 'react';
import { User, Question } from '../types';
import { generateQuiz } from '../services/geminiService';
import { translations, Language } from '../utils/translations';
import { Upload, Sparkles, CheckCircle, XCircle, Play, ChevronRight, RefreshCw, Trophy, FileText, X } from 'lucide-react';

interface ExamGeneratorProps {
  user: User;
  lang: Language;
  onAddXP: (amount: number, reason: string) => void;
}

const ExamGenerator: React.FC<ExamGeneratorProps> = ({ user, lang, onAddXP }) => {
  const t = translations[lang];
  
  // State: 'input' | 'generating' | 'quiz' | 'results'
  const [step, setStep] = useState<'input' | 'generating' | 'quiz' | 'results'>('input');
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<{qId: string, correct: boolean, selected: number}[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          setInputText(event.target?.result as string);
      };
      reader.readAsText(file);
  };

  const handleGenerate = async () => {
      if (!inputText.trim()) return;
      setStep('generating');
      
      const generatedQuestions = await generateQuiz(inputText, user.apiKey, lang);
      
      if (generatedQuestions.length > 0) {
          setQuestions(generatedQuestions);
          setStep('quiz');
          setCurrentQIndex(0);
          setUserAnswers([]);
          setSelectedOption(null);
          setShowExplanation(false);
      } else {
          alert(lang === 'ar' ? "فشل توليد الاختبار. تأكد من مفتاح API والنص." : "Failed to generate exam. Check API Key and content.");
          setStep('input');
      }
  };

  const handleOptionSelect = (index: number) => {
      if (selectedOption !== null) return; // Prevent changing answer
      setSelectedOption(index);
      setShowExplanation(true);
      
      const isCorrect = index === questions[currentQIndex].correctIndex;
      if (isCorrect) {
          // Instant reward feedback sound could go here
      }
      
      setUserAnswers([
          ...userAnswers, 
          { 
              qId: questions[currentQIndex].id, 
              correct: isCorrect,
              selected: index
          }
      ]);
  };

  const handleNext = () => {
      if (currentQIndex < questions.length - 1) {
          setCurrentQIndex(prev => prev + 1);
          setSelectedOption(null);
          setShowExplanation(false);
      } else {
          finishExam();
      }
  };

  const finishExam = () => {
      setStep('results');
      // Calculate Score
      const correctCount = userAnswers.filter(a => a.correct).length;
      const scorePercentage = (correctCount / questions.length) * 100;
      
      // Award XP
      let xpEarned = correctCount * 10; // 10 XP per question
      if (scorePercentage >= 80) xpEarned += 50; // Bonus
      
      onAddXP(xpEarned, lang === 'ar' ? `إتمام اختبار (${Math.round(scorePercentage)}%)` : `Exam Completed (${Math.round(scorePercentage)}%)`);
  };

  const reset = () => {
      setStep('input');
      setInputText('');
      setQuestions([]);
      setUserAnswers([]);
  };

  // --- RENDER INPUT STEP ---
  if (step === 'input') {
      return (
          <div className="p-6 pt-10 h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-2">{t.examTitle}</h2>
              <p className="text-slate-400 text-sm mb-6">{t.examDesc}</p>
              
              <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-space-800 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col">
                      <textarea 
                          className="flex-1 bg-transparent resize-none focus:outline-none text-white placeholder-slate-500"
                          placeholder={t.pasteText}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                      />
                      {inputText && (
                           <button onClick={() => setInputText('')} className="text-xs text-slate-500 hover:text-red-400 self-end mt-2">
                               Clear
                           </button>
                      )}
                  </div>
                  
                  <div className="flex gap-3">
                       <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept=".txt,.md,.json"
                          onChange={handleFileUpload}
                      />
                      <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                      >
                          <Upload size={18} /> {t.uploadFile}
                      </button>
                      <button 
                          onClick={handleGenerate}
                          disabled={!inputText}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                          <Sparkles size={18} /> {t.generateBtn}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER GENERATING STEP ---
  if (step === 'generating') {
      return (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 relative mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-space-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-neon-purple animate-pulse" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">{lang === 'ar' ? 'جاري توليد الاختبار...' : 'Generating Exam...'}</h3>
              <p className="text-slate-400 max-w-xs mx-auto">
                  {lang === 'ar' ? 'يقوم الذكاء الاصطناعي بتحليل المحتوى وصياغة أسئلة دقيقة.' : 'AI is analyzing your content and crafting tricky questions.'}
              </p>
          </div>
      );
  }

  // --- RENDER QUIZ STEP ---
  if (step === 'quiz') {
      const currentQ = questions[currentQIndex];
      const progress = ((currentQIndex) / questions.length) * 100;

      return (
          <div className="p-6 pt-10 h-full flex flex-col safe-area-top">
              {/* Progress Bar */}
              <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>{t.question} {currentQIndex + 1}/{questions.length}</span>
                      <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-space-800 rounded-full overflow-hidden">
                      <div className="h-full bg-neon-cyan transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>

              {/* Question Card */}
              <div className="flex-1 overflow-y-auto">
                  <div className="bg-space-800/50 border border-white/5 rounded-2xl p-6 mb-6 shadow-lg">
                      <h3 className="text-xl font-bold leading-relaxed">{currentQ.question}</h3>
                  </div>

                  <div className="space-y-3 mb-20">
                      {currentQ.options.map((option, idx) => {
                          let stateClasses = "bg-space-800 border-white/10 hover:bg-space-700";
                          let icon = null;

                          if (selectedOption !== null) {
                              if (idx === currentQ.correctIndex) {
                                  stateClasses = "bg-green-500/20 border-green-500/50 text-green-100";
                                  icon = <CheckCircle size={20} className="text-green-400" />;
                              } else if (idx === selectedOption) {
                                  stateClasses = "bg-red-500/20 border-red-500/50 text-red-100";
                                  icon = <XCircle size={20} className="text-red-400" />;
                              } else {
                                  stateClasses = "opacity-50 bg-space-900 border-transparent";
                              }
                          }

                          return (
                              <button
                                  key={idx}
                                  onClick={() => handleOptionSelect(idx)}
                                  disabled={selectedOption !== null}
                                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${stateClasses}`}
                              >
                                  <span className="flex-1">{option}</span>
                                  {icon}
                              </button>
                          );
                      })}
                  </div>

                  {/* Explanation Slide-up */}
                  {showExplanation && (
                       <div className="animate-slideUp bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl mb-4">
                           <p className="text-xs font-bold text-indigo-300 uppercase mb-1">{t.explanation}</p>
                           <p className="text-sm text-indigo-100 leading-relaxed">{currentQ.explanation}</p>
                       </div>
                  )}
              </div>

              {/* Footer Action */}
              {selectedOption !== null && (
                  <div className="fixed bottom-24 left-0 w-full px-6 z-20">
                      <button 
                          onClick={handleNext}
                          className="w-full py-4 bg-white text-space-900 font-bold rounded-2xl shadow-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                      >
                          {currentQIndex < questions.length - 1 ? t.next : t.finish} 
                          <ChevronRight size={20} className="rtl:rotate-180" />
                      </button>
                  </div>
              )}
          </div>
      );
  }

  // --- RENDER RESULTS STEP ---
  if (step === 'results') {
      const correctCount = userAnswers.filter(a => a.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      
      return (
          <div className="p-6 pt-10 h-full flex flex-col items-center justify-center text-center animate-slideUp">
               <div className="w-32 h-32 relative mb-6">
                   <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="60" stroke="#1E293B" strokeWidth="8" fill="none" />
                        <circle 
                            cx="64" 
                            cy="64" 
                            r="60" 
                            stroke={score > 70 ? "#00F0FF" : "#B026FF"}
                            strokeWidth="8" 
                            fill="none" 
                            strokeDasharray="377" 
                            strokeDashoffset={377 - (377 * score) / 100} 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out"
                        />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-bold">{score}%</span>
                   </div>
               </div>

               <h2 className="text-3xl font-bold mb-2">{score > 70 ? 'Excellent!' : 'Good Effort!'}</h2>
               <p className="text-slate-400 mb-8">You answered {correctCount} out of {questions.length} correctly.</p>

               <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-6 py-3 rounded-full mb-10">
                   <Trophy className="text-yellow-500" size={20} />
                   <span className="text-yellow-200 font-bold">+{correctCount * 10 + (score > 80 ? 50 : 0)} XP Earned</span>
               </div>

               <button 
                  onClick={reset}
                  className="w-full py-4 bg-space-800 border border-white/10 hover:bg-space-700 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
               >
                   <RefreshCw size={20} /> {t.backToExams}
               </button>
          </div>
      );
  }

  return null;
};

export default ExamGenerator;
