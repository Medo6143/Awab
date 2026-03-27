import TrackPlayer, { Capability, Event, AppKilledPlaybackBehavior } from 'react-native-track-player';

// This must be registered at the root of the app
export const TrackPlayerService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('TrackPlayerService: RemotePlay received');
    TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('TrackPlayerService: RemotePause received');
    TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log('TrackPlayerService: RemoteStop received');
    TrackPlayer.reset();
  });
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('TrackPlayerService: RemoteNext received');
    TrackPlayer.skipToNext();
  });
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('TrackPlayerService: RemotePrevious received');
    TrackPlayer.skipToPrevious();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, (data) => {
    console.log('TrackPlayerService: RemoteSeek received', data.position);
    TrackPlayer.seekTo(data.position);
  });
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (data) => {
    try {
      const position = await TrackPlayer.getPosition();
      console.log('TrackPlayerService: RemoteJumpForward received', position + (data.interval || 15));
      await TrackPlayer.seekTo(position + (data.interval || 15));
    } catch (e) {
      console.warn('RemoteJumpForward error:', e);
    }
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (data) => {
    try {
      const position = await TrackPlayer.getPosition();
      console.log('TrackPlayerService: RemoteJumpBackward received', position - (data.interval || 15));
      await TrackPlayer.seekTo(Math.max(0, position - (data.interval || 15)));
    } catch (e) {
      console.warn('RemoteJumpBackward error:', e);
    }
  });
};

export const initializeTrackPlayer = async () => {
  console.log('TrackPlayerService: Initializing...');
  try {
    await TrackPlayer.setupPlayer();
    console.log('TrackPlayerService: Setup successful. Updating options...');
    
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      color: 0xD4AF37, 
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.JumpForward,
        Capability.JumpBackward,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
      forwardJumpInterval: 15,
      backwardJumpInterval: 15,
      progressUpdateEventInterval: 2,
    });
    return true;
  } catch (e: any) {
    if (e.code === 'player_already_initialized') {
      console.log('TrackPlayerService: Player already initialized.');
      return true;
    }
    console.error('TrackPlayerService: Initialization error:', e);
    return false;
  }
};
