import type { AVPlaybackStatus } from 'expo-av';
import type { Sound } from 'expo-av/build/Audio';
import TrackPlayer from 'react-native-track-player';
import { initializeTrackPlayer } from './TrackPlayerService';
import { AyahKey, AzanSound, QuranPlayer } from '../../domain/services/Audio';
import { DEFAULT_RECITER_ID, RECITER_MAP } from '../../domain/entities/reciters';

/**
 * Recitation and the in-app adhan on top of react-native-track-player (whole surahs, with the
 * media notification) and expo-av (single ayahs and the adhan). Both interfaces live in one
 * class because they share the one expo-av sound: starting the adhan replaces a playing ayah.
 * The container registers the same instance as `quranPlayer` and `azanSound`.
 */
export class ExpoAudioPlayer implements QuranPlayer, AzanSound {
  private sound: Sound | null = null;
  private isTrackPlayerInitialized = false;
  private currentSequence: AyahKey[] = [];
  private currentIndex = -1;
  private activeReciterId = DEFAULT_RECITER_ID;
  private onSequenceFinish?: () => void;

  private getAudio() {
    return require('expo-av').Audio;
  }

  setReciter(id: string) {
    if (RECITER_MAP[id]) this.activeReciterId = id;
  }

  private async ensureTrackPlayer() {
    if (!this.isTrackPlayerInitialized) {
      this.isTrackPlayerInitialized = await initializeTrackPlayer();
    }
  }

  async playSurah(surahId: number, surahName?: string) {
    this.stopSequence(); // Stop any AV ayahs/pages
    if (this.sound) { try { await this.sound.unloadAsync(); } catch {} this.sound = null; }

    try {
      await this.ensureTrackPlayer();
      await TrackPlayer.reset();

      const reciter = RECITER_MAP[this.activeReciterId];
      const surahStr = surahId.toString().padStart(3, '0');
      const audioUrl = `https://server${reciter.serverNum}.mp3quran.net/${reciter.server}/${surahStr}.mp3`;

      console.log(`AudioService: Playing surah ${surahId} from ${audioUrl} (With Notification)`);

      await TrackPlayer.add({
        id: `surah-${surahId}`,
        url: audioUrl,
        title: surahName || `سورة رقم ${surahId}`,
        artist: reciter.name,
        artwork: require('../../../assets/images/mosque_bg.png'),
      });

      await TrackPlayer.play();
      return true;
    } catch (error) {
      console.error('AudioService: Error playing surah:', error);
      return false;
    }
  }

  async playAyah(surahId: number, ayahNumber: number, _surahName?: string) {
    this.stopSequence();
    return this.playAyahInternal(surahId, ayahNumber);
  }

  private async playAyahInternal(surahId: number, ayahNumber: number) {
    // 1. Reset TrackPlayer to remove any notification bar
    try { await TrackPlayer.reset(); } catch {}

    try {
      const reciter = RECITER_MAP[this.activeReciterId];
      const surahStr = surahId.toString().padStart(3, '0');
      const ayahStr = ayahNumber.toString().padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/${reciter.folder}/${surahStr}${ayahStr}.mp3`;

      console.log(`AudioService: Playing ayah ${surahId}:${ayahNumber} (No Notification)`);

      if (this.sound) { try { await this.sound.unloadAsync(); } catch {} }

      const { sound } = await this.getAudio().Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume: 1.0 }
      );
      this.sound = sound;

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          this.handleAyahFinish();
        }
      });
      return true;
    } catch (error) {
      console.error('AudioService: Error playing ayah:', error);
      return false;
    }
  }

  async playSequence(items: AyahKey[], _title?: string, onFinish?: () => void) {
    this.currentSequence = items;
    this.currentIndex = 0;
    this.onSequenceFinish = onFinish;
    if (items.length > 0) {
      await this.playAyahInternal(items[0].surahId, items[0].ayahNumber);
    }
  }

  private async handleAyahFinish() {
    if (this.currentIndex !== -1 && this.currentIndex < this.currentSequence.length - 1) {
      this.currentIndex++;
      const next = this.currentSequence[this.currentIndex];
      await this.playAyahInternal(next.surahId, next.ayahNumber);
    } else {
      const finishCb = this.onSequenceFinish;
      this.stopSequence();
      if (finishCb) finishCb();
    }
  }

  private stopSequence() {
    this.currentSequence = [];
    this.currentIndex = -1;
    this.onSequenceFinish = undefined;
  }

  async pause() {
    try { await TrackPlayer.pause(); } catch {}
    if (this.sound) { try { await this.sound.pauseAsync(); } catch {} }
  }

  async resume() {
    // If we have a sound (AV), it means we were in a sequence/ayah
    if (this.sound) {
      try { await this.sound.playAsync(); } catch {}
    } else {
      // Otherwise try TrackPlayer
      try {
        await this.ensureTrackPlayer();
        await TrackPlayer.play();
      } catch {}
    }
  }

  async seek(positionMillis: number) {
    try {
      await this.ensureTrackPlayer();
      await TrackPlayer.seekTo(positionMillis / 1000);
    } catch {}
    if (this.sound) {
      try { await this.sound.setPositionAsync(positionMillis); } catch {}
    }
  }

  async stop() {
    this.stopSequence();
    try { await TrackPlayer.reset(); } catch {}
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch {}
      this.sound = null;
    }
  }

  async hasQueue() {
    try {
      return (await TrackPlayer.getQueue()).length > 0;
    } catch {
      return false;
    }
  }

  /** Seconds into the adhan this player is playing (expo-av), or null. */
  async position(): Promise<number | null> {
    try {
      const st = await this.sound?.getStatusAsync();
      return st && st.isLoaded && st.isPlaying ? st.positionMillis / 1000 : null;
    } catch { return null; }
  }

  async play(type: 'takbir' | 'full') {
    console.log('AudioService: playAzan called with type:', type);
    try {
      // 1. Fully reset TrackPlayer to remove the notification bar for non-recitations
      try {
        await TrackPlayer.reset();
      } catch (e) {
        console.log('AudioService: Error resetting TP for Azan:', e);
      }

      // 2. Prepare system BEFORE loading expo-av
      await this.getAudio().setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 1, // DoNotMix
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // DoNotMix
        playThroughEarpieceAndroid: false
      });

      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const azanAsset = require('../../../assets/audio/azan.mp3');
      const { sound } = await this.getAudio().Sound.createAsync(
        azanAsset,
        { shouldPlay: true, volume: 1.0 }
      );
      this.sound = sound;
    } catch (error) {
      console.error('AudioService: Error in playAzan:', error);
    }
  }
}
