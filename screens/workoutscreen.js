import React, { useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';
import { popularPrograms, getProgram } from '../data/programs';
import CatalogHeader from '../components/catalogheader';
import SectionTitle from '../components/sectiontitle';
import ProgramGrid from '../components/programgrid';
import TiktokRow from '../components/tiktokrow';
import { GlassScreen } from '../components/glass';
import { useApp } from '../context/AppContext';
import { loadTiktokFeed } from '../lib/tiktokFeed';

function matchesQuery(program, query) {
  const haystack = `${program.overlayTitle} ${program.overlaySubtitle} ${program.name} ${program.reason || ''} ${program.badge || ''}`.toLowerCase();
  return haystack.includes(query);
}

export default function WorkoutScreen({ navigation }) {
  const { recommendations } = useApp();
  const [query, setQuery] = useState('');
  const [feed, setFeed] = useState({ videos: [], source: 'local', updatedAt: '' });
  const normalized = query.trim().toLowerCase();

  useEffect(() => {
    loadTiktokFeed().then(setFeed);
  }, []);

  const popular = useMemo(
    () => (normalized ? popularPrograms.filter((item) => matchesQuery(item, normalized)) : popularPrograms),
    [normalized]
  );
  const recommended = useMemo(
    () => (normalized ? recommendations.filter((item) => matchesQuery(item, normalized)) : recommendations.slice(0, 2)),
    [normalized, recommendations]
  );

  const openProgram = (program) => {
    navigation.navigate('Exercises', { programId: program.id, title: program.name });
  };

  return (
    <GlassScreen>
      <CatalogHeader placeholder="Search programs..." activeId="programs" onQueryChange={setQuery} />
      <SectionTitle className="mt-[18px]">Popular Programs</SectionTitle>
      <ProgramGrid programs={popular} onPressProgram={openProgram} />
      <SectionTitle>Recommended for You</SectionTitle>
      <Text className="-mt-1 mb-3 text-xs text-muted">Ranked from your finished exercises and missing muscle groups.</Text>
      <ProgramGrid programs={recommended} onPressProgram={openProgram} />
      <SectionTitle>Updated from TikTok</SectionTitle>
      <Text className="-mt-1 mb-3 text-xs text-muted">
        {feed.source === 'remote'
          ? `Live list · updated ${feed.updatedAt}`
          : 'Local list · set TIKTOK_FEED_URL to pull a hosted JSON file'}
      </Text>
      <TiktokRow
        videos={feed.videos}
        onOpenProgram={(programId) => {
          const program = getProgram(programId);
          if (program) openProgram(program);
        }}
      />
    </GlassScreen>
  );
}
