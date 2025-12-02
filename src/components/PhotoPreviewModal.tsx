import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  FlatList, 
  Image, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator, 
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, TapGestureHandler, State, ScrollView } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { DayLog } from '../types/mood';
import { SPACING, FONTS, RADIUS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface PhotoPreviewModalProps {
    visible: boolean;
    initialDate: string;
    logs: DayLog[];
    onClose: () => void;
}

interface PhotoItemProps {
    item: DayLog;
    isActive: boolean;
    onClose: () => void;
    toggleControls: () => void;
}

const PhotoItem = React.memo(({ item, isActive, onClose, toggleControls }: PhotoItemProps) => {
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<ScrollView>(null);
    const doubleTapRef = useRef(null);
    const [isZoomed, setIsZoomed] = useState(false);

    // Reset zoom when slide changes
    useEffect(() => {
        if (!isActive && isZoomed) {
            scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
            setIsZoomed(false);
        }
    }, [isActive]);

    const handleDoubleTap = (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            if (isZoomed) {
                // Zoom out
                scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
                setIsZoomed(false);
            } else {
                // Zoom in (center of screen)
                const { x, y } = event.nativeEvent;
                // Simple zoom to center for now, or just 2x scale
                // Since we can't easily control scroll position without complex math, 
                // we'll just toggle a "zoomed" state that might affect rendering or 
                // use ScrollView's zoom features if available.
                setIsZoomed(true);
            }
        }
    };

    const handleSingleTap = () => {
        toggleControls();
    };

    // On Android/iOS, standard ScrollView allows zooming if maximumZoomScale > 1
    // We use React Native Gesture Handler's ScrollView which wraps native ScrollView
    
    return (
        <View style={styles.photoContainer}>
            <TapGestureHandler
                ref={doubleTapRef}
                numberOfTaps={2}
                onHandlerStateChange={handleDoubleTap}
            >
                <TapGestureHandler
                    numberOfTaps={1}
                    waitFor={doubleTapRef}
                    onHandlerStateChange={({ nativeEvent }) => {
                        if (nativeEvent.state === State.ACTIVE) handleSingleTap();
                    }}
                >
                    <ScrollView
                        ref={scrollRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        centerContent
                    >
                        <Image
                            source={{ uri: item.photoUri }}
                            style={[styles.photo, { width, height }]}
                            resizeMode="contain"
                            onLoadStart={() => setLoading(true)}
                            onLoadEnd={() => setLoading(false)}
                        />
                        {loading && (
                            <View style={styles.loader}>
                                <ActivityIndicator size="large" color="#fff" />
                            </View>
                        )}
                    </ScrollView>
                </TapGestureHandler>
            </TapGestureHandler>
        </View>
    );
});

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({ visible, initialDate, logs, onClose }) => {
    const { colors, language, t } = useSettings();
    // Filter logs to only those with photos and sort by date desc
    const photoLogs = useMemo(() => {
        return logs
            .filter(l => l.photoUri)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [logs]);

    const initialIndex = useMemo(() => {
        return photoLogs.findIndex(l => l.date === initialDate);
    }, [photoLogs, initialDate]);

    const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
    const [showControls, setShowControls] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (visible && initialIndex >= 0) {
            setCurrentIndex(initialIndex);
            // Wait for layout to scroll
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
            }, 100);
        }
    }, [visible, initialIndex]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const currentLog = photoLogs[currentIndex];

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
                <StatusBar hidden />
                
                <FlatList
                    ref={flatListRef}
                    data={photoLogs}
                    keyExtractor={item => item.date}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <PhotoItem 
                            item={item} 
                            isActive={index === currentIndex} 
                            onClose={onClose}
                            toggleControls={() => setShowControls(prev => !prev)}
                        />
                    )}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                    initialNumToRender={2}
                    windowSize={3}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                />

                {/* Top Bar (Close) */}
                {showControls && (
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Bottom Info Bar */}
                {showControls && currentLog && (
                    <View style={styles.bottomBar}>
                        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.bottomContent}>
                            <Text style={styles.dateText}>
                                {format(new Date(currentLog.date), language === 'zh' ? 'yyyy年M月d日 EEEE' : 'EEEE, MMMM do, yyyy', { locale: language === 'zh' ? zhCN : enUS })}
                            </Text>
                            {currentLog.note && (
                                <Text style={styles.noteText} numberOfLines={3}>
                                    {currentLog.note}
                                </Text>
                            )}
                        </View>
                    </View>
                )}
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    photoContainer: {
        width: width,
        height: height,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        width: width,
        height: height,
    },
    scrollContent: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height,
    },
    photo: {
        flex: 1,
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        zIndex: 10,
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    bottomContent: {
        padding: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
    },
    dateText: {
        color: '#fff',
        fontSize: 18,
        ...FONTS.bold,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    noteText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        lineHeight: 20,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
