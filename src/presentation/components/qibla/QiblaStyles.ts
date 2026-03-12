import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24,
  },
  backBtn: { width: 44, height: 44, backgroundColor: '#1a140f', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2b1f15' },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 24, color: '#fff' },
  
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  infoCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1a140f', 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    borderRadius: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#2b1f15',
    elevation: 4
  },
  infoIconWrap: { marginRight: 12, backgroundColor: '#fcd34d20', padding: 6, borderRadius: 10 },
  infoText: { fontFamily: 'Tajawal_500Medium', fontSize: 16, color: '#94a3b8' },
  goldText: { color: '#fcd34d', fontWeight: 'bold' },

  compassWrapper: { width: width * 0.85, height: width * 0.85, alignItems: 'center', justifyContent: 'center' },
  glowRing: { position: 'absolute', width: '100%', height: '100%', borderRadius: 300, borderWidth: 1, borderColor: '#1e1b18', backgroundColor: '#00000010' },
  glowRingActive: { borderColor: '#fcd34d', shadowColor: '#fcd34d', shadowOpacity: 0.3, shadowRadius: 20, borderWidth: 2 },
  
  compassContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  ornateDisk: { width: '92%', height: '92%', borderRadius: 200, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  diskBaseImage: { width: '100%', height: '100%', opacity: 0.8, backgroundColor: '#1a140f' },
  
  dirMarkerContainer: { position: 'absolute', height: '100%', alignItems: 'center', paddingTop: 10 },
  dirMarkerText: { fontFamily: 'Tajawal_700Bold', fontSize: 20, color: '#64748b' },
  northText: { color: '#fcd34d', fontSize: 24 },
  dirTick: { width: 4, height: 12, backgroundColor: '#334155', marginTop: 4, borderRadius: 2 },
  northTick: { backgroundColor: '#fcd34d', height: 16 },

  deviceMarkerContainer: { position: 'absolute', top: 5, zIndex: 10, width: '100%', alignItems: 'center' },
  deviceMarker: { width: 8, height: 24, backgroundColor: '#ef4444', borderRadius: 4, shadowColor: '#ef4444', shadowOpacity: 0.5, shadowRadius: 5 },

  qiblaPointerWrap: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 15 },
  pointerNeedleContainer: { height: '80%', width: 40, alignItems: 'center', justifyContent: 'flex-start' },
  pointerNeedle: { width: 4, height: '40%', borderRadius: 2, shadowColor: '#fcd34d', shadowOpacity: 0.6, shadowRadius: 10 },
  kaabaIconWrap: { marginBottom: 10, alignItems: 'center' },
  kaabaGoldFrame: { width: 34, height: 34, backgroundColor: '#d4af37', padding: 3, borderRadius: 6, elevation: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 5 },
  kaabaBlackBody: { flex: 1, backgroundColor: '#000', borderRadius: 2 },

  centerCapOuter: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a140f', borderWidth: 2, borderColor: '#2b1f15', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  centerCapInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fcd34d' },

  statusBanner: { marginTop: 50, alignItems: 'center', paddingHorizontal: 20 },
  statusText: { fontFamily: 'Amiri_700Bold', fontSize: 28, color: '#fcd34d', textAlign: 'center' },
  accuracyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a140f', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 15, borderWidth: 1, borderColor: '#2b1f15' },
  onlinePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  accuracyLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 13, color: '#64748b' },
  errorText: { fontFamily: 'Tajawal_500Medium', fontSize: 18, color: '#ef4444', textAlign: 'center' }
});
