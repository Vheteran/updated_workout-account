import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useApp } from '../context/AppContext';
import { GlassCard, GlassScreen } from '../components/glass';
import PrimaryButton from '../components/button';
import { getSplit } from '../data/movements';

const OPTIONS = [
  { value: 2, label: '2 days', hint: 'Tue + Fri' },
  { value: 3, label: '3 days', hint: 'Mon, Wed, Fri' },
  { value: 4, label: '4 days', hint: 'Mon, Tue, Thu, Fri' },
  { value: 5, label: '5 days', hint: 'Mon to Fri' },
  { value: 6, label: '6 days', hint: 'Mon to Sat' },
];

export default function DaysScreen({ navigation }) {
  const { profile, updateProfile } = useApp();
  const [days, setDays] = useState(profile.daysPerWeek || 3);
  const split = getSplit(profile.goal, days);

  return (
    <GlassScreen>
      <View className="mt-2 h-1 w-[78%] rounded bg-accent" />
      <Text className="mt-6 text-[26px] font-extrabold text-ink">How many days can you train?</Text>
      <Text className="mb-6 mt-2 leading-5 text-muted">
        Pick what you can hold every week, not your best week. Miss a day and we move on rather than stacking two
        sessions.
      </Text>

      {OPTIONS.map((item) => (
        <GlassCard
          key={item.value}
          className={`mb-3 ${days === item.value ? 'border-accent' : ''}`}
          onPress={() => setDays(item.value)}
        >
          <Text className="text-lg font-extrabold text-ink">{item.label}</Text>
          <Text className="mt-1 text-muted">{item.hint}</Text>
        </GlassCard>
      ))}

      {split ? (
        <Text className="mt-1 text-[13px] leading-5 text-muted">
          {days} days gives you: {split.name}.
        </Text>
      ) : null}

      <View className="mt-6">
        <PrimaryButton
          title="NEXT"
          icon="arrow-forward"
          onPress={() => {
            updateProfile({ daysPerWeek: days });
            navigation.navigate('Campus');
          }}
        />
      </View>
    </GlassScreen>
  );
}
