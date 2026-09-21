import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

export function GlowBackground() {
  return (
    <View className="absolute inset-0 overflow-hidden bg-background" style={{ pointerEvents: 'none' }}>
      <View className="absolute -left-16 -top-10 h-64 w-64 rounded-full bg-accent/15" />
      <View className="absolute right-[-40px] top-24 h-72 w-72 rounded-full bg-teal/10" />
      <View className="absolute bottom-28 left-8 h-56 w-56 rounded-full bg-accent/10" />
      <View className="absolute bottom-0 right-10 h-40 w-40 rounded-full bg-teal/10" />
    </View>
  );
}

export function GlassScreen({ children, edges = ['top'], contentClassName = '', scroll = true }) {
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className={contentClassName}>{children}</View>
    </ScrollView>
  ) : (
    <View className={`flex-1 px-5 pt-2 pb-8 ${contentClassName}`} style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>{children}</View>
  );

  return (
    <View className="flex-1 bg-background" style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <GlowBackground />
      <SafeAreaView className="flex-1" edges={edges} style={{ flex: 1 }}>
        {body}
      </SafeAreaView>
    </View>
  );
}

export function GlassPanel({ children, className = '', intensity = 28, tint = 'light' }) {
  return (
    <View className={`overflow-hidden rounded-3xl border border-black/10 ${className}`}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View className="bg-white/80">{children}</View>
    </View>
  );
}

export function GlassCard({ children, className = '', onPress, onLongPress, intensity = 28 }) {
  const inner = (
    <GlassPanel className={className} intensity={intensity}>
      <View className="p-4">{children}</View>
    </GlassPanel>
  );

  if (!onPress && !onLongPress) return inner;

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} onLongPress={onLongPress}>
      {inner}
    </TouchableOpacity>
  );
}
