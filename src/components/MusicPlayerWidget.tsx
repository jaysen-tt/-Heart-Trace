import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager, ScrollView, Linking, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { RADIUS, SPACING, FONTS } from '../constants/theme';
import { ATMOSPHERE_TRACKS, Track } from '../constants/audio';
import { useSettings } from '../context/SettingsContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Android 3rd Party Music Players Intent Uris
const ANDROID_MUSIC_PLAYERS = [
    { name: '网易云音乐', package: 'com.netease.cloudmusic', uri: 'orpheus://' },
    { name: 'QQ音乐', package: 'com.tencent.qqmusic', uri: 'qqmusic://' },
    { name: 'Spotify', package: 'com.spotify.music', uri: 'spotify://' },
    { name: 'Apple Music', package: 'com.apple.android.music', uri: 'music://' },
];

const COLLAPSED_HEIGHT = 60;
const EXPANDED_HEIGHT = 160; 

const CATEGORIES = [
    { id: 'Focus', icon: 'leaf-outline', label: 'music_cat_focus' },
    { id: 'Sunny', icon: 'sunny-outline', label: 'music_cat_sunny' },
    { id: 'Love', icon: 'heart-outline', label: 'music_cat_love' },
    { id: 'Rain', icon: 'rainy-outline', label: 'music_cat_rain' },
] as const;

export const MusicPlayerWidget = () => {
  const { colors, t } = useSettings();
  const [expanded, setExpanded] = useState(false);
  // Default to first track selected but not playing
  const [currentTrack, setCurrentTrack] = useState<Track | null>(ATMOSPHERE_TRACKS[0]);
  const [currentCategory, setCurrentCategory] = useState<string>('Focus');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentCategoryRef = useRef<string>('Focus');
  const isPlayingRef = useRef(false);
  const playbackGenRef = useRef(0);
  const isMountedRef = useRef(true);

  const heightAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
      currentCategoryRef.current = currentCategory;
  }, [currentCategory]);

  useEffect(() => {
      isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: expanded ? COLLAPSED_HEIGHT : EXPANDED_HEIGHT,
        friction: 9,
        useNativeDriver: false 
      }),
      Animated.timing(contentOpacity, {
        toValue: expanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  const togglePlayback = async (e?: any) => {
    e?.stopPropagation(); 
    
    if (Platform.OS === 'android') {
        // Android Logic: Launch 3rd Party Music App
        const supportedApps = [
            { name: '网易云音乐', url: 'orpheus://' },
            { name: 'QQ音乐', url: 'qqmusic://' },
            { name: 'Spotify', url: 'spotify://' },
        ];

        Alert.alert(
            '选择音乐播放器',
            '跳转到第三方应用播放背景音乐',
            [
                ...supportedApps.map(app => ({
                    text: app.name,
                    onPress: async () => {
                        try {
                            await Linking.openURL(app.url);
                        } catch (err) {
                            Alert.alert('无法打开', `请检查是否安装了${app.name}`);
                        }
                    }
                })),
                { text: '取消', style: 'cancel' }
            ]
        );
        return;
    }
    
    if (soundRef.current) {
        if (isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
        } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
        }
    } else {
        // If no sound object yet (initial load), play a random track from current category
        await playRandomTrack(currentCategory);
    }
  };

  const playRandomTrack = async (category: string) => {
       const myGen = ++playbackGenRef.current;
       try {
           setIsLoading(true);
           
           const categoryTracks = ATMOSPHERE_TRACKS.filter(t => t.category === category);
           if (categoryTracks.length === 0) {
               setIsLoading(false);
               return;
           }
 
           // Pick a random track
           let nextTrack = categoryTracks[Math.floor(Math.random() * categoryTracks.length)];
           
           // Try to pick a different track if possible
           if (currentTrack && categoryTracks.length > 1 && nextTrack.id === currentTrack.id) {
              const otherTracks = categoryTracks.filter(t => t.id !== currentTrack.id);
              nextTrack = otherTracks[Math.floor(Math.random() * otherTracks.length)];
           }
 
           if (soundRef.current) {
               try {
                   await soundRef.current.unloadAsync();
               } catch (e) {
                   // Ignore unload errors
               }
           }
 
           if (myGen !== playbackGenRef.current) return;

           setCurrentTrack(nextTrack);
           setCurrentCategory(category);
 
           await Audio.setAudioModeAsync({
               playsInSilentModeIOS: true,
               staysActiveInBackground: true,
           });
 
           const { sound: newSound } = await Audio.Sound.createAsync(
               nextTrack.source,
               { shouldPlay: true, isLooping: false }
           );

           if (myGen !== playbackGenRef.current || !isMountedRef.current) {
               await newSound.unloadAsync();
               return;
           }
 
           // Setup loop logic
           newSound.setOnPlaybackStatusUpdate(async (status) => {
               if (status.isLoaded && status.didJustFinish) {
                   // Play next random song from SAME category
                   await playRandomTrack(currentCategoryRef.current);
               }
           });
           
           soundRef.current = newSound;
           setSound(newSound);
           setIsPlaying(true);
           setIsLoading(false);
 
       } catch (error) {
           console.log('Error playing sound', error);
           if (myGen === playbackGenRef.current) {
               setIsLoading(false);
           }
       }
   };

  const handleCategorySelect = (category: string) => {
      // If clicking the active category, just toggle play/pause if it's already playing?
      // Or should it shuffle to a new song?
      // Usually clicking a category means "Play this category".
      // If already playing this category, maybe just ensure it's playing.
      
      if (currentCategory === category && soundRef.current) {
          if (!isPlaying) {
              togglePlayback();
          }
          return;
      }

      // New category selected
      playRandomTrack(category);
  };

  const getStatusText = () => {
      if (!currentTrack) return t('music_choose');
      if (isPlaying) return `${t('music_playing')}: ${currentTrack.title}`;
      return `${sound ? t('music_paused') : t('music_ready')}: ${currentTrack.title}`;
  };

  return (
    <Animated.View style={[styles.container, { height: heightAnim, backgroundColor: colors.surface, borderColor: colors.border }]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      
      {/* Top Bar */}
      <TouchableOpacity activeOpacity={0.9} onPress={toggleExpand} style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons 
            name={isPlaying ? "musical-notes" : "headset-outline"} 
            size={20} 
            color={isPlaying ? colors.todayIndicator : colors.textSecondary} 
          />
          <Text style={[styles.miniTitle, { color: colors.text }]}>
            {getStatusText()}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
            {/* Always visible Play/Pause Toggle */}
            <TouchableOpacity 
                onPress={togglePlayback} 
                style={[styles.miniPlayBtn, { backgroundColor: colors.surfaceHighlight }]} 
                hitSlop={10}
                disabled={isLoading}
            >
                {isLoading ? (
                    <View style={[styles.loadingDot, { backgroundColor: colors.textSecondary }]} />
                ) : (
                    <Ionicons 
                        name={isPlaying ? "pause" : "play"} 
                        size={18} 
                        color={colors.text} 
                        style={{ marginLeft: isPlaying ? 0 : 2 }} // Visual centering adjustment
                    />
                )}
            </TouchableOpacity>

            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      <Animated.View style={[styles.expandedContent, { opacity: contentOpacity }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            {CATEGORIES.map((cat) => {
                const isActive = currentCategory === cat.id;
                return (
                    <TouchableOpacity 
                        key={cat.id} 
                        style={[styles.trackItem, isActive && styles.trackItemActive]}
                        onPress={() => handleCategorySelect(cat.id)}
                    >
                        <View style={[
                            styles.iconCircle, 
                            { backgroundColor: colors.surfaceHighlight, borderColor: colors.border },
                            isActive && { backgroundColor: colors.todayIndicator, borderColor: colors.todayIndicator }
                        ]}>
                            <Ionicons 
                                name={isActive && isPlaying ? "pause" : cat.icon as any} 
                                size={24} 
                                color={isActive ? colors.background : colors.text} 
                            />
                        </View>
                        <Text style={[
                            styles.trackName, 
                            { color: colors.textSecondary },
                            isActive && { color: colors.text, fontWeight: 'bold' }
                        ]}>
                            {t(cat.label as any)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    overflow: 'hidden',
    zIndex: 100,
    borderBottomWidth: 1,
  },
  header: {
    height: COLLAPSED_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md
  },
  miniTitle: {
    fontSize: 13,
    ...FONTS.medium,
  },
  miniPlayBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
  },
  loadingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
  },
  expandedContent: {
    height: EXPANDED_HEIGHT - COLLAPSED_HEIGHT,
    paddingTop: SPACING.xs,
  },
  scrollContainer: {
      paddingHorizontal: SPACING.lg,
      gap: SPACING.lg,
      alignItems: 'center',
  },
  trackItem: {
      alignItems: 'center',
      gap: SPACING.xs,
  },
  trackItemActive: {
      transform: [{scale: 1.05}]
  },
  iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
  },
  trackName: {
      fontSize: 12,
      ...FONTS.medium
  },
});
