export const MUEZZINS = [
  { 
    id: 'makkah', 
    name: 'الحرم المكي', 
    full: 'https://www.islamcan.com/audio/azan/azan1.mp3',
    takbir: 'https://www.islamcan.com/audio/azan/azan1_short.mp3' // Placeholder/trimmed if available
  },
  { 
    id: 'madina', 
    name: 'الحرم المدني', 
    full: 'https://www.islamcan.com/audio/azan/azan2.mp3',
    takbir: 'https://www.islamcan.com/audio/azan/azan2_short.mp3'
  },
  { 
    id: 'alaqsa', 
    name: 'المسجد الأقصى', 
    full: 'https://www.islamcan.com/audio/azan/azan3.mp3',
    takbir: 'https://www.islamcan.com/audio/azan/azan3_short.mp3'
  },
  { 
    id: 'abdulbasit', 
    name: 'عبد الباسط عبد الصمد', 
    full: 'https://www.islamcan.com/audio/azan/azan10.mp3',
    takbir: 'https://www.islamcan.com/audio/azan/azan10_short.mp3'
  }
];

export const AZAN_TYPES = [
  { id: 'none', name: 'صامت (تنبيه فقط)' },
  { id: 'takbir', name: 'تكبير فقط' },
  { id: 'full', name: 'الآذان كاملاً' },
];
