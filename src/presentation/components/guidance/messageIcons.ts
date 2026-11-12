import { CloudFog, CloudRain, HeartCrack, LucideIcon, Scale, Shield, Stethoscope, Undo2, UserRound, Wallet, Waves } from 'lucide-react-native';
import type { QuranMessageIcon } from '../../../domain/entities/quranMessages';

/** The picture for each «رسائل القرآن» mood (the domain keeps only the name). */
export const MESSAGE_ICONS: Record<QuranMessageIcon, LucideIcon> = {
  'cloud-rain': CloudRain,
  waves: Waves,
  'heart-crack': HeartCrack,
  wallet: Wallet,
  shield: Shield,
  'cloud-fog': CloudFog,
  stethoscope: Stethoscope,
  user: UserRound,
  undo: Undo2,
  scale: Scale,
};
