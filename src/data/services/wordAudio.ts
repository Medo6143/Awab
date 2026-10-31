import type { Audio } from 'expo-av';

/**
 * One word of the Quran recited on its own (quran.com's word-by-word audio), used to tell a
 * reciter the right word after a mistake. `position` is the word's 1-based place in the
 * ayah, the same split as the mushaf page. Needs the internet.
 */
const url = (surah: number, ayah: number, position: number) => {
  const pad = (n: number) => String(n).padStart(3, '0');
  return `https://audio.qurancdn.com/wbw/${pad(surah)}_${pad(ayah)}_${pad(position)}.mp3`;
};

const av = () => (require('expo-av') as typeof import('expo-av')).Audio;

/** The next word's audio, loaded while the reciter is still before it. */
let next: { uri: string; sound: Promise<Audio.Sound | null> } | null = null;

export const prefetchWord = (surah: number, ayah: number, position: number) => {
  const uri = url(surah, ayah, position);
  if (next?.uri === uri) return;
  next?.sound.then((s) => s?.unloadAsync()).catch(() => undefined);
  next = { uri, sound: av().Sound.createAsync({ uri }, { shouldPlay: false }).then((r) => r.sound, () => null) };
};

/** Plays the word, preloaded if it was; resolves once it has played, or failed, so the caller carries on either way. */
export const playWord = async (surah: number, ayah: number, position: number): Promise<void> => {
  const uri = url(surah, ayah, position);
  const ready = next?.uri === uri ? next.sound : null;
  if (ready) next = null;
  const sound = (await ready) ?? (await av().Sound.createAsync({ uri }, { shouldPlay: false }).then((r) => r.sound, () => null));
  if (!sound) return;
  try {
    await new Promise<void>((resolve) => {
      const giveUp = setTimeout(resolve, 4000); // do not hold the reciter on a slow connection
      sound.setOnPlaybackStatusUpdate((status) => {
        if ((status.isLoaded && status.didJustFinish) || (!status.isLoaded && status.error)) { clearTimeout(giveUp); resolve(); }
      });
      sound.playAsync().catch(() => { clearTimeout(giveUp); resolve(); });
    });
  } finally {
    sound.unloadAsync().catch(() => undefined);
  }
};
