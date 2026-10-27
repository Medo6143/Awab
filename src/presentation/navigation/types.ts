import { NavigatorScreenParams, NavigationProp, RouteProp } from '@react-navigation/native';

export type TabParamList = {
  TabHome: undefined;
  TabPrayer: { screen?: 'times' | 'qibla' } | undefined;
  TabQuran: undefined;
  TabTasbeeh: undefined;
  TabAthkar: { type?: 'morning' | 'evening' } | undefined;
};

/** Stack routes keep their Arabic names; they are used across the app for navigate(). */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  'الأذكار': { type?: 'morning' | 'evening' } | undefined;
  'الأدعية': undefined;
  'نور_القلب': undefined;
  'الختمات': { mode?: 'reading' | 'hifz' } | undefined;
  'الفضائل': { topic: 'dua' | 'dhikr' };
  'رسائل_القرآن': undefined;
  'القبلة': undefined;
  'الصلاة': undefined;
  'الزكاة': undefined;
  'العبادات': undefined;
  'الإعدادات': undefined;
  'الإحصائيات': undefined;
};

/** Every screen can reach every stack route and every tab by name. */
export type AppParamList = RootStackParamList & TabParamList;
export type AppNavigation = NavigationProp<AppParamList>;

/** Routes that take no params, e.g. for grid tiles and shortcuts. */
export type PlainRoute = { [K in keyof AppParamList]: undefined extends AppParamList[K] ? K : never }[keyof AppParamList];

export type ScreenProps<R extends keyof AppParamList = keyof AppParamList> = {
  navigation: AppNavigation;
  route: RouteProp<AppParamList, R>;
};

/** Screens that are also embedded inside another screen (e.g. the prayer hub), where navigation may be absent. */
export type EmbeddableScreenProps<R extends keyof AppParamList = keyof AppParamList> = Partial<ScreenProps<R>> & {
  hideHeader?: boolean;
  tab?: boolean;
};
