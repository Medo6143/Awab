import TrackPlayer from 'react-native-track-player';
import { initializeTrackPlayer } from './TrackPlayerService';
import { Image } from 'react-native';

const DEFAULT_ARTWORK = Image.resolveAssetSource(require('../../../assets/images/mosque_bg.png')).uri;

export const RECITER_MAP: Record<string, { folder: string, server: string, serverNum: string, name: string }> = {
  'alafasy': { folder: 'Alafasy_128kbps', server: 'afs', serverNum: '8', name: 'مشاري العفاسي' },
  'abdulbasit': { folder: 'Abdul_Basit_Murattal_64kbps', server: 'basit', serverNum: '7', name: 'عبد الباسط (مرتل)' },
  'husary': { folder: 'Husary_128kbps', server: 'husr', serverNum: '13', name: 'الحصري' },
  'sudais': { folder: 'Abdurrahmaan_As-Sudais_192kbps', server: 'sds', serverNum: '11', name: 'السديس' },
};



export class AudioService {
  private static sound: any | null = null;
  private static isTrackPlayerInitialized: boolean = false;
  private static currentSequence: { surahId: number, ayahNumber: number }[] = [];
  private static currentIndex: number = -1;
  private static activeReciterId: string = 'alafasy';
  private static onSequenceFinish?: () => void;

  private static getAudio() {
    return require('expo-av').Audio;
  }

  static setReciter(id: string) {
    if (RECITER_MAP[id]) {
      this.activeReciterId = id;
    }
  }

  static getActiveReciter() {
    return RECITER_MAP[this.activeReciterId];
  }

  private static async ensureTrackPlayer() {
    if (!this.isTrackPlayerInitialized) {
      this.isTrackPlayerInitialized = await initializeTrackPlayer();
    }
  }

  static async playSurah(surahId: number, surahName?: string) {
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
        artwork: require('../../../assets/images/mosque_bg.png'), // Use direct require
      });

      await TrackPlayer.play();
      return true;
    } catch (error) {
      console.error('AudioService: Error playing surah:', error);
      return false;
    }
  }


  static async playAyah(surahId: number, ayahNumber: number, surahName?: string) {
    this.stopSequence();
    return this._playAyahInternal(surahId, ayahNumber, surahName);
  }

  private static async _playAyahInternal(surahId: number, ayahNumber: number, surahName?: string) {
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

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          this._handleAyahFinish();
        }
      });
      return true;
    } catch (error) {
      console.error('AudioService: Error playing ayah:', error);
      return false;
    }
  }


  static async playSequence(items: { surahId: number, ayahNumber: number }[], title?: string, onFinish?: () => void) {
    this.currentSequence = items;
    this.currentIndex = 0;
    this.onSequenceFinish = onFinish;
    if (items.length > 0) {
      await this._playAyahInternal(items[0].surahId, items[0].ayahNumber, title);
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
    try { await TrackPlayer.pause(); } catch {}
    if (this.sound) { try { await this.sound.pauseAsync(); } catch {} }
  }

  static async resume() {
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

  static async seek(positionMillis: number) {
    try {
      await this.ensureTrackPlayer();
      await TrackPlayer.seekTo(positionMillis / 1000);
    } catch {}
    if (this.sound) {
      try { await this.sound.setPositionAsync(positionMillis); } catch {}
    }
  }

  static async stop() {
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


  static async playAzan(type: 'takbir' | 'full') {
    console.log('AudioService: playAzan called with type:', type);
    try {
      // 1. Fully reset TrackPlayer to remove the notification bar for non-recitations
      try { 
        await TrackPlayer.reset(); 
        console.log('AudioService: TrackPlayer reset for Azan');
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
      return sound;
    } catch (error) {
      console.error('AudioService: Error in playAzan:', error);
      return null;
    }
  }
}
