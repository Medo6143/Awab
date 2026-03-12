import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight } from 'lucide-react-native';
import { RootState } from '../store';
import { toggleTask, syncIbadaDailyReset, IbadaTask } from '../store/slices/ibadaSlice';
import { logPrayer } from '../store/slices/statsSlice';
import { THEME } from '../../shared/theme/constants';

// Ibada Components & Styles
import { IbadaProgressCard, TaskItem } from '../components/ibada/IbadaComponents';
import { s } from '../components/ibada/IbadaStyles';
import { IBADA_CATEGORIES } from '../components/ibada/IbadaConstants';

const IbadaTodoScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state: RootState) => state.ibada);
  const { accentTheme } = useSelector((state: RootState) => state.settings);
  
  const colors = THEME.colors as any;
  const accentColor = colors[accentTheme] || colors.primary;

  React.useEffect(() => {
    dispatch(syncIbadaDailyReset());
  }, [dispatch]);

  const completedCount = tasks.filter((t: IbadaTask) => t.isCompleted).length;
  const progress = completedCount / tasks.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><ChevronRight color={accentColor} size={24} /></TouchableOpacity>
        <Text style={s.headerTitle}>مهام العبادات</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <IbadaProgressCard completedCount={completedCount} totalCount={tasks.length} progress={progress} accentColor={accentColor} />

        {IBADA_CATEGORIES.map(cat => (
          <View key={cat.id} style={s.section}>
            <Text style={s.sectionTitle}>{cat.name}</Text>
            {tasks.filter((t: IbadaTask) => t.category === cat.id).map((task: IbadaTask) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                accentColor={accentColor} 
                onToggle={() => {
                  dispatch(toggleTask(task.id));
                  dispatch(logPrayer({ prayerId: task.id, isCompleted: !task.isCompleted }));
                }} 
              />
            ))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default IbadaTodoScreen;
