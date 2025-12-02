import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { PALETTE } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = 200; // Target size of the composed logo

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationComplete }) => {
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Scale animations for "pop" effect
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Slide Animations (Start from edges)
  // Yellow (Bottom Left)
  const yellowAnim = useRef(new Animated.ValueXY({ x: -width/2, y: height/2 })).current;
  // Orange (Top Left)
  const orangeAnim = useRef(new Animated.ValueXY({ x: -width/2, y: -height/2 })).current;
  // GreenDark (Top Right)
  const greenDarkAnim = useRef(new Animated.ValueXY({ x: width/2, y: -height/2 })).current;
  // Blue (Bottom Right)
  const blueAnim = useRef(new Animated.ValueXY({ x: width/2, y: height/2 })).current;
  // GreenLight (Center Top)
  const greenLightAnim = useRef(new Animated.ValueXY({ x: 0, y: -height/2 })).current;

  useEffect(() => {
    // Sequence:
    // 1. Spring all parts to center with bouncy physics
    // 2. Pause briefly
    // 3. Fade out
    
    const springConfig = {
      toValue: { x: 0, y: 0 },
      friction: 5,    // Lower friction = more bounce
      tension: 30,    // Lower tension = slower, softer spring
      useNativeDriver: true,
    };
    
    // Slightly different timings for "organic" feel
    const makeSpring = (anim: Animated.ValueXY, delay = 0) => {
        return Animated.sequence([
            Animated.delay(delay),
            Animated.spring(anim, {
                ...springConfig,
                // Randomize slightly for organic feel
                friction: 4 + Math.random() * 2,
                tension: 30 + Math.random() * 10,
            })
        ]);
    };

    Animated.sequence([
      Animated.delay(100), // Quick start
      Animated.parallel([
        // Scale up the whole container slightly as they gather
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
        }),
        // Staggered entrance for "squeezing in" effect
        makeSpring(greenDarkAnim, 0),    // Back layer first
        makeSpring(orangeAnim, 50),      // Then middle layers
        makeSpring(greenLightAnim, 100),
        makeSpring(blueAnim, 150),       // Front layers last
        makeSpring(yellowAnim, 200),
      ]),
      Animated.delay(800), // Hold the logo
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onAnimationComplete();
      }
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
        {/* Layer Order (Back to Front) based on user feedback */}
        
        {/* 1. Green Dark (Top Right) - Backmost */}
        <Animated.View style={[
          styles.imageWrapper, 
          { transform: greenDarkAnim.getTranslateTransform(), zIndex: 1, top: -25, right: -25 }
        ]}>
          <Image source={require('../../assets/splash-parts/GreenDark.png')} style={styles.image} resizeMode="contain" />
        </Animated.View>

        {/* 2. Orange (Top Left) - Behind Center */}
        <Animated.View style={[
          styles.imageWrapper, 
          { transform: orangeAnim.getTranslateTransform(), zIndex: 2, top: 10, left: 0 }
        ]}>
          <Image source={require('../../assets/splash-parts/Orange.png')} style={styles.image} resizeMode="contain" />
        </Animated.View>

        {/* 3. Green Light (Center) - Sits in middle, above Orange/DarkGreen, below Blue/Yellow */}
        <Animated.View style={[
          styles.imageWrapper, 
          { transform: greenLightAnim.getTranslateTransform(), zIndex: 3, top: 25, left: 45 } 
        ]}>
          <Image source={require('../../assets/splash-parts/GreenLight.png')} style={styles.image} resizeMode="contain" />
        </Animated.View>

        {/* 4. Blue (Bottom Right) - Front of Center */}
        <Animated.View style={[
          styles.imageWrapper, 
          { transform: blueAnim.getTranslateTransform(), zIndex: 4, bottom: -20, right: -20 }
        ]}>
          <Image source={require('../../assets/splash-parts/Blue.png')} style={styles.image} resizeMode="contain" />
        </Animated.View>

        {/* 5. Yellow (Bottom Left) - Frontmost (Top layer) */}
        <Animated.View style={[
          styles.imageWrapper, 
          { transform: yellowAnim.getTranslateTransform(), zIndex: 5, bottom: 0, left: 0 }
        ]}>
          <Image source={require('../../assets/splash-parts/Yellow.png')} style={styles.image} resizeMode="contain" />
        </Animated.View>

      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F2F1E9', // Beige background
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    position: 'relative',
  },
  imageWrapper: {
    position: 'absolute',
    width: 120, // Approximate size for each blob
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
