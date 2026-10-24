import { Landmark, Sparkles, BookOpen, HandHeart, LucideIcon } from 'lucide-react-native';

// Category identity comes from the icon; all tiles share the accent colour.
export const IBADA_CATEGORIES: { id: string; name: string; icon: LucideIcon }[] = [
  { id: 'obligatory', name: 'الفرائض', icon: Landmark },
  { id: 'sunnah', name: 'السنن', icon: Sparkles },
  { id: 'daily', name: 'الأذكار والورد', icon: BookOpen },
  { id: 'voluntary', name: 'التطوع', icon: HandHeart },
];
