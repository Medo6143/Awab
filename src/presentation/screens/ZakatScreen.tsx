import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Wallet, Info, Calculator, Coins, TrendingUp } from 'lucide-react-native';

// Zakat Components & Constants
import { ZakatInput, ZakatInfoBox } from '../components/zakat/ZakatComponents';
import { s } from '../components/zakat/ZakatStyles';
import { NISAB_GOLD, GOLD_PRICE_GRAM, toAr } from '../components/zakat/ZakatConstants';

const ZakatScreen = ({ navigation }: any) => {
  const [cash, setCash] = useState('');
  const [gold, setGold] = useState('');
  const [silver, setSilver] = useState('');
  const [stocks, setStocks] = useState('');

  const calculateTotal = () => {
    return (Number(cash) || 0) + (Number(gold) * GOLD_PRICE_GRAM || 0) + (Number(silver) * 40 || 0) + (Number(stocks) || 0);
  };

  const calculateZakat = () => calculateTotal() * 0.025;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><ChevronRight color="#fcd34d" size={24} /></TouchableOpacity>
          <Text style={s.headerTitle}>حاسبة الزكاة</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={s.resultContainer}>
          <LinearGradient colors={['#1e293b', '#0c0805']} style={s.resultCard}>
            <Text style={s.resultLabel}>زكاة المال المستحقة</Text>
            <Text style={s.resultValue}>{toAr(calculateZakat())}</Text>
            <View style={s.nisabBadge}>
              <Info size={14} color="#94a3b8" />
              <Text style={s.nisabText}>النصاب الحالي تقديراً: {toAr(NISAB_GOLD * GOLD_PRICE_GRAM)}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={s.form}>
           <ZakatInput label="النقد والمدخرات" value={cash} onChange={setCash} icon={Wallet} unit="ج.م" />
           <ZakatInput label="الذهب (عيار ٢٤)" value={gold} onChange={setGold} icon={Coins} unit="جرام" />
           <ZakatInput label="الفضة" value={silver} onChange={setSilver} icon={Coins} unit="جرام" />
           <ZakatInput label="الأسهم والاستثمارات" value={stocks} onChange={setStocks} icon={Calculator} unit="ج.م" />
        </View>

        <ZakatInfoBox />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ZakatScreen;
