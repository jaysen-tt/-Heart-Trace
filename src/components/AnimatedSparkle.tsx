import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';

const PARTICLES_COUNT = 8;

interface ParticleProps {
  index: number;
  color: string;
  size: number;
}

const Particle: React.FC<ParticleProps> = ({ index, color, size }) => {
  const angle = (index * 2 * Math.PI) / PARTICLES_COUNT;
  const radius = 40; // Explosion radius

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(angle) * radius]
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(angle) * radius]
  });

  const scale = anim.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 1, 0]
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
        {
            transform: [
                { translateX },
                { translateY },
                { scale }
            ],
            opacity: anim
        }
      ]}
    />
  );
};

interface SparkleProps {
  color: string;
  onComplete?: () => void;
}

export const AnimatedSparkle: React.FC<SparkleProps> = ({ color, onComplete }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: PARTICLES_COUNT }).map((_, i) => (
        <Particle key={i} index={i} color={color} size={8 + Math.random() * 6} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
  },
});
