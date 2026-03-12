import React from 'react';
import { View } from 'react-native';
import { BookOpen, Heart, User } from 'lucide-react-native';

export const SunIcon = ({ size, color }: any) => <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: color }} />;
export const ActivityIcon = ({ size, color }: any) => <View style={{ width: size, height: 2, backgroundColor: color }} />;

export const DUA_CATEGORIES = [
  { id: 'daily', name: 'أدعية يومية', icon: SunIcon },
  { id: 'prophetic', name: 'أدعية نبوية', icon: Heart },
  { id: 'quranic', name: 'أدعية قرآنية', icon: BookOpen },
  { id: 'relief', name: 'الكرب والهم', icon: ActivityIcon },
  { id: 'personal', name: 'أدعية شخصية', icon: User },
];

export const DUAS_DATA = [
  {
    id: 'q1',
    category: 'quranic',
    text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    ref: "سورة البقرة - ٢٠١",
  },
  {
    id: 'p1',
    category: 'prophetic',
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    ref: "صحيح مسلم",
  },
  {
    id: 'd1',
    category: 'daily',
    text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    ref: "البخاري ومسلم",
  },
  {
    id: 'r1',
    category: 'relief',
    text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    ref: "سورة الأنبياء - ٨٧",
  },
  {
    id: 'q2',
    category: 'quranic',
    text: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    ref: "سورة إبراهيم - ٤٠",
  }
];
