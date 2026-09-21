import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { GlassPanel, GlassScreen } from '../components/glass';
import PrimaryButton from '../components/button';

function Person({ selected, label, icon }) {
  return (
    <View className="items-center">
      <GlassPanel className={`h-[180px] w-[140px] rounded-[70px] ${selected ? 'border-accent' : ''}`}>
        <View className="h-full items-center justify-center">
          <Ionicons name={icon} size={72} color={selected ? '#BA4A0C' : '#C8C8C8'} />
        </View>
      </GlassPanel>
      <Text className={`mt-3 font-bold ${selected ? 'text-ink' : 'text-muted'}`}>{label}</Text>
    </View>
  );
}

export default function GenderScreen({ navigation }) {
  const { profile, updateProfile, completeOnboarding } = useApp();
  const [gender, setGender] = useState(profile.gender || 'male');

  return (
    <GlassScreen scroll={false} contentClassName="flex-1">
      <View className="mt-2 h-1 w-[28%] rounded bg-accent" />
      <TouchableOpacity
        className="self-end p-2"
        onPress={() =>
          completeOnboarding({
            gender,
            planStartedAt: new Date().toISOString(),
            acceptedDisclaimer: true,
            daysPerWeek: 3,
            campus: profile.campus || 'APK',
            injuries: [],
          })
        }
      >
        <Text className="font-bold text-muted">Skip</Text>
      </TouchableOpacity>

      <Text className="mt-3 text-center text-[28px] font-extrabold text-ink">What's your gender?</Text>
      <Text className="mt-2 text-center text-muted">Let us know you better</Text>

      <View className="flex-1 flex-row items-center">
        <TouchableOpacity className="flex-1 items-center" onPress={() => setGender('male')}>
          <Person selected={gender === 'male'} label="Male" icon="man" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 items-center" onPress={() => setGender('female')}>
          <Person selected={gender === 'female'} label="Female" icon="woman" />
        </TouchableOpacity>
      </View>

      <PrimaryButton
        title="NEXT"
        icon="arrow-forward"
        onPress={() => {
          updateProfile({ gender });
          navigation.navigate('Weight');
        }}
      />
    </GlassScreen>
  );
}
