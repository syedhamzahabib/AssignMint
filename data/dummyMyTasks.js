// Dummy data for My Tasks screen
// This file contains sample tasks for both Requester and Expert roles

export const dummyRequesterTasks = [
  {
    id: 'req_1',
    title: 'Solve 10 Calculus Problems',
    dueDate: '2025-05-25',
    status: 'in_progress',
    expertName: 'Sarah Chen',
    subject: 'Math',
    price: '$20',
    postedDate: '2025-05-20',
    description: 'Need help with derivatives and integrals for my calculus homework.',
  },
  {
    id: 'req_2',
    title: 'Fix bugs in Python script',
    dueDate: '2025-05-22',
    status: 'pending_review',
    expertName: 'Alex Kumar',
    subject: 'Coding',
    price: '$30',
    postedDate: '2025-05-19',
    description: 'Python script has some logic errors that need debugging.',
  },
  {
    id: 'req_3',
    title: 'Write 500-word essay on Civil War',
    dueDate: '2025-05-24',
    status: 'completed',
    expertName: 'Emily Rodriguez',
    subject: 'Writing',
    price: '$15',
    postedDate: '2025-05-18',
    description: 'Need a well-researched essay about the American Civil War causes.',
  },
  {
    id: 'req_4',
    title: 'Design a logo for student group',
    dueDate: '2025-05-26',
    status: 'awaiting_expert',
    expertName: null,
    subject: 'Design',
    price: '$18',
    postedDate: '2025-05-21',
    description: 'Looking for a modern logo design for our computer science club.',
  },
  {
    id: 'req_5',
    title: 'Chemistry Lab Report Analysis',
    dueDate: '2025-05-23',
    status: 'disputed',
    expertName: 'Dr. James Wilson',
    subject: 'Chemistry',
    price: '$25',
    postedDate: '2025-05-17',
    description: 'Need analysis of organic chemistry lab results and conclusions.',
  },
  {
    id: 'req_6',
    title: 'Statistics Homework Problems',
    dueDate: '2025-05-21',
    status: 'cancelled',
    expertName: null,
    subject: 'Statistics',
    price: '$12',
    postedDate: '2025-05-20',
    description: 'Help with probability distributions and hypothesis testing.',
  },
];

export const dummyExpertTasks = [
  {
    id: 'exp_1',
    title: 'Translate English to Spanish document',
    dueDate: '2025-05-27',
    status: 'working',
    requesterName: 'John Smith',
    subject: 'Language',
    price: '$22',
    acceptedDate: '2025-05-20',
    description: 'Technical document translation from English to Spanish.',
  },
  {
    id: 'exp_2',
    title: 'Build basic website in HTML/CSS',
    dueDate: '2025-05-28',
    status: 'delivered',
    requesterName: 'Maria Garcia',
    subject: 'Coding',
    price: '$40',
    acceptedDate: '2025-05-19',
    description: 'Create a responsive portfolio website using HTML, CSS, and JavaScript.',
  },
  {
    id: 'exp_3',
    title: 'Solve Advanced Physics Problems',
    dueDate: '2025-05-23',
    status: 'payment_received',
    requesterName: 'David Park',
    subject: 'Physics',
    price: '$35',
    acceptedDate: '2025-05-18',
    description: 'Quantum mechanics and electromagnetic field problems.',
  },
  {
    id: 'exp_4',
    title: 'Business Plan Market Research',
    dueDate: '2025-05-29',
    status: 'working',
    requesterName: 'Lisa Thompson',
    subject: 'Business',
    price: '$50',
    acceptedDate: '2025-05-21',
    description: 'Conduct market research for tech startup business plan.',
  },
  {
    id: 'exp_5',
    title: 'Psychology Research Paper',
    dueDate: '2025-05-24',
    status: 'revision_requested',
    requesterName: 'Michael Brown',
    subject: 'Psychology',
    price: '$28',
    acceptedDate: '2025-05-17',
    description: 'Research paper on cognitive behavioral therapy effectiveness.',
  },
  {
    id: 'exp_6',
    title: 'Data Analysis with Excel',
    dueDate: '2025-05-26',
    status: 'delivered',
    requesterName: 'Anna Chen',
    subject: 'Statistics',
    price: '$32',
    acceptedDate: '2025-05-19',
    description: 'Analyze sales data and create visualizations in Excel.',
  },
];

// Helper function to get tasks by role
export const getTasksByRole = (role) => {
  return role === 'requester' ? dummyRequesterTasks : dummyExpertTasks;
};

// Helper function to get task by ID
export const getTaskById = (taskId, role) => {
  const tasks = getTasksByRole(role);
  return tasks.find(task => task.id === taskId);
};

// Helper function to get tasks by status
export const getTasksByStatus = (role, status) => {
  const tasks = getTasksByRole(role);
  return tasks.filter(task => task.status === status);
};

// Status definitions for reference
export const TASK_STATUSES = {
  // Requester statuses
  REQUESTER: {
    IN_PROGRESS: 'in_progress',
    PENDING_REVIEW: 'pending_review',
    COMPLETED: 'completed',
    AWAITING_EXPERT: 'awaiting_expert',
    DISPUTED: 'disputed',
    CANCELLED: 'cancelled',
  },
  // Expert statuses
  EXPERT: {
    WORKING: 'working',
    DELIVERED: 'delivered',
    PAYMENT_RECEIVED: 'payment_received',
    REVISION_REQUESTED: 'revision_requested',
  }
};