import { StyleSheet, Dimensions } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

const { width } = Dimensions.get('window');
export const COMPASS = Math.min(width * 0.82, 360);

export const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: space[2] },

  compassWrapper: { width: COMPASS, height: COMPASS, alignItems: 'center', justifyContent: 'center', marginTop: space[4] },
  ring: { position: 'absolute', width: '100%', height: '100%', borderRadius: COMPASS / 2, borderWidth: 1, borderColor: colors.hairline },
  ringAligned: { borderColor: colors.gold, borderWidth: 2 },
  compassContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  disk: { width: '92%', height: '92%', borderRadius: COMPASS / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.surface },
  diskImage: { width: '100%', height: '100%', opacity: 0.7 },

  dirMarkerContainer: { position: 'absolute', height: '100%', alignItems: 'center', paddingTop: 10 },
  dirMarkerText: { ...type.label, fontSize: 18, color: colors.textFaint },
  northText: { color: colors.goldText, fontSize: 22 },
  dirTick: { width: 3, height: 12, backgroundColor: colors.surfaceRaised, marginTop: 4, borderRadius: 2 },
  northTick: { backgroundColor: colors.gold, height: 16 },

  deviceMarkerContainer: { position: 'absolute', top: 4, zIndex: 10, width: '100%', alignItems: 'center' },
  deviceMarker: { width: 6, height: 22, backgroundColor: colors.text, borderRadius: 3 },

  pointerWrap: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 15 },
  needleContainer: { height: '80%', width: 40, alignItems: 'center', justifyContent: 'flex-start' },
  needle: { width: 4, height: '40%', borderRadius: 2, backgroundColor: colors.gold },
  kaabaFrame: { width: 34, height: 34, backgroundColor: colors.gold, padding: 3, borderRadius: 6, marginBottom: 10 },
  kaabaBody: { flex: 1, backgroundColor: '#000', borderRadius: 2 },

  centerCapOuter: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  centerCapInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },

  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: space[10], marginTop: space[6] },
  statusText: { ...type.h2, fontFamily: 'Amiri_700Bold', fontSize: 24, color: colors.text, textAlign: 'center', marginTop: space[6], paddingHorizontal: space[6] },
  chipsRow: { flexDirection: 'row', gap: space[2], marginTop: space[4] },
  hint: { ...type.caption, color: colors.textMuted, textAlign: 'center', marginTop: space[3], paddingHorizontal: space[8] },
  pill: { borderRadius: radius.pill },
});
