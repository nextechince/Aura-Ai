// src/screens/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Switch,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Voice from 'react-native-voice';
import { useStore } from '../store';
import { VoiceService } from '../services/VoiceService';
import { PremiumBadge } from '../components/PremiumBadge';
import { FeatureCard } from '../components/FeatureCard';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { isPremium, isListening, setIsListening } = useStore();
  const [voiceText, setVoiceText] = useState('');
  const [response, setResponse] = useState('Say "Hey Aura" to wake me');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWakeListening, setIsWakeListening] = useState(true);
  
  const waveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const voiceService = new VoiceService();

  useEffect(() => {
    // Start voice service
    voiceService.init();
    voiceService.setCallbacks({
      onWakeWord: () => handleWakeWord(),
      onSpeechResults: (text) => handleSpeechResults(text),
      onSpeechError: (error) => handleSpeechError(error)
    });

    // Start background listening for wake word
    if (isWakeListening) {
      voiceService.startWakeDetection();
    }

    // Animate pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();

    return () => {
      voiceService.stopWakeDetection();
      voiceService.destroy();
    };
  }, []);

  const handleWakeWord = () => {
    setIsListening(true);
    setResponse('🎤 Listening...');
    
    // Haptic feedback
    Vibration.vibrate(100);
    
    // Start voice recognition
    voiceService.startListening();
  };

  const handleSpeechResults = async (text) => {
    setVoiceText(text);
    setResponse('⚡ Processing...');
    setIsProcessing(true);

    try {
      // Process the command
      const result = await voiceService.processCommand(text);
      setResponse(result.message);
      
      // Execute action if needed
      if (result.action) {
        await executeAction(result.action, result.data);
      }
    } catch (error) {
      setResponse('❌ Sorry, I didn\'t understand. Please try again.');
    }

    setIsProcessing(false);
    setIsListening(false);
  };

  const handleSpeechError = (error) => {
    setResponse('❌ Could not hear you. Try again.');
    setIsListening(false);
    setIsProcessing(false);
  };

  const executeAction = async (action, data) => {
    switch (action) {
      case 'CALL':
        // Handle call
        break;
      case 'OPEN_APP':
        // Handle open app
        break;
      case 'GENERATE_CODE':
        navigation.navigate('Code');
        break;
      case 'WHATSAPP':
        navigation.navigate('Automation', { platform: 'whatsapp' });
        break;
      default:
        break;
    }
  };

  // Quick action items
  const quickActions = [
    { icon: '💻', label: 'Generate Code', screen: 'Code' },
    { icon: '📱', label: 'WhatsApp', screen: 'Automation' },
    { icon: '📨', label: 'Telegram', screen: 'Automation' },
    { icon: '🎨', label: 'AI Image', screen: 'AI' },
    { icon: '🔊', label: 'Find Phone', action: 'ring' },
    { icon: '⚡', label: 'Automate', screen: 'Automation' },
  ];

  const features = [
    { icon: '💻', name: 'Code Generator', premium: true },
    { icon: '🤖', name: 'AI Chat', premium: false },
    { icon: '📱', name: 'WhatsApp', premium: true },
    { icon: '📨', name: 'Telegram', premium: true },
    { icon: '🎤', name: 'Voice Wake', premium: false },
    { icon: '🏠', name: 'Smart Home', premium: true },
  ];

  return (
    <LinearGradient colors={['#0A0A0F', '#141420']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>🔮 Aura AI</Text>
          {isPremium && <PremiumBadge />}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.statusIndicator}
            onPress={() => setIsWakeListening(!isWakeListening)}
          >
            <View style={[styles.statusDot, isWakeListening && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {isWakeListening ? 'Listening' : 'Muted'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Status */}
      <View style={styles.voiceStatus}>
        <Animated.View style={[styles.voiceIcon, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.voiceIconText}>
            {isListening ? '🎤' : '🔮'}
          </Text>
        </Animated.View>
        <Text style={styles.voiceText}>{response}</Text>
        {isProcessing && (
          <View style={styles.processingIndicator}>
            <View style={styles.processingDot} />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickActions}
        contentContainerStyle={styles.quickActionsContent}
      >
        {quickActions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickAction}
            onPress={() => {
              if (item.screen) {
                navigation.navigate(item.screen);
              } else if (item.action === 'ring') {
                Alert.alert('🔊 Find My Phone', 'Ringing your phone...');
              }
            }}
          >
            <Text style={styles.quickActionIcon}>{item.icon}</Text>
            <Text style={styles.quickActionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Features Grid */}
      <Text style={styles.sectionTitle}>✨ All Features</Text>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.featuresGrid}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            name={feature.name}
            premium={feature.premium}
            isPremium={isPremium}
            onPress={() => {
              if (feature.premium && !isPremium) {
                navigation.navigate('Premium');
              } else {
                // Navigate to feature
              }
            }}
          />
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6A6A80'
  },
  statusDotActive: {
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
    shadowRadius: 8,
    shadowOpacity: 0.5
  },
  statusText: {
    color: '#9A9AB0',
    fontSize: 12,
    fontWeight: '500'
  },
  settingsBtn: {
    padding: 8
  },
  voiceStatus: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20
  },
  voiceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(123,97,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  voiceIconText: {
    fontSize: 36
  },
  voiceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8
  },
  processingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7B61FF',
    animation: 'pulse 1s infinite'
  },
  processingText: {
    color: '#9A9AB0',
    fontSize: 12
  },
  quickActions: {
    marginBottom: 20
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 12
  },
  quickAction: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minWidth: 80
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 4
  },
  quickActionLabel: {
    color: '#9A9AB0',
    fontSize: 12,
    fontWeight: '500'
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  featuresGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
});

export default HomeScreen;
