
import React, { useState, useEffect } from 'react';
import { Deck, Flashcard, User } from '../types';
import { generateFlashcards } from '../services/geminiService';
import { Plus, Play, Brain, X, Sparkles, RotateCw, CheckCircle, Trash2, ArrowLeft, ChevronRight } from 'lucide-react';

interface FlashcardsProps {
  user: User;
  decks: Deck[];
  onUpdateDecks: (decks: Deck[]) => void;
  onAddXP: (amount: number, reason: string) => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ user, decks, onUpdateDecks, onAddXP }) => {
  const [view, setView] = useState<'list' | 'study'>('list');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  
  // Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Study State
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const handleCreateDeck = async (useAI: boolean) => {
      if (!newDeckTitle) return;

      const newDeck: Deck = {
          id: Date.now().toString(),
          title: newDeckTitle,
          subject: newDeckSubject || 'General',
          cards: []
      };

      if (useAI && aiInput) {
          setIsGenerating(true);
          const cards = await generateFlashcards(aiInput, 5, user.apiKey);
          newDeck.cards = cards.map((c, i) => ({
              id: `${Date.now()}-${i}`,
              front: c.front,
              back: c.back,
              nextReview: Date.now(),
              interval: 0,
              easeFactor: 2.5,
              status: 'new'
          }));
          setIsGenerating(false);
      }

      onUpdateDecks([...decks, newDeck]);
      setShowCreateModal(false);
      setNewDeckTitle('');
      setNewDeckSubject('');
      setAiInput('');
  };

  const handleDeleteDeck = (id: string) => {
      if (confirm("Delete this deck?")) {
          onUpdateDecks(decks.filter(d => d.id !== id));
      }
  };

  const startStudy = (deckId: string) => {
      const deck = decks.find(d => d.id === deckId);
      if (!deck) return;

      const now = Date.now();
      const dueCards = deck.cards.filter(c => c.nextReview <= now);

      if (dueCards.length === 0) {
          alert("No cards due for review right now! Good job!");
          return;
      }

      setActiveDeckId(deckId);
      setStudyQueue(dueCards);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setSessionComplete(false);
      setView('study');
  };

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
      if (!activeDeckId) return;
      
      const currentCard = studyQueue[currentCardIndex];
      const now = Date.now();
      
      // Simple SM-2 inspired logic
      let interval = currentCard.interval;
      let ease = currentCard.easeFactor;
      let nextReview = now;

      if (rating === 'again') {
          interval = 0; // < 1 day (reset)
          nextReview = now + 60 * 1000; // 1 min
      } else if (rating === 'hard') {
          interval = Math.max(1, interval * 1.2);
          ease = Math.max(1.3, ease - 0.15);
          nextReview = now + interval * 24 * 60 * 60 * 1000;
      } else if (rating === 'good') {
          interval = Math.max(1, interval * ease);
          nextReview = now + interval * 24 * 60 * 60 * 1000;
      } else if (rating === 'easy') {
          interval = Math.max(1, interval * ease * 1.3);
          ease += 0.15;
          nextReview = now + interval * 24 * 60 * 60 * 1000;
      }

      const updatedCard: Flashcard = {
          ...currentCard,
          interval,
          easeFactor: ease,
          nextReview,
          status: rating === 'again' ? 'learning' : 'review'
      };

      // Update Decks State
      const updatedDecks = decks.map(d => {
          if (d.id === activeDeckId) {
              return {
                  ...d,
                  cards: d.cards.map(c => c.id === currentCard.id ? updatedCard : c),
                  lastStudied: now
              };
          }
          return d;
      });

      onUpdateDecks(updatedDecks);
      setIsFlipped(false);

      if (currentCardIndex < studyQueue.length - 1) {
          setCurrentCardIndex(prev => prev + 1);
      } else {
          setSessionComplete(true);
          onAddXP(50, "Deck Review Completed");
      }
  };

  if (view === 'study') {
      return (
          <div className="h-full flex flex-col p-6 safe-area-top">
              {/* Study Header */}
              <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setView('list')} className="p-2 bg-white/10 rounded-full">
                      <ArrowLeft size={20} />
                  </button>
                  <span className="font-bold text-slate-300">
                      {currentCardIndex + 1} / {studyQueue.length}
                  </span>
                  <div className="w-10"></div>
              </div>

              {sessionComplete ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center animate-slideUp">
                      <div className="w-24 h-24 bg-neon-cyan/20 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle size={48} className="text-neon-cyan" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
                      <p className="text-slate-400 mb-8">You've reviewed {studyQueue.length} cards.</p>
                      <button 
                        onClick={() => setView('list')}
                        className="bg-neon-blue px-8 py-3 rounded-xl font-bold text-white hover:scale-105 transition-transform"
                      >
                          Back to Decks
                      </button>
                  </div>
              ) : (
                  <div className="flex-1 flex flex-col relative perspective-1000 min-h-0">
                      {/* Card Container */}
                      <div 
                        className="flex-1 relative cursor-pointer group mb-8"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                          <div className={`absolute inset-0 w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                              {/* Front */}
                              <div className="absolute inset-0 w-full h-full bg-space-800 border border-white/10 rounded-3xl flex flex-col shadow-2xl backface-hidden overflow-hidden">
                                  {/* Header */}
                                  <div className="p-6 pb-2 shrink-0">
                                      <span className="text-xs font-bold text-neon-cyan uppercase tracking-widest">Question</span>
                                  </div>
                                  
                                  {/* Content - Flexible & Scrollable */}
                                  <div className="flex-1 w-full overflow-y-auto no-scrollbar px-6 flex items-center justify-center">
                                      <p className="text-lg md:text-xl font-bold leading-relaxed text-center break-words whitespace-pre-wrap">
                                          {studyQueue[currentCardIndex].front}
                                      </p>
                                  </div>

                                  {/* Footer */}
                                  <div className="p-6 pt-2 text-center shrink-0">
                                      <p className="text-slate-500 text-sm animate-pulse">Tap to flip</p>
                                  </div>
                              </div>

                              {/* Back */}
                              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 to-space-800 border border-neon-purple/30 rounded-3xl flex flex-col shadow-2xl backface-hidden rotate-y-180 overflow-hidden">
                                  {/* Header */}
                                  <div className="p-6 pb-2 shrink-0">
                                      <span className="text-xs font-bold text-neon-purple uppercase tracking-widest">Answer</span>
                                  </div>
                                  
                                  {/* Content - Flexible & Scrollable */}
                                  <div className="flex-1 w-full overflow-y-auto no-scrollbar px-6 flex items-center justify-center">
                                      <p className="text-base md:text-lg leading-relaxed text-slate-100 text-center break-words whitespace-pre-wrap">
                                          {studyQueue[currentCardIndex].back}
                                      </p>
                                  </div>

                                  {/* Footer Placeholder for visual balance */}
                                  <div className="p-6 pt-2 text-center shrink-0 opacity-0">
                                      <p className="text-sm">Answer</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Controls */}
                      <div className={`grid grid-cols-4 gap-3 transition-opacity duration-300 h-20 shrink-0 ${isFlipped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                          <button onClick={() => handleRating('again')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 active:scale-95">
                              <span className="text-xs font-bold">Again</span>
                              <span className="text-[10px] opacity-60">1m</span>
                          </button>
                          <button onClick={() => handleRating('hard')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 active:scale-95">
                              <span className="text-xs font-bold">Hard</span>
                              <span className="text-[10px] opacity-60">2d</span>
                          </button>
                          <button onClick={() => handleRating('good')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 active:scale-95">
                              <span className="text-xs font-bold">Good</span>
                              <span className="text-[10px] opacity-60">4d</span>
                          </button>
                          <button onClick={() => handleRating('easy')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 active:scale-95">
                              <span className="text-xs font-bold">Easy</span>
                              <span className="text-[10px] opacity-60">7d</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="p-6 pt-10 pb-24 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold">Flashcards</h2>
            <p className="text-slate-400 text-sm">Spaced Repetition System</p>
        </div>
        <button 
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-lg hover:scale-105 transition-transform"
        >
            <Plus size={24} className="text-white" />
        </button>
      </div>

      {/* Decks List */}
      <div className="grid gap-4">
          {decks.length === 0 && (
              <div className="text-center py-10 opacity-50">
                  <Brain size={48} className="mx-auto mb-4 text-slate-500" />
                  <p>No decks yet. Create one to start studying!</p>
              </div>
          )}

          {decks.map((deck) => {
              const dueCount = deck.cards.filter(c => c.nextReview <= Date.now()).length;
              return (
                  <div key={deck.id} className="bg-space-800 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-neon-cyan/30 transition-colors">
                      <div className="flex-1">
                          <h3 className="font-bold text-lg text-white mb-1">{deck.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="bg-white/5 px-2 py-0.5 rounded">{deck.subject}</span>
                              <span>{deck.cards.length} Cards</span>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {dueCount > 0 ? (
                            <button 
                                onClick={() => startStudy(deck.id)}
                                className="px-4 py-2 bg-neon-cyan text-black font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-cyan-300 transition-colors"
                            >
                                <Play size={14} fill="black" />
                                Study ({dueCount})
                            </button>
                        ) : (
                            <div className="flex items-center gap-1 text-green-400 text-sm px-3 py-2 bg-green-400/10 rounded-xl">
                                <CheckCircle size={14} /> Done
                            </div>
                        )}
                        <button onClick={() => handleDeleteDeck(deck.id)} className="p-2 text-slate-600 hover:text-red-400">
                            <Trash2 size={18} />
                        </button>
                      </div>
                  </div>
              );
          })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="bg-space-800 border border-white/10 w-full max-w-md rounded-3xl p-6 relative animate-slideUp">
                <button 
                    onClick={() => setShowCreateModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X size={24} />
                </button>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="text-neon-purple" size={20} />
                    Create New Deck
                </h3>
                
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={newDeckTitle}
                        onChange={e => setNewDeckTitle(e.target.value)}
                        placeholder="Deck Title (e.g. Physics Ch.1)"
                        className="w-full bg-space-700 border border-white/10 rounded-xl p-3 focus:border-neon-cyan focus:outline-none text-white"
                    />
                    <input 
                        type="text" 
                        value={newDeckSubject}
                        onChange={e => setNewDeckSubject(e.target.value)}
                        placeholder="Subject (Optional)"
                        className="w-full bg-space-700 border border-white/10 rounded-xl p-3 focus:border-neon-cyan focus:outline-none text-white"
                    />
                    
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs font-bold text-neon-cyan mb-2 uppercase tracking-wider">AI Auto-Generate</p>
                        <textarea 
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            placeholder="Paste your notes here, and Nova will create flashcards automatically..."
                            className="w-full h-24 bg-space-900 border border-white/10 rounded-xl p-3 text-sm text-slate-300 focus:border-neon-cyan focus:outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={() => handleCreateDeck(false)}
                            disabled={!newDeckTitle}
                            className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium"
                        >
                            Create Empty
                        </button>
                        <button 
                            onClick={() => handleCreateDeck(true)}
                            disabled={!newDeckTitle || !aiInput || isGenerating}
                            className="flex-1 bg-neon-purple text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <RotateCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            Generate with AI
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

export default Flashcards;
