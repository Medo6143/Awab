import { ScreenProps } from '../navigation/types';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Wallet, Info } from 'lucide-react-native';
import { Screen, ScreenHeader, Card, StatNumber } from '../components/ui';
import { ZakatInput, ZakatInfoBox } from '../components/zakat/ZakatComponents';
import { s } from '../components/zakat/ZakatStyles';
import { NISAB_GOLD, GOLD_PRICE_GRAM, toAr } from '../components/zakat/ZakatConstants';
import { colors, icon } from '../../shared/theme/tokens';

const ZakatScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const [cash, setCash] = useState('');
  const amount = Number(cash) || 0;
  const nisab = NISAB_GOLD * GOLD_PRICE_GRAM;
  const reached = amount >= nisab;
  const zakat = reached ? amount * 0.025 : 0;

  return (
    <Screen scroll header={<ScreenHeader title="زكاة المال" onBack={() => navigation.goBack()} />}>
      <Card padding={5}>
        <View style={s.hero}>
          <StatNumber value={`${toAr(zakat)} ج.م`} caption="الزكاة المستحقة (٢.٥٪)" size="display" />
          <View style={s.nisabBadge}>
            <Info size={icon.size.sm} color={colors.textMuted} strokeWidth={icon.stroke} />
            <Text style={s.nisabText}>النصاب تقديراً: {toAr(nisab)} ج.م</Text>
          </View>
          {amount > 0 && !reached ? <Text style={s.belowNisab}>المبلغ أقل من النصاب، فلا زكاة عليه</Text> : null}
        </View>
      </Card>

      <View style={s.form}>
        <ZakatInput label="إجمالي المبلغ المالي (كاش / بنك)" value={cash} onChange={setCash} icon={Wallet} unit="ج.م" />
      </View>

      <ZakatInfoBox />
    </Screen>
  );
};

export default ZakatScreen;
