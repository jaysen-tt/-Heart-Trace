export interface Track {
  id: string;
  title: string;
  category: 'Rain' | 'Sunny' | 'Love' | 'Focus';
  source: any; // Changed from uri: string to source: any to support require()
  cover: string; // Image URL or Icon name
}

export const ATMOSPHERE_TRACKS: Track[] = [
  // Focus (专注)
  {
    id: 'focus_1',
    title: 'Acoustic Guitar',
    category: 'Focus',
    source: require('../../assets/bgm/专注/AcousticGuitar1.m4a'),
    cover: 'leaf-outline'
  },
  {
    id: 'focus_2',
    title: 'Meditation',
    category: 'Focus',
    source: require('../../assets/bgm/专注/AcousticMeditation2.m4a'),
    cover: 'leaf-outline'
  },
  {
    id: 'focus_3',
    title: 'Minstrel',
    category: 'Focus',
    source: require('../../assets/bgm/专注/Minstrel.m4a'),
    cover: 'leaf-outline'
  },
  {
    id: 'focus_4',
    title: 'Noel',
    category: 'Focus',
    source: require('../../assets/bgm/专注/Noel.m4a'),
    cover: 'leaf-outline'
  },

  // Sunny (晴天)
  {
    id: 'sunny_1',
    title: 'City Sunshine',
    category: 'Sunny',
    source: require('../../assets/bgm/晴天/City Sunshine.m4a'),
    cover: 'sunny-outline'
  },
  {
    id: 'sunny_2',
    title: 'Fresh Focus',
    category: 'Sunny',
    source: require('../../assets/bgm/晴天/Fresh Focus.m4a'),
    cover: 'sunny-outline'
  },
  {
    id: 'sunny_3',
    title: 'Happy Ukulele',
    category: 'Sunny',
    source: require('../../assets/bgm/晴天/Happy Whistling Ukulele.m4a'),
    cover: 'sunny-outline'
  },
  {
    id: 'sunny_4',
    title: 'Palm and Soul',
    category: 'Sunny',
    source: require('../../assets/bgm/晴天/Palm and Soul.m4a'),
    cover: 'sunny-outline'
  },

  // Love (温馨)
  {
    id: 'love_1',
    title: 'Autumn Sunset',
    category: 'Love',
    source: require('../../assets/bgm/温馨/AutumnSunset.m4a'),
    cover: 'heart-outline'
  },
  {
    id: 'love_2',
    title: 'Inspiration',
    category: 'Love',
    source: require('../../assets/bgm/温馨/Inspiration.m4a'),
    cover: 'heart-outline'
  },
  {
    id: 'love_3',
    title: 'One Fine Day',
    category: 'Love',
    source: require('../../assets/bgm/温馨/OneFineDay.m4a'),
    cover: 'heart-outline'
  },
  {
    id: 'love_4',
    title: 'Ukulele Song',
    category: 'Love',
    source: require('../../assets/bgm/温馨/Ukulele Song.m4a'),
    cover: 'heart-outline'
  },

  // Rain (雨声)
  {
    id: 'rain_1',
    title: 'Isolation Waltz',
    category: 'Rain',
    source: require('../../assets/bgm/雨声/Isolation Waltz.m4a'),
    cover: 'rainy-outline'
  },
  {
    id: 'rain_2',
    title: 'Nostalgic Piano',
    category: 'Rain',
    source: require('../../assets/bgm/雨声/Nostalgic Piano.m4a'),
    cover: 'rainy-outline'
  },
  {
    id: 'rain_3',
    title: 'Better Days',
    category: 'Rain',
    source: require('../../assets/bgm/雨声/betterdays.m4a'),
    cover: 'rainy-outline'
  },
  {
    id: 'rain_4',
    title: 'Slow Life',
    category: 'Rain',
    source: require('../../assets/bgm/雨声/slowlife.m4a'),
    cover: 'rainy-outline'
  }
];
