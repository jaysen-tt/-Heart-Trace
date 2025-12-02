import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { RADIUS } from '../constants/theme';

interface MoodLiveBackgroundProps {
  color: string;
  intensity?: number;
  theme?: 'light' | 'dark';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Approx card width

// Animated Circle for SVG
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const MoodLiveBackground: React.FC<MoodLiveBackgroundProps> = ({ 
  color,
  intensity = 0.6,
  theme = 'dark' // Default to dark if not provided
}) => {
  // Animation Values for Blob 1
  const blob1Anim = useRef(new Animated.Value(0)).current;
  // Animation Values for Blob 2
  const blob2Anim = useRef(new Animated.Value(0)).current;
  // Animation Values for Blob 3
  const blob3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, duration: number) => {
        return Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1,
                    duration: duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: Platform.OS === 'ios', // Native driver works for Views on iOS, but SVG props need non-native on Android usually? 
                    // Actually, react-native-svg supports native driver for some transforms, but for props like 'cx' it might not.
                    // Let's try useNativeDriver: false for SVG props just to be safe on Android, or check documentation.
                    // For safety on Android SVG animation, false is better.
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: Platform.OS === 'ios',
                })
            ])
        );
    };

    Animated.parallel([
        createLoop(blob1Anim, 4000),
        createLoop(blob2Anim, 6000),
        createLoop(blob3Anim, 5000),
    ]).start();
  }, []);

  if (Platform.OS === 'android') {
      return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                    <RadialGradient
                        id="grad"
                        cx="50%"
                        cy="50%"
                        rx="50%"
                        ry="50%"
                        fx="50%"
                        fy="50%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor={color} stopOpacity={0.8 * intensity} />
                        <Stop offset="100%" stopColor={color} stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                
                {/* Blob 1 */}
                <AnimatedCircle
                    cx={blob1Anim.interpolate({ inputRange: [0, 1], outputRange: ['20%', '80%'] })}
                    cy={blob1Anim.interpolate({ inputRange: [0, 1], outputRange: ['20%', '50%'] })}
                    r={blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [100, 120] })}
                    fill="url(#grad)"
                />
                
                {/* Blob 2 */}
                <AnimatedCircle
                    cx={blob2Anim.interpolate({ inputRange: [0, 1], outputRange: ['80%', '30%'] })}
                    cy={blob2Anim.interpolate({ inputRange: [0, 1], outputRange: ['80%', '40%'] })}
                    r={blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [120, 150] })}
                    fill="url(#grad)"
                />

                {/* Blob 3 */}
                <AnimatedCircle
                    cx={blob3Anim.interpolate({ inputRange: [0, 1], outputRange: ['50%', '50%'] })}
                    cy={blob3Anim.interpolate({ inputRange: [0, 1], outputRange: ['60%', '20%'] })}
                    r={blob3Anim.interpolate({ inputRange: [0, 1], outputRange: [90, 130] })}
                    fill="url(#grad)"
                />
            </Svg>
            {/* Optional Overlay for Theme blending if needed */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme === 'dark' ? '#000' : '#fff', opacity: 0.1 }]} />
        </View>
      );
  }

  const blob1Style = {
      transform: [
          {
              translateX: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100]
              })
          },
          {
              translateY: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50]
              })
          },
          {
              scale: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2]
              })
          }
      ]
  };

  const blob2Style = {
      transform: [
          {
              translateX: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -80]
              })
          },
          {
              translateY: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -40]
              })
          },
          {
              scale: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.3]
              })
          }
      ]
  };

  const blob3Style = {
      transform: [
          {
              translateX: blob3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 20]
              })
          },
          {
              translateY: blob3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, -20]
              })
          }
      ]
  };

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        {/* Base Background - slightly colored */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: 0.05 }]} />

        {/* Blobs */}
        <Animated.View 
            style={[
                styles.blob, 
                { backgroundColor: color, opacity: 0.4 * intensity, top: -50, left: -50 },
                blob1Style
            ]} 
        />
        <Animated.View 
            style={[
                styles.blob, 
                { backgroundColor: color, opacity: 0.3 * intensity, bottom: -50, right: -50 },
                blob2Style
            ]} 
        />
        <Animated.View 
            style={[
                styles.blob, 
                { backgroundColor: color, opacity: 0.2 * intensity, top: '30%', left: '30%' },
                blob3Style
            ]} 
        />

        {/* Glass Effect - Increased intensity for smoother fluid blend */}
        <BlurView intensity={100} tint={theme === 'dark' ? "dark" : "light"} style={StyleSheet.absoluteFill} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
  },
  blob: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
  }
});

