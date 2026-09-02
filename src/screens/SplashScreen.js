// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.linear
        })
      )
    ]).start();

    // Navigate to home after 3 seconds
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <LinearGradient
      colors={['#0A0A0F', '#141420']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Text style={styles.icon}>🔮</Text>
        </Animated.View>
        
        <Text style={styles.title}>
          Aura <Text style={styles.gradientText}>AI</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Your Smart Voice Assistant
        </Text>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  width: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        </View>

        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 80,
    marginBottom: 20
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8
  },
  gradientText: {
    color: '#7B61FF'
  },
  subtitle: {
    fontSize: 16,
    color: '#9A9AB0',
    marginBottom: 40
  },
  loadingContainer: {
    width: width * 0.6,
    marginTop: 20
  },
  loadingBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#7B61FF',
    borderRadius: 2
  },
  version: {
    color: '#6A6A80',
    fontSize: 12,
    marginTop: 16
  }
});

export default SplashScreen;
