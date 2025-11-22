
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
import { Screen, User, LearningStyle, Achievement, Task, Post, BeforeInstallPromptEvent } from './types';

const MOCK_ACHIEVEMENTS: Achievement[] = [
    { id: '1', title: 'Nova Novice', description: 'Created your account', icon: '🚀', unlocked: true },
    { id: '2', title: 'Style Seeker', description: 'Completed learning style test', icon: '🧠', unlocked: true },
    { id: '3', title: 'Focus Master', description: 'Complete a Pomodoro session', icon: '⏱️', unlocked: false },
    { id: '4', title: 'Social Star', description: 'Make your first community post', icon: '🌟', unlocked: false },
    { id: '5', title: 'Task Titan', description: 'Complete 3 study tasks', icon: '✅', unlocked: false },
    { id: '6', title: 'Streak Week', description: '7 day login streak', icon: '🔥', unlocked: false },
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Big Data Algorithms', time: '8:00 - 9:00am', duration: 1, completed: false, subject: 'Computer Science', color: 'from-cyan-500 to-blue-600' },
  { id: '2', title: 'Physics II Mechanics', time: '10:00 - 11:30am', duration: 1.5, completed: false, subject: 'Physics', color: 'from-purple-500 to-pink-600' },
  { id: '3', title: 'Data Structure Quiz', time: '12:45pm', duration: 0.5, completed: false, subject: 'CS', color: 'from-green-500 to-emerald-600' },
  { id: '4', title: 'World History Essay', time: '2:00 - 3:00pm', duration: 1, completed: false, subject: 'History', color: 'from-orange-500 to-red-500' },
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
  },
  {
    id: '3',
    author: 'Alex R.',
    avatar: 'https://picsum.photos/203',
    content: 'Does anyone have good mnemonic devices for the periodic table? My Auditory learning brain is struggling.',
    likes: 45,
    comments: 15,
    tag: 'Chemistry',
    timestamp: '6h ago'
  }
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [notification, setNotification] = useState<string | null>(null);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

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

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
  };

  // Load data from local storage
  useEffect(() => {
    const loadData = () => {
        try {
            const savedUser = localStorage.getItem('nova_user');
            const savedTasks = localStorage.getItem('nova_tasks');
            const savedPosts = localStorage.getItem('nova_posts');

            if (savedUser) setUser(JSON.parse(savedUser));
            if (savedTasks) setTasks(JSON.parse(savedTasks));
            if (savedPosts) setPosts(JSON.parse(savedPosts));
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoaded(true);
        }
    };
    loadData();
  }, []);

  // Save data on change
  useEffect(() => {
      if (!isLoaded) return;
      if (user) localStorage.setItem('nova_user', JSON.stringify(user));
      localStorage.setItem('nova_tasks', JSON.stringify(tasks));
      localStorage.setItem('nova_posts', JSON.stringify(posts));
  }, [user, tasks, posts, isLoaded]);

  // --- Actions ---

  const showNotification = (msg: string) => {
    if (doNotDisturb) return; // Respect DND
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (loggedInUser: User) => {
    // Check if we already have a saved user with this email to avoid overwriting progress with mock
    if (user && user.email === loggedInUser.email) {
        setScreen(Screen.DASHBOARD);
        return;
    }

    const fullUser: User = {
        ...loggedInUser,
        points: 1250,
        level: 3,
        achievements: MOCK_ACHIEVEMENTS
    };
    setUser(fullUser);
    if (fullUser.learningStyle === LearningStyle.UNDEFINED) {
        setScreen(Screen.QUIZ);
    } else {
        setScreen(Screen.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setScreen(Screen.AUTH);
    localStorage.removeItem('nova_user'); 
  };

  const handleQuizComplete = (style: LearningStyle) => {
    if (user) {
        const updatedUser = { ...user, learningStyle: style };
        // Unlock achievement if not already
        unlockAchievement(updatedUser, '2'); 
    }
    setScreen(Screen.DASHBOARD);
  };

  const addXP = (amount: number, reason: string) => {
    if (!user) return;
    const newPoints = user.points + amount;
    // Level up logic (every 1000 points)
    const newLevel = Math.floor(newPoints / 1000) + 1;
    
    if (newLevel > user.level) {
        showNotification(`🎉 Level Up! You are now Level ${newLevel}!`);
    } else {
        showNotification(`+${amount} XP: ${reason}`);
    }

    setUser(prev => prev ? { ...prev, points: newPoints, level: newLevel } : null);
  };

  const unlockAchievement = (currentUser: User, achievementId: string) => {
     const exists = currentUser.achievements.find(a => a.id === achievementId);
     if (exists && !exists.unlocked) {
         const updatedAchievements = currentUser.achievements.map(a => 
            a.id === achievementId ? { ...a, unlocked: true } : a
         );
         setUser({ ...currentUser, achievements: updatedAchievements });
         showNotification(`🏆 Achievement Unlocked: ${exists.title}!`);
         addXP(100, 'Achievement Unlocked');
     } else {
         setUser(currentUser);
     }
  };

  const handleToggleTask = (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !user) return;

      const isCompleting = !task.completed;
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: isCompleting } : t));

      if (isCompleting) {
          addXP(50, 'Task Completed');
          const completedCount = tasks.filter(t => t.completed).length + 1;
          if (completedCount >= 3) {
              unlockAchievement(user, '5');
          }
      }
  };

  const handleAddTask = (newTask: Task) => {
      setTasks([...tasks, newTask]);
      showNotification("Task Added to Plan");
  };

  const handleDeleteTask = (taskId: string) => {
      setTasks(tasks.filter(t => t.id !== taskId));
  }

  const handleAddPost = (content: string, tag: string) => {
      if (!user) return;
      const newPost: Post = {
          id: Date.now().toString(),
          author: user.name,
          avatar: 'https://picsum.photos/200', // User avatar
          content,
          likes: 0,
          comments: 0,
          tag,
          timestamp: 'Just now',
          isUserPost: true
      };
      setPosts([newPost, ...posts]);
      addXP(30, 'Community Post Created');
      unlockAchievement(user, '4');
  };

  const handlePomodoroComplete = () => {
      if (user) {
          addXP(100, 'Pomodoro Session Finished');
          unlockAchievement(user, '3');
      }
  };

  const renderScreen = () => {
    switch (screen) {
      case Screen.AUTH:
        return <Auth onLogin={handleLogin} />;
      case Screen.DASHBOARD:
        return user ? (
            <Dashboard 
                user={user} 
                tasks={tasks} 
                setScreen={setScreen} 
                onPomodoroComplete={handlePomodoroComplete}
                doNotDisturb={doNotDisturb}
                setDoNotDisturb={setDoNotDisturb}
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
        return user ? <Community user={user} posts={posts} onAddPost={handleAddPost} /> : null;
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
            />
        ) : null;
      default:
        return <Auth onLogin={handleLogin} />;
    }
  };

  return (
    <Layout currentScreen={screen} setScreen={setScreen}>
      {renderScreen()}
      
      {/* Global Notification Toast */}
      {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-float">
              <div className="bg-space-800/90 backdrop-blur-md border border-neon-cyan/50 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-3">
                  <span className="text-xl">✨</span>
                  <span className="font-medium">{notification}</span>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default App;
