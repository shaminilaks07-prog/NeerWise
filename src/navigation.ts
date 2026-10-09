import { Droplets, Gauge, History as HistoryIcon, Search, Settings, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', icon: Gauge, end: true },
  { to: '/budget', label: 'Water Budget', icon: Droplets },
  { to: '/detective', label: 'Waste Detective', icon: Search },
  { to: '/challenges', label: 'Challenges', icon: Target },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const FOOTER_LINKS = [
  { to: '/methodology', label: 'Methodology and limits' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms and Conditions' },
];
