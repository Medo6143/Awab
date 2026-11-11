import type { AVPlaybackStatus } from 'expo-av';
import type { Sound } from 'expo-av/build/Audio';
import TrackPlayer, { Event, State } from 'react-native-track-player';
import { initializeTrackPlayer } from './TrackPlayerService';
import { AyahKey, AzanSound, IDLE_PLAYBACK, PlaybackStatus, QuranPlayer } from '../../domain/services/Audio';
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
  /** Which engine the recitation is on; null when idle or when the sound is the adhan. */
  private engine: 'track' | 'av' | null = null;
  /** Bumped by every new request (play, stop); a load that finishes under an older one is dropped. */
  private request = 0;
  private status: PlaybackStatus = IDLE_PLAYBACK;
  private listeners = new Set<(status: PlaybackStatus) => void>();
  private watchingTrackPlayer = false;

  private getAudio() {
    return require('expo-av').Audio;
  }

  subscribe(listener: (status: PlaybackStatus) => void) {
    this.watchTrackPlayer();
    this.listeners.add(listener);
    listener(this.status);
    return () => { this.listeners.delete(listener); };
  }

  private emit(change: Partial<PlaybackStatus>) {
    this.status = { ...this.status, ...change };
    this.listeners.forEach((l) => l(this.status));
  }

  /** Whole surahs: follow track-player, whose state also changes from the notification and lock screen. */
  private watchTrackPlayer() {
    if (this.watchingTrackPlayer) return;
    this.watchingTrackPlayer = true;
    TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
      if (this.engine !== 'track') return;
      this.emit({
        isPlaying: state === State.Playing,
        isBuffering: state === State.Buffering || state === State.Loading,
      });
    });
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, ({ position, duration }) => {
      if (this.engine !== 'track') return;
      this.emit({ positionMillis: position * 1000, durationMillis: duration * 1000 });
    });
  }

  /** Unloads the expo-av sound (ayah or adhan), if any. */
  private async dropSound() {
    const sound = this.sound;
    this.sound = null;
    if (!sound) return;
    sound.setOnPlaybackStatusUpdate(null);
    try { await sound.unloadAsync(); } catch {}
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
    const request = ++this.request;
    this.stopSequence(); // Stop any AV ayahs/pages
    this.engine = 'track';
    this.emit({ ...IDLE_PLAYBACK, isBuffering: true });
    await this.dropSound();

    try {
      await this.ensureTrackPlayer();
      await TrackPlayer.reset();
      if (request !== this.request) return false; // stopped or replaced while setting up

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
      if (request === this.request) {
        this.engine = null;
        this.emit(IDLE_PLAYBACK);
      }
      return false;
    }
  }

  async playAyah(surahId: number, ayahNumber: number, _surahName?: string) {
    this.request++;
    this.stopSequence();
    return this.playAyahInternal(surahId, ayahNumber, false);
  }

  /** `continuing`: the next ayah of a run, so the state stays "playing" across the gap. */
  private async playAyahInternal(surahId: number, ayahNumber: number, continuing: boolean) {
    const request = this.request;
    this.engine = 'av';
    if (!continuing) this.emit({ ...IDLE_PLAYBACK, isBuffering: true });

    // 1. Reset TrackPlayer to remove any notification bar
    try { await TrackPlayer.reset(); } catch {}

    try {
      const reciter = RECITER_MAP[this.activeReciterId];
      const surahStr = surahId.toString().padStart(3, '0');
      const ayahStr = ayahNumber.toString().padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/${reciter.folder}/${surahStr}${ayahStr}.mp3`;

      console.log(`AudioService: Playing ayah ${surahId}:${ayahNumber} (No Notification)`);

      await this.dropSound();

      const { sound } = await this.getAudio().Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume: 1.0 }
      );
      // stopped (or something else started) while this ayah was loading: it must not start
      // now, when nothing holds it any more to stop it
      if (request !== this.request) {
        try { await sound.unloadAsync(); } catch {}
        return false;
      }
      this.sound = sound;

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (this.sound !== sound || !status.isLoaded) return;
        if (status.didJustFinish) {
          this.handleAyahFinish();
          return;
        }
        this.emit({
          isPlaying: status.isPlaying,
          isBuffering: status.shouldPlay && !status.isPlaying,
          positionMillis: status.positionMillis,
          durationMillis: status.durationMillis ?? 0,
        });
      });
      return true;
    } catch (error) {
      console.error('AudioService: Error playing ayah:', error);
      if (request === this.request) {
        this.stopSequence();
        this.engine = null;
        this.emit(IDLE_PLAYBACK);
      }
      return false;
    }
  }

  async playSequence(items: AyahKey[], _title?: string, onFinish?: () => void) {
    this.request++;
    this.currentSequence = items;
    this.currentIndex = 0;
    this.onSequenceFinish = onFinish;
    if (items.length > 0) {
      await this.playAyahInternal(items[0].surahId, items[0].ayahNumber, false);
    }
  }

  private async handleAyahFinish() {
    if (this.currentIndex !== -1 && this.currentIndex < this.currentSequence.length - 1) {
      this.currentIndex++;
      const next = this.currentSequence[this.currentIndex];
      await this.playAyahInternal(next.surahId, next.ayahNumber, true);
    } else {
      const finishCb = this.onSequenceFinish;
      this.stopSequence();
      this.engine = null;
      this.emit(IDLE_PLAYBACK);
      await this.dropSound();
      if (finishCb) finishCb();
    }
  }

  private stopSequence() {
    this.currentSequence = [];
    this.currentIndex = -1;
    this.onSequenceFinish = undefined;
  }

  async pause() {
    if (this.engine === 'track') { try { await TrackPlayer.pause(); } catch {} }
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
        this.engine = 'track';
        await TrackPlayer.play();
      } catch {}
    }
  }

  async seek(positionMillis: number) {
    if (this.sound) {
      try { await this.sound.setPositionAsync(positionMillis); } catch {}
      return;
    }
    try {
      await this.ensureTrackPlayer();
      await TrackPlayer.seekTo(positionMillis / 1000);
    } catch {}
  }

  async stop() {
    this.request++; // an ayah or surah still loading is dropped when it arrives
    this.stopSequence();
    this.engine = null;
    this.emit(IDLE_PLAYBACK);
    await this.dropSound();
    try { await TrackPlayer.reset(); } catch {}
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
    // the adhan takes over from any recitation
    const request = ++this.request;
    this.stopSequence();
    this.engine = null;
    this.emit(IDLE_PLAYBACK);
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

      await this.dropSound();

      const azanAsset = require('../../../assets/audio/azan.mp3');
      const { sound } = await this.getAudio().Sound.createAsync(
        azanAsset,
        { shouldPlay: true, volume: 1.0 }
      );
      // «إيقاف الأذان» was tapped while the file was loading
      if (request !== this.request) {
        try { await sound.unloadAsync(); } catch {}
        return;
      }
      this.sound = sound;
    } catch (error) {
      console.error('AudioService: Error in playAzan:', error);
    }
  }
}
