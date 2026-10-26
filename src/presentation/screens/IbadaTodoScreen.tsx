import { ScreenProps } from '../navigation/types';
import React from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { PrayerMatIcon } from '../components/icons/IslamicIcons';
import { RootState } from '../store';
import { toggleTask, syncIbadaDailyReset, IbadaTask } from '../store/slices/ibadaSlice';
import { logPrayer } from '../store/slices/statsSlice';
import { Screen, ScreenHeader, SectionTitle, EmptyState } from '../components/ui';
import { IbadaProgressCard, TaskItem } from '../components/ibada/IbadaComponents';
import { s } from '../components/ibada/IbadaStyles';
import { IBADA_CATEGORIES } from '../components/ibada/IbadaConstants';

const IbadaTodoScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state: RootState) => state.ibada);

  React.useEffect(() => { dispatch(syncIbadaDailyReset()); }, [dispatch]);

  const completedCount = tasks.filter((t: IbadaTask) => t.isCompleted).length;
  const progress = tasks.length ? completedCount / tasks.length : 0;

  return (
    <Screen scroll contentStyle={s.content} header={<ScreenHeader title="مهام العبادات" onBack={() => navigation.goBack()} />}>
      {tasks.length === 0 ? (
        <EmptyState icon={PrayerMatIcon} title="لا توجد مهام اليوم" message="ستظهر مهام العبادات هنا عند بداية يوم جديد." />
      ) : (
        <>
          <IbadaProgressCard completedCount={completedCount} totalCount={tasks.length} progress={progress} />
          {IBADA_CATEGORIES.map((cat) => {
            const items = tasks.filter((t: IbadaTask) => t.category === cat.id);
            if (!items.length) return null;
            return (
              <View key={cat.id} style={s.section}>
                <SectionTitle title={cat.name} />
                {items.map((task: IbadaTask) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => {
                      dispatch(toggleTask(task.id));
                      dispatch(logPrayer({ prayerId: task.id, isCompleted: !task.isCompleted }));
                    }}
                  />
                ))}
              </View>
            );
          })}
        </>
      )}
    </Screen>
  );
};

export default IbadaTodoScreen;
