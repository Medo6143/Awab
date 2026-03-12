import { Audio } from 'expo-av';

export const RECITER_MAP: Record<string, { folder: string, server: string, name: string }> = {
  'alafasy': { folder: 'Alafasy_128kbps', server: 'afs', name: 'مشاري العفاسي' },
  'abdulbasit': { folder: 'Abdul_Basit_Murattal_64kbps', server: 'basit', name: 'عبد الباسط (مرتل)' },
  'husary': { folder: 'Husary_128kbps', server: 'husr', name: 'الحصري' },
  'sudais': { folder: 'Abdurrahmaan_As-Sudais_192kbps', server: 'sds', name: 'السديس' },
  'ghamdi': { folder: 'Ghamadi_40kbps', server: 'ghm', name: 'سعد الغامدي' },
};

export class AudioService {
  private static sound: Audio.Sound | null = null;
  private static currentSequence: { surahId: number, ayahNumber: number }[] = [];
  private static currentIndex: number = -1;
  private static activeReciterId: string = 'alafasy';
  private static onSequenceFinish?: () => void;

  static setReciter(id: string) {
    if (RECITER_MAP[id]) {
      this.activeReciterId = id;
    }
  }

  static getActiveReciter() {
    return RECITER_MAP[this.activeReciterId];
  }

  static async playSurah(surahId: number, onPlaybackStatusUpdate?: (status: any) => void) {
    this.stopSequence();
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const reciter = RECITER_MAP[this.activeReciterId];
      const surahStr = surahId.toString().padStart(3, '0');
      const audioUrl = `https://server8.mp3quran.net/${reciter.server}/${surahStr}.mp3`;

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      this.sound = sound;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });
      
      return sound;
    } catch (error) {
      console.error('Error playing surah:', error);
      return null;
    }
  }

  static async playAyah(surahId: number, ayahNumber: number, onPlaybackStatusUpdate?: (status: any) => void) {
    this.stopSequence();
    return this._playAyahInternal(surahId, ayahNumber, onPlaybackStatusUpdate);
  }

  private static async _playAyahInternal(surahId: number, ayahNumber: number, onPlaybackStatusUpdate?: (status: any) => void) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const reciter = RECITER_MAP[this.activeReciterId];
      const surahStr = surahId.toString().padStart(3, '0');
      const ayahStr = ayahNumber.toString().padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/${reciter.folder}/${surahStr}${ayahStr}.mp3`;

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (onPlaybackStatusUpdate) onPlaybackStatusUpdate(status);
          if (status.isLoaded && status.didJustFinish && !status.isLooping) {
            this._handleAyahFinish();
          }
        }
      );
      
      this.sound = sound;
      return sound;
    } catch (error) {
      console.error('Error playing ayah:', error);
      return null;
    }
  }

  static async playSequence(items: { surahId: number, ayahNumber: number }[], onFinish?: () => void) {
    this.currentSequence = items;
    this.currentIndex = 0;
    this.onSequenceFinish = onFinish;
    if (items.length > 0) {
      await this._playAyahInternal(items[0].surahId, items[0].ayahNumber);
    }
  }

  private static async _handleAyahFinish() {
    if (this.currentIndex !== -1 && this.currentIndex < this.currentSequence.length - 1) {
      this.currentIndex++;
      const next = this.currentSequence[this.currentIndex];
      await this._playAyahInternal(next.surahId, next.ayahNumber);
    } else {
      const finishCb = this.onSequenceFinish;
      this.stopSequence();
      if (finishCb) finishCb();
    }
  }

  static stopSequence() {
    this.currentSequence = [];
    this.currentIndex = -1;
    this.onSequenceFinish = undefined;
  }

  static async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  static async resume() {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  static async stop() {
    this.stopSequence();
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  static async playAzan(type: 'takbir' | 'full') {
    console.log('AudioService: playAzan called with type:', type);
    try {
      // 1. Prepare system BEFORE loading
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 1, // DoNotMix
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // DoNotMix
        playThroughEarpieceAndroid: false
      });

      if (this.sound) {
        console.log('AudioService: Unloading existing sound...');
        await this.sound.unloadAsync();
      }

      console.log('AudioService: Loading azan.mp3 asset...');
      const azanAsset = require('../../../assets/audio/azan.mp3');

      const { sound } = await Audio.Sound.createAsync(
        azanAsset,
        { shouldPlay: true, volume: 1.0 }
      );
      
      this.sound = sound;
      console.log('AudioService: Sound loaded and playing at volume 1.0');

      return sound;
    } catch (error) {
      console.error('AudioService: Fatal error in playAzan:', error);
      return null;
    }
  }
}
