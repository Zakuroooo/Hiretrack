export const APPLICATION_STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];

export const STAGE_COLORS = {
  Applied: '#38bdf8',
  Screening: '#f59e0b', 
  Interview: '#a78bfa',
  Offer: '#22c55e',
  Rejected: '#ef4444'
};

export const STAGE_BG = {
  Applied: 'rgba(56,189,248,0.08)',
  Screening: 'rgba(245,158,11,0.08)',
  Interview: 'rgba(167,139,250,0.08)',
  Offer: 'rgba(34,197,94,0.08)',
  Rejected: 'rgba(239,68,68,0.08)'
};

export const STAGE_BORDER = {
  Applied: 'rgba(56,189,248,0.2)',
  Screening: 'rgba(245,158,11,0.2)',
  Interview: 'rgba(167,139,250,0.2)',
  Offer: 'rgba(34,197,94,0.2)',
  Rejected: 'rgba(239,68,68,0.2)'
};

export const STAGE_ICONS = {
  Applied: 'Send',
  Screening: 'Eye',
  Interview: 'MessageSquare',
  Offer: 'Trophy',
  Rejected: 'XCircle'
};

export const NAV_ITEMS = [
  { icon: 'LayoutDashboard', label: 'Overview', path: '/dashboard' },
  { icon: 'Kanban', label: 'Job Board', path: '/dashboard/board' },
  { icon: 'Sparkles', label: 'AI Match', path: '/dashboard/ai-match' },
  { icon: 'BarChart3', label: 'Analytics', path: '/dashboard/analytics' },
  { icon: 'Settings', label: 'Settings', path: '/dashboard/settings' }
];
