// src/constants/index.js
// App-wide constants and configuration

export const APP_CONFIG = {
  name: 'AssignMint',
  version: '1.0.0',
  description: 'Assignment Help Marketplace',
  supportEmail: 'support@assignmint.com',
  websiteUrl: 'https://assignmint.com',
};

export const COLORS = {
  // Primary Colors
  primary: '#2e7d32',
  primaryLight: '#66bb6a',
  primaryDark: '#1b5e20',
  
  // Secondary Colors
  secondary: '#ff9800',
  secondaryLight: '#ffb74d',
  secondaryDark: '#f57c00',
  
  // Status Colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Subject Colors
  subjects: {
    math: '#3f51b5',
    coding: '#00796b',
    writing: '#d84315',
    design: '#6a1b9a',
    language: '#00838f',
    chemistry: '#f57f17',
    physics: '#1976d2',
    business: '#388e3c',
    psychology: '#7b1fa2',
    statistics: '#c62828',
    science: '#1976d2',
    biology: '#689f38',
    history: '#5d4037',
    engineering: '#455a64',
    art: '#e91e63'
  },
  
  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Background Colors
  background: '#f4f5f9',
  cardBackground: '#ffffff',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
};

export const FONTS = {
  // Font Sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    title: 28,
    heading: 32,
  },
  
  // Font Weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const TASK_STATUSES = {
  // Requester Statuses
  AWAITING_EXPERT: 'awaiting_expert',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  
  // Expert Statuses
  WORKING: 'working',
  DELIVERED: 'delivered',
  PAYMENT_RECEIVED: 'payment_received',
  REVISION_REQUESTED: 'revision_requested',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUSES.AWAITING_EXPERT]: '👀 Finding Expert',
  [TASK_STATUSES.IN_PROGRESS]: '🔄 In Progress',
  [TASK_STATUSES.PENDING_REVIEW]: '⏳ Pending Review',
  [TASK_STATUSES.COMPLETED]: '✅ Completed',
  [TASK_STATUSES.CANCELLED]: '❌ Cancelled',
  [TASK_STATUSES.DISPUTED]: '⚠️ Disputed',
  [TASK_STATUSES.WORKING]: '🔨 Working',
  [TASK_STATUSES.DELIVERED]: '📤 Delivered',
  [TASK_STATUSES.PAYMENT_RECEIVED]: '💰 Payment Received',
  [TASK_STATUSES.REVISION_REQUESTED]: '🔄 Revision Requested',
};

export const URGENCY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const URGENCY_LABELS = {
  [URGENCY_LEVELS.HIGH]: '🔥 High Priority',
  [URGENCY_LEVELS.MEDIUM]: '⚡ Medium Priority', 
  [URGENCY_LEVELS.LOW]: '🌱 Low Priority',
};

export const SUBJECTS = [
  { id: 'math', label: '📊 Math', value: 'Math', description: 'Algebra, Calculus, Statistics, Geometry' },
  { id: 'coding', label: '💻 Coding', value: 'Coding', description: 'Programming, Web Dev, Mobile Apps' },
  { id: 'writing', label: '✍️ Writing', value: 'Writing', description: 'Essays, Reports, Creative Writing' },
  { id: 'design', label: '🎨 Design', value: 'Design', description: 'Graphics, UI/UX, Logos, Branding' },
  { id: 'language', label: '🌍 Language', value: 'Language', description: 'Translation, Grammar, Literature' },
  { id: 'science', label: '🔬 Science', value: 'Science', description: 'Biology, Chemistry, Physics, Labs' },
  { id: 'business', label: '💼 Business', value: 'Business', description: 'Marketing, Finance, Strategy, Plans' },
  { id: 'engineering', label: '⚙️ Engineering', value: 'Engineering', description: 'Mechanical, Electrical, Civil, Software' },
  { id: 'psychology', label: '🧠 Psychology', value: 'Psychology', description: 'Research, Analysis, Case Studies' },
  { id: 'history', label: '🏛️ History', value: 'History', description: 'Research, Essays, Timeline Analysis' },
  { id: 'statistics', label: '📈 Statistics', value: 'Statistics', description: 'Data Analysis, Probability, Modeling' },
  { id: 'chemistry', label: '🧪 Chemistry', value: 'Chemistry', description: 'Organic, Inorganic, Lab Reports' },
  { id: 'physics', label: '⚛️ Physics', value: 'Physics', description: 'Mechanics, Thermodynamics, Quantum' },
  { id: 'biology', label: '🧬 Biology', value: 'Biology', description: 'Genetics, Ecology, Anatomy' },
  { id: 'art', label: '🎭 Art', value: 'Art', description: 'Visual Arts, History, Critique' },
  { id: 'other', label: '📋 Other', value: 'Other', description: 'Something else not listed above' },
];

export const AI_LEVELS = {
  NONE: 'none',
  PARTIAL: 'partial',
  FULL: 'full',
};

export const AI_LEVEL_LABELS = {
  [AI_LEVELS.NONE]: 'No AI (Human only)',
  [AI_LEVELS.PARTIAL]: 'Partial AI',
  [AI_LEVELS.FULL]: 'Full AI (100%)',
};

export const MATCHING_TYPES = {
  AUTO: 'auto',
  MANUAL: 'manual',
};

export const MATCHING_TYPE_LABELS = {
  [MATCHING_TYPES.AUTO]: 'Auto-match ⚡',
  [MATCHING_TYPES.MANUAL]: 'Manual Review 👀',
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal', 
  BANK: 'bank',
};

export const FILE_TYPES = {
  PDF: 'pdf',
  DOC: 'document',
  DOCX: 'document',
  TXT: 'text',
  IMAGE: 'image',
  JPG: 'image',
  PNG: 'image',
  EXCEL: 'excel',
  XLSX: 'excel',
  CSV: 'csv',
  ZIP: 'archive',
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
  HTML: 'html',
  CSS: 'css',
};

export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 25 * 1024 * 1024, // 25MB
  ARCHIVE: 50 * 1024 * 1024, // 50MB
};

export const VALIDATION_RULES = {
  TASK_TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
  },
  TASK_DESCRIPTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 1000,
  },
  TASK_PRICE: {
    MIN: 5,
    MAX: 1000,
  },
  NICKNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 30,
  },
  BIO: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 120,
  },
  SPECIAL_INSTRUCTIONS: {
    MAX_LENGTH: 500,
  },
};

export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  PROFILE: '/api/profile',
  WALLET: '/api/wallet',
  NOTIFICATIONS: '/api/notifications',
  UPLOAD: '/api/upload',
  PAYMENTS: '/api/payments',
};

export const SCREEN_NAMES = {
  HOME: 'Home',
  POST_TASK: 'PostTask',
  MY_TASKS: 'MyTasks',
  NOTIFICATIONS: 'Notifications',
  PROFILE: 'Profile',
  WALLET: 'Wallet',
  TASK_DETAILS: 'TaskDetails',
  TASK_ACTION: 'TaskAction',
};

export const NOTIFICATION_TYPES = {
  TASK_UPDATE: 'task_update',
  PAYMENT: 'payment',
  MESSAGE: 'message',
  SYSTEM: 'system',
};

export const EXPERT_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  MASTER: 'master',
};

export const EXPERT_LEVEL_THRESHOLDS = {
  [EXPERT_LEVELS.BEGINNER]: 0,
  [EXPERT_LEVELS.INTERMEDIATE]: 5,
  [EXPERT_LEVELS.ADVANCED]: 10,
  [EXPERT_LEVELS.EXPERT]: 25,
  [EXPERT_LEVELS.MASTER]: 50,
};

export const EXPERT_LEVEL_LABELS = {
  [EXPERT_LEVELS.BEGINNER]: { text: 'New Expert', color: '#4caf50', icon: '🌱' },
  [EXPERT_LEVELS.INTERMEDIATE]: { text: 'Rising Star', color: '#2196f3', icon: '⭐' },
  [EXPERT_LEVELS.ADVANCED]: { text: 'Experienced', color: '#ff9800', icon: '🏅' },
  [EXPERT_LEVELS.EXPERT]: { text: 'Expert Pro', color: '#9c27b0', icon: '👑' },
  [EXPERT_LEVELS.MASTER]: { text: 'Master Expert', color: '#f44336', icon: '🔥' },
};

export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  SEARCH_DEBOUNCE: 300, // 300ms
  REFRESH_DEBOUNCE: 1000, // 1 second
};

export const ANALYTICS_EVENTS = {
  TASK_POSTED: 'task_posted',
  TASK_COMPLETED: 'task_completed',
  EXPERT_HIRED: 'expert_hired',
  PAYMENT_MADE: 'payment_made',
  PROFILE_UPDATED: 'profile_updated',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  TASK_NOT_FOUND: 'Task not found or has been removed.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

export const SUCCESS_MESSAGES = {
  TASK_POSTED: 'Task posted successfully! 🎉',
  TASK_COMPLETED: 'Task completed successfully! ✅',
  PROFILE_UPDATED: 'Profile updated successfully! ✨',
  PAYMENT_PROCESSED: 'Payment processed successfully! 💰',
};

// Development/Debug flags
export const DEBUG = {
  ENABLED: __DEV__,
  LOG_API_CALLS: __DEV__,
  SHOW_PERFORMANCE_METRICS: __DEV__,
  MOCK_DELAYS: __DEV__,
};