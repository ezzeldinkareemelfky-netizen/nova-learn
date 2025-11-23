
export enum Screen {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  STUDY_PLAN = 'STUDY_PLAN',
  QUIZ = 'QUIZ', // Learning Style Quiz
  CHAT = 'CHAT',
  PROGRESS = 'PROGRESS',
  SETTINGS = 'SETTINGS',
  COMMUNITY = 'COMMUNITY',
  FLASHCARDS = 'FLASHCARDS',
  EXAM_GENERATOR = 'EXAM_GENERATOR',
}

export enum LearningStyle {
  UNDEFINED = 'UNDEFINED',
  VISUAL = 'Visual',
  AUDITORY = 'Auditory',
  KINESTHETIC = 'Kinesthetic',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface User {
  name: string;
  email: string;
  learningStyle: LearningStyle;
  streak: number;
  points: number;
  level: number;
  achievements: Achievement[];
  apiKey?: string; // Custom Gemini API Key
  avatar?: string; // Custom Profile Picture URL
  language?: 'en' | 'ar'; // Language preference
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  tag: string;
  timestamp: string;
  isUserPost?: boolean;
}

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format for real scheduling
  time: string; 
  duration: number; // In hours
  completed: boolean;
  subject: string;
  color: string; 
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

// Flashcard System Types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  nextReview: number; // Timestamp
  interval: number; // Days
  easeFactor: number;
  status: 'new' | 'learning' | 'review';
}

export interface Deck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  lastStudied?: number;
}

// Exam System Types
export interface Question {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

// PWA Install Event Type
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
