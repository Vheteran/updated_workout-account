import React from 'react';
import { View, Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './glass';

export default function TiktokRow({ videos, onOpenProgram }) {
  if (!videos?.length) {
    return <Text className="text-muted">No creator clips yet. Add URLs in data/tiktok.js.</Text>;
  }

  return (
    <View className="gap-2.5">
      {videos.map((video) => (
        <GlassCard
          key={video.id}
          onPress={() => {
            if (video.programId && onOpenProgram) onOpenProgram(video.programId);
            else Linking.openURL(video.url);
          }}
          onLongPress={() => Linking.openURL(video.url)}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-black/50">
              <Ionicons name="logo-tiktok" size={22} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-ink">{video.title}</Text>
              <Text className="mt-0.5 text-xs text-muted">
                {video.creator} · tap for program, hold to open TikTok
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#8E8E93" />
          </View>
        </GlassCard>
      ))}
    </View>
  );
}
