import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import Quiz from './views/Quiz';
import StudyPlan from './views/StudyPlan';
import Chat from './views/Chat';
import Progress from './views/Progress';
import Settings from './views/Settings';
import Community from './views/Community';
import Flashcards from './views/Flashcards';
import ExamGenerator from './views/ExamGenerator';
import { Screen, User, LearningStyle, Achievement, Task, Post, BeforeInstallPromptEvent, Deck } from './types';
import { getDirection, Language } from './utils/translations';

// Helper to safely parse JSON without crashing
const safeJSONParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    // Handle 'undefined' string which sometimes gets saved erroneously
    if (item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    return parsed === null ? fallback : parsed;
  } catch (e) {
    console.warn(`Failed to parse ${key}, resetting to default.`);
    return fallback;
  }
};

// Generate initial tasks for "Today" so new users see something
const today = new Date().toISOString().split('T')[0];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Big Data Algorithms', date: today, time: '8:00 - 9:00am', duration: 1, completed: false, subject: 'Computer Science', color: 'from-cyan-500 to-blue-600' },
  { id: '2', title: 'Physics II Mechanics', date: today, time: '10:00 - 11:30am', duration: 1.5, completed: false, subject: 'Physics', color: 'from-purple-500 to-pink-600' },
  { id: '3', title: 'Data Structure Quiz', date: today, time: '12:45pm', duration: 0.5, completed: false, subject: 'CS', color: 'from-green-500 to-emerald-600' },
];

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Sarah J.',
    avatar: 'https://picsum.photos/201',
    content: 'Just found this amazing visualization for Quantum Mechanics! If you are a Visual learner like me, you have to check out the 3D models on Quanta.',
    likes: 24,
    comments: 5,
    tag: 'Physics',
    timestamp: '2h ago'
  },
  {
    id: '2',
    author: 'Mike Chen',
    avatar: 'https://picsum.photos/202',
    content: 'Looking for a study buddy for the Big Data algorithms quiz next week. Anyone free for a Pomodoro session tonight?',
    likes: 12,
    comments: 8,
    tag: 'Study Group',
    timestamp: '4h ago'
  }
];

// Fallback achievements for migration
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    { id: '1', title: 'Nova Novice', description: 'Created your account', icon: '🚀', unlocked: true },
    { id: '2', title: 'Style Seeker', description: 'Completed learning style test', icon: '🧠', unlocked: false },
    { id: '3', title: 'Focus Master', description: 'Complete a Pomodoro session', icon: '⏱️', unlocked: false },
    { id: '4', title: 'Social Star', description: 'Make your first community post', icon: '🌟', unlocked: false },
    { id: '5', title: 'Task Titan', description: 'Complete 3 study tasks', icon: '✅', unlocked: false },
    { id: '6', title: 'Streak Week', description: '7 day login streak', icon: '🔥', unlocked: false },
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Language State
  const [lang, setLang] = useState<Language>('en');

  // Handle Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle Direction Change
  useEffect(() => {
      const dir = getDirection(lang);
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
  }, [lang]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
  };

  // --- DATA PERSISTENCE LOGIC ---

  // 1. Check for active session on startup
  useEffect(() => {
      try {
        const sessionEmail = localStorage.getItem('nova_active_session');
        if (sessionEmail) {
            const usersDb = safeJSONParse('nova_users_db', {});
            const savedUserWrapper = usersDb[sessionEmail];
            
            if (savedUserWrapper && savedUserWrapper.user) {
                // MIGRATION: Ensure achievements exist
                const restoredUser = savedUserWrapper.user;
                if (!restoredUser.achievements) {
                    restoredUser.achievements = DEFAULT_ACHIEVEMENTS;
                }

                setUser(restoredUser);
                setLang(restoredUser.language || 'en'); // Load saved language
                loadUserData(sessionEmail);
                if (restoredUser.learningStyle === LearningStyle.UNDEFINED) {
                    setScreen(Screen.QUIZ);
                } else {
                    setScreen(Screen.DASHBOARD);
                }
            } else {
                // Invalid session, clear it
                localStorage.removeItem('nova_active_session');
                setScreen(Screen.AUTH);
            }
        } else {
            setScreen(Screen.AUTH);
        }
      } catch (e) {
          console.error("Critical error restoring session:", e);
          setScreen(Screen.AUTH);
      }
  }, []);

  // 2. Helper to load specific user data
  const loadUserData = (email: string) => {
      try {
          const savedTasks = safeJSONParse(`nova_tasks_${email}`, null);
          const savedPosts = safeJSONParse(`nova_posts_${email}`, null); 
          const savedDecks = safeJSONParse(`nova_decks_${email}`, null);

          if (Array.isArray(savedTasks)) {
              setTasks(savedTasks);
          } else {
              setTasks(INITIAL_TASKS); 
          }
          
          if (Array.isArray(savedPosts)) setPosts(savedPosts);
          else setPosts(INITIAL_POSTS);

          if (Array.isArray(savedDecks)) setDecks(savedDecks);
          else setDecks([]);

      } catch (e) {
          console.error("Failed to load user data", e);
          // Fallbacks
          setTasks(INITIAL_TASKS);
          setPosts(INITIAL_POSTS);
          setDecks([]);
      }
  };

  // 3. Save User Data on Change (Only if user is logged in)
  useEffect(() => {
      if (user) {
          try {
            // Update the main user record in the DB
            const usersDb = safeJSONParse('nova_users_db', {});
            if (usersDb[user.email]) {
                usersDb[user.email].user = user; 
                localStorage.setItem('nova_users_db', JSON.stringify(usersDb));
            }

            // Save specific user data
            localStorage.setItem(`nova_tasks_${user.email}`, JSON.stringify(tasks));
            localStorage.setItem(`nova_posts_${user.email}`, JSON.stringify(posts));
            localStorage.setItem(`nova_decks_${user.email}`, JSON.stringify(decks));
          } catch (e) {
              console.error("Failed to save data", e);
          }
      }
  }, [user, tasks, posts, decks]);


  // --- Actions ---

  const showNotification = (msg: string) => {
    if (doNotDisturb) return;
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (loggedInUser: User) => {
    // Ensure achievements exist (migration for old users)
    if (!loggedInUser.achievements) {
        loggedInUser.achievements = DEFAULT_ACHIEVEMENTS;
    }

    setUser(loggedInUser);
    setLang(loggedInUser.language || 'en'); // Set language on login
    localStorage.setItem('nova_active_session', loggedInUser.email);
    loadUserData(loggedInUser.email);
    
    if (loggedInUser.learningStyle === LearningStyle.UNDEFINED) {
        setScreen(Screen.QUIZ);
    } else {
        setScreen(Screen.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setScreen(Screen.AUTH);
    localStorage.removeItem('nova_active_session');
    setLang('en'); // Reset to English on logout
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
      // If language changed
      if (updatedUser.language && updatedUser.language !== lang) {
          setLang(updatedUser.language);
      }
      showNotification(updatedUser.language === 'ar' ? "تم تحديث الملف الشخصي" : "Profile Updated");
  }

  const handleQuizComplete = (style: LearningStyle) => {
    if (user) {
        const updatedUser = { ...user, learningStyle: style };
        setUser(updatedUser);
        unlockAchievement(updatedUser, '2'); 
    }
    setScreen(Screen.DASHBOARD);
  };

  const addXP = (amount: number, reason: string) => {
    if (!user) return;
    const newPoints = user.points + amount;
    const newLevel = Math.floor(newPoints / 1000) + 1;
    
    if (newLevel > user.level) {
        showNotification(lang === 'ar' ? `🎉 مستوى جديد! أنت الآن مستوى ${newLevel}!` : `🎉 Level Up! You are now Level ${newLevel}!`);
    } else {
        showNotification(`+${amount} XP: ${reason}`);
    }

    setUser(prev => prev ? { ...prev, points: newPoints, level: newLevel } : null);
  };

  const unlockAchievement = (currentUser: User, achievementId: string) => {
     if (!currentUser.achievements) return;
     
     const exists = currentUser.achievements.find(a => a.id === achievementId);
     if (exists && !exists.unlocked) {
         const updatedAchievements = currentUser.achievements.map(a => 
            a.id === achievementId ? { ...a, unlocked: true } : a
         );
         setUser({ ...currentUser, achievements: updatedAchievements });
         showNotification(lang === 'ar' ? `🏆 إنجاز جديد: ${exists.title}!` : `🏆 Achievement Unlocked: ${exists.title}!`);
         addXP(100, lang === 'ar' ? 'فتح إنجاز' : 'Achievement Unlocked');
     }
  };

  const handleToggleTask = (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !user) return;

      const isCompleting = !task.completed;
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: isCompleting } : t));

      if (isCompleting) {
          addXP(50, lang === 'ar' ? 'إتمام مهمة' : 'Task Completed');
          const completedCount = tasks.filter(t => t.completed).length + 1;
          if (completedCount >= 3) unlockAchievement(user, '5');
      }
  };

  const handleAddTask = (newTask: Task) => {
      setTasks([...tasks, newTask]);
      showNotification(lang === 'ar' ? "تمت إضافة المهمة" : "Task Added to Plan");
  };

  const handleDeleteTask = (taskId: string) => {
      setTasks(tasks.filter(t => t.id !== taskId));
  }

  const handleAddPost = (content: string, tag: string) => {
      if (!user) return;
      const newPost: Post = {
          id: Date.now().toString(),
          author: user.name,
          avatar: user.avatar || 'https://picsum.photos/200', 
          content,
          likes: 0,
          comments: 0,
          tag,
          timestamp: 'Just now',
          isUserPost: true
      };
      setPosts([newPost, ...posts]);
      addXP(30, lang === 'ar' ? 'نشر في المجتمع' : 'Community Post Created');
      unlockAchievement(user, '4');
  };

  const handlePomodoroComplete = () => {
      if (user) {
          addXP(100, lang === 'ar' ? 'جلسة بومودورو' : 'Pomodoro Session Finished');
          unlockAchievement(user, '3');
      }
  };

  const renderScreen = () => {
    switch (screen) {
      case Screen.AUTH:
        return <Auth onLogin={handleLogin} lang={lang} setLang={setLang} />;
      case Screen.DASHBOARD:
        return user ? (
            <Dashboard 
                user={user} 
                tasks={tasks} 
                setScreen={setScreen} 
                onPomodoroComplete={handlePomodoroComplete}
                doNotDisturb={doNotDisturb}
                setDoNotDisturb={setDoNotDisturb}
                lang={lang}
            />
        ) : null;
      case Screen.QUIZ:
        return user ? (
            <Quiz 
                user={user} 
                onComplete={handleQuizComplete} 
                onCancel={() => setScreen(Screen.DASHBOARD)} 
            />
        ) : null;
      case Screen.STUDY_PLAN:
        return <StudyPlan tasks={tasks} onToggleTask={handleToggleTask} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask} />;
      case Screen.CHAT:
        return user ? <Chat user={user} /> : null;
      case Screen.PROGRESS:
        return user ? <Progress user={user} tasks={tasks} /> : null;
      case Screen.COMMUNITY:
        return user ? <Community user={user} posts={posts} onAddPost={handleAddPost} lang={lang} /> : null;
      case Screen.FLASHCARDS:
        return user ? <Flashcards user={user} decks={decks} onUpdateDecks={setDecks} onAddXP={addXP} /> : null;
      case Screen.EXAM_GENERATOR:
        return user ? <ExamGenerator user={user} lang={lang} onAddXP={addXP} /> : null;
      case Screen.SETTINGS:
        return user ? (
            <Settings 
                user={user} 
                tasks={tasks}
                onLogout={handleLogout} 
                onRetakeQuiz={() => setScreen(Screen.QUIZ)} 
                onBack={() => setScreen(Screen.DASHBOARD)}
                doNotDisturb={doNotDisturb}
                setDoNotDisturb={setDoNotDisturb}
                installApp={deferredPrompt ? handleInstallApp : undefined}
                onUpdateUser={handleUpdateUser}
                lang={lang}
            />
        ) : null;
      default:
        return <Auth onLogin={handleLogin} lang={lang} setLang={setLang} />;
    }
  };

  return (
    <Layout currentScreen={screen} setScreen={setScreen} lang={lang}>
      {renderScreen()}
      
      {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-float w-11/12 max-w-md">
              <div className="bg-space-800/90 backdrop-blur-md border border-neon-cyan/50 text-white px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-3">
                  <span className="text-xl">✨</span>
                  <span className="font-medium">{notification}</span>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default App;