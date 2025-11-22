
export enum Screen {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  STUDY_PLAN = 'STUDY_PLAN',
  QUIZ = 'QUIZ',
  CHAT = 'CHAT',
  PROGRESS = 'PROGRESS',
  SETTINGS = 'SETTINGS',
  COMMUNITY = 'COMMUNITY',
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
  icon: string; // Emoji or icon name
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

// PWA Install Event Type
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
