import { ScreenProps } from '../navigation/types';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { syncIbadaDailyReset, addCustomTask, removeCustomTask, IbadaTask } from '../store/slices/ibadaSlice';
import { Screen, ScreenHeader, SectionTitle, IconButton } from '../components/ui';
import { DeedChips, IbadaRings, PrayerSquares, TaskRow } from '../components/ibada/IbadaComponents';
import { InputModal } from '../components/tasbeeh/TasbeehModals';
import { useToggleIbada } from '../hooks/useToggleIbada';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { colors, icon } from '../../shared/theme/tokens';

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const PRAYER_IDS: Record<string, string> = { Fajr: 'fajr', Dhuhr: 'dhuhr', Asr: 'asr', Maghrib: 'maghrib', Isha: 'isha' };

const IbadaTodoScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  const toggle = useToggleIbada();
  const { tasks } = useSelector((state: RootState) => state.ibada);
  const { nextPrayer, date } = usePrayerTimes();
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');

  React.useEffect(() => { dispatch(syncIbadaDailyReset()); }, [dispatch]);

  const of = (category: IbadaTask['category']) => tasks.filter((t: IbadaTask) => t.category === category);
  const obligatory = of('obligatory');
  const sunnah = of('sunnah');
  const daily = of('daily');
  const deeds = of('voluntary');
  const count = (list: IbadaTask[]) => list.filter((t) => t.isCompleted).length;
  const onToggle = (t: IbadaTask) => toggle(t.id, t.isCompleted);

  const hijri = date?.hijri;
  const subtitle = [WEEKDAYS[new Date().getDay()], hijri ? `${hijri.day} ${hijri.month.ar} ${hijri.year}` : ''].filter(Boolean).join(' · ');

  const remove = (t: IbadaTask) => Alert.alert('حذف المهمة', `حذف «${t.name}» من قائمتك؟`, [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'حذف', style: 'destructive', onPress: () => dispatch(removeCustomTask(t.id)) },
  ]);

  const add = (val: string) => {
    const name = val.trim();
    if (!name) return;
    dispatch(addCustomTask({ name, category: 'voluntary' }));
    setNewTask('');
    setAdding(false);
  };

  return (
    <Screen
      scroll
      header={
        <ScreenHeader
          title="عبادات اليوم"
          subtitle={subtitle}
          onBack={() => navigation.goBack()}
          right={
            <IconButton onPress={() => setAdding(true)} label="إضافة مهمة">
              <Plus size={icon.size.md} color={colors.gold} strokeWidth={icon.stroke} />
            </IconButton>
          }
        />
      }
    >
      <IbadaRings
        groups={[
          { key: 'obligatory', label: 'الفرائض', color: colors.gold, done: count(obligatory), total: obligatory.length },
          { key: 'sunnah', label: 'السنن', color: colors.success, done: count(sunnah), total: sunnah.length },
          { key: 'daily', label: 'الأذكار والورد', color: '#8fa8d8', done: count(daily), total: daily.length },
        ]}
      />

      <SectionTitle title="الفرائض" />
      <PrayerSquares tasks={obligatory} nextId={nextPrayer ? PRAYER_IDS[nextPrayer.name] : undefined} onToggle={onToggle} />

      <SectionTitle title="السنن والنوافل" />
      {sunnah.map((t) => <TaskRow key={t.id} task={t} onToggle={() => onToggle(t)} />)}

      <SectionTitle title="الأذكار والورد" />
      {daily.map((t) => <TaskRow key={t.id} task={t} onToggle={() => onToggle(t)} />)}

      <SectionTitle title="خير اليوم" />
      <DeedChips tasks={deeds} onToggle={onToggle} onRemove={remove} onAdd={() => setAdding(true)} />

      <InputModal
        visible={adding}
        onClose={() => setAdding(false)}
        onConfirm={add}
        title="مهمة جديدة"
        subtitle="تظهر في «خير اليوم» كل يوم، واضغط عليها مطولًا لحذفها"
        placeholder="مثال: زيارة مريض"
        value={newTask}
        setValue={setNewTask}
      />
    </Screen>
  );
};

export default IbadaTodoScreen;
