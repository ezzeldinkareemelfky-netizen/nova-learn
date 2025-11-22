import React, { useState } from 'react';
import { User, LearningStyle, Screen } from '../types';
import { analyzeQuiz } from '../services/geminiService';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface QuizProps {
  user: User;
  onComplete: (style: LearningStyle) => void;
  onCancel: () => void;
}

const questions = [
  "When learning something new, do you prefer to watch a video?",
  "Do you prefer listening to a lecture or explanation?",
  "Do you prefer to try it out yourself immediately?",
  "When you give directions, do you draw a map?",
  "When you give directions, do you explain it in words?",
  "When you give directions, do you point and gesture?"
];

const Quiz: React.FC<QuizProps> = ({ user, onComplete, onCancel }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, `Q: ${questions[currentQuestion]} A: ${answer}`];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Finish
      setIsAnalyzing(true);
      const result = await analyzeQuiz(newAnswers);
      setIsAnalyzing(false);
      onComplete(result);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-pulse">
        <div className="w-20 h-20 bg-neon-purple rounded-full blur-xl mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Analyzing your brain...</h2>
        <p className="text-slate-400">The AI is determining your optimal learning path.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 pt-10">
      <div className="flex items-center mb-8">
        <button onClick={onCancel} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
          <ArrowLeft size={20} />
        </button>
        <h2 className="ml-4 text-xl font-bold">Learning Style Test</h2>
      </div>

      <div className="w-full bg-space-800 h-2 rounded-full mb-8">
        <div 
            className="bg-neon-cyan h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-2xl font-bold mb-8 leading-relaxed">
            {questions[currentQuestion]}
        </h3>

        <div className="space-y-4">
            <button 
                onClick={() => handleAnswer("Yes, definitely")}
                className="w-full p-4 rounded-xl bg-space-800 border border-white/10 hover:border-neon-cyan hover:bg-space-700 transition-all text-left flex justify-between group"
            >
                <span>Yes, definitely</span>
                <CheckCircle className="opacity-0 group-hover:opacity-100 text-neon-cyan transition-opacity" />
            </button>
            <button 
                onClick={() => handleAnswer("Sometimes")}
                className="w-full p-4 rounded-xl bg-space-800 border border-white/10 hover:border-neon-blue hover:bg-space-700 transition-all text-left flex justify-between group"
            >
                <span>Sometimes</span>
                <CheckCircle className="opacity-0 group-hover:opacity-100 text-neon-blue transition-opacity" />
            </button>
            <button 
                onClick={() => handleAnswer("Rarely")}
                className="w-full p-4 rounded-xl bg-space-800 border border-white/10 hover:border-purple-500 hover:bg-space-700 transition-all text-left flex justify-between group"
            >
                <span>Rarely</span>
                <CheckCircle className="opacity-0 group-hover:opacity-100 text-purple-500 transition-opacity" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
