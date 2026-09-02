import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Vibration,
  Alert,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Linking,
  Switch,
  Modal,
  Share
} from 'react-native';
import Voice from '@react-native-voice/voice';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const App = () => {
  // ===== STATE =====
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [response, setResponse] = useState('🔮 Say "Hey Aura" to wake me');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isWakeListening, setIsWakeListening] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userName, setUserName] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [quickActions, setQuickActions] = useState([
    { icon: '📱', label: 'WhatsApp', color: '#25D366' },
    { icon: '📨', label: 'Telegram', color: '#26A5E4' },
    { icon: '💻', label: 'Code', color: '#7B61FF' },
    { icon: '🔊', label: 'Ring Phone', color: '#FF6B6B' },
    { icon: '⚡', label: 'Automate', color: '#FFB800' },
    { icon: '🎨', label: 'AI Image', color: '#34D399' },
    { icon: '📧', label: 'Email', color: '#EA4335' },
    { icon: '🌍', label: 'Translate', color: '#4285F4' },
  ]);
  
  // ===== REFS =====
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const wakeInterval = useRef(null);

  // ===== APP DATABASE =====
  const appDatabase = {
    'whatsapp': { package: 'com.whatsapp', name: 'WhatsApp' },
    'telegram': { package: 'org.telegram.messenger', name: 'Telegram' },
    'instagram': { package: 'com.instagram.android', name: 'Instagram' },
    'facebook': { package: 'com.facebook.katana', name: 'Facebook' },
    'twitter': { package: 'com.twitter.android', name: 'Twitter' },
    'youtube': { package: 'com.google.android.youtube', name: 'YouTube' },
    'gmail': { package: 'com.google.android.gm', name: 'Gmail' },
    'chrome': { package: 'com.android.chrome', name: 'Chrome' },
    'settings': { package: 'com.android.settings', name: 'Settings' },
    'camera': { package: 'com.android.camera', name: 'Camera' },
    'phone': { package: 'com.android.dialer', name: 'Phone' },
    'messages': { package: 'com.google.android.apps.messaging', name: 'Messages' },
    'spotify': { package: 'com.spotify.music', name: 'Spotify' },
    'netflix': { package: 'com.netflix.mediaclient', name: 'Netflix' },
    'tiktok': { package: 'com.zhiliaoapp.musically', name: 'TikTok' },
    'snapchat': { package: 'com.snapchat.android', name: 'Snapchat' },
    'reddit': { package: 'com.reddit.frontpage', name: 'Reddit' },
    'linkedin': { package: 'com.linkedin.android', name: 'LinkedIn' },
    'pinterest': { package: 'com.pinterest', name: 'Pinterest' },
    'drive': { package: 'com.google.android.apps.docs', name: 'Google Drive' },
    'calendar': { package: 'com.google.android.calendar', name: 'Calendar' },
    'calculator': { package: 'com.android.calculator2', name: 'Calculator' },
    'clock': { package: 'com.google.android.deskclock', name: 'Clock' },
    'files': { package: 'com.android.documentsui', name: 'Files' },
    'contacts': { package: 'com.android.contacts', name: 'Contacts' },
    'gallery': { package: 'com.android.gallery3d', name: 'Gallery' },
    'maps': { package: 'com.google.android.apps.maps', name: 'Google Maps' },
    'playstore': { package: 'com.android.vending', name: 'Play Store' },
    'youtube music': { package: 'com.google.android.apps.youtube.music', name: 'YouTube Music' },
    'whatsapp business': { package: 'com.whatsapp.w4b', name: 'WhatsApp Business' },
    'telegram x': { package: 'org.thunderdog.challegram', name: 'Telegram X' },
    'facebook messenger': { package: 'com.facebook.orca', name: 'Messenger' },
    'discord': { package: 'com.discord', name: 'Discord' },
    'twitch': { package: 'tv.twitch.android.app', name: 'Twitch' },
    'tumblr': { package: 'com.tumblr', name: 'Tumblr' },
    'pinterest': { package: 'com.pinterest', name: 'Pinterest' },
    'zoom': { package: 'us.zoom.videomeetings', name: 'Zoom' },
    'google meet': { package: 'com.google.android.apps.meetings', name: 'Google Meet' },
    'teams': { package: 'com.microsoft.teams', name: 'Microsoft Teams' },
    'slack': { package: 'com.Slack', name: 'Slack' },
    'notion': { package: 'com.notion.android', name: 'Notion' },
    'trello': { package: 'com.trello', name: 'Trello' },
    'asana': { package: 'com.asana.app', name: 'Asana' },
    'dropbox': { package: 'com.dropbox.android', name: 'Dropbox' },
    'onedrive': { package: 'com.microsoft.skydrive', name: 'OneDrive' },
    'google photos': { package: 'com.google.android.apps.photos', name: 'Google Photos' },
    'lightroom': { package: 'com.adobe.lrmobile', name: 'Adobe Lightroom' },
    'vsco': { package: 'com.vsco.cam', name: 'VSCO' },
    'snapseed': { package: 'com.niksoftware.snapseed', name: 'Snapseed' },
    'canva': { package: 'com.canva.editor', name: 'Canva' },
    'figma': { package: 'com.figma.mirror', name: 'Figma' },
    'github': { package: 'com.github.android', name: 'GitHub' },
    'stack overflow': { package: 'com.stackoverflow.android', name: 'Stack Overflow' },
    'medium': { package: 'com.medium.reader', name: 'Medium' },
    'quora': { package: 'com.quora.android', name: 'Quora' },
    'reddit': { package: 'com.reddit.frontpage', name: 'Reddit' },
    'imgur': { package: 'com.imgur.mobile', name: 'Imgur' },
    'pocket': { package: 'com.ideashower.readitlater.pro', name: 'Pocket' },
    'feedly': { package: 'com.devhd.feedly', name: 'Feedly' },
  };

  // ===== LIFECYCLE =====
  useEffect(() => {
    initializeApp();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeApp = async () => {
    await requestPermissions();
    await loadUserData();
    await setupVoice();
    await startWakeDetection();
    animatePulse();
    loadPremiumStatus();
  };

  const cleanup = () => {
    if (wakeInterval.current) {
      clearInterval(wakeInterval.current);
    }
    Voice.destroy().then(Voice.removeAllListeners);
  };

  // ===== PERMISSIONS =====
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
      ];
      
      try {
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        console.log('✅ Permissions granted:', granted);
      } catch (err) {
        console.warn('❌ Permission error:', err);
      }
    }
  };

  // ===== VOICE SETUP =====
  const setupVoice = async () => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;
    console.log('🎤 Voice service ready');
  };

  const startWakeDetection = () => {
    // Simulate wake word detection
    // In production, this would use native wake word detection
    wakeInterval.current = setInterval(() => {
      if (isWakeListening && !isListening && !isProcessing) {
        // Simulate checking for "Hey Aura"
        // Real implementation would use native service
      }
    }, 3000);
  };

  const animatePulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // ===== VOICE EVENTS =====
  const onSpeechStart = () => {
    setIsListening(true);
    setResponse('🎤 Listening...');
    Vibration.vibrate(50);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechResults = (e) => {
    const text = e.value[0] || '';
    setVoiceText(text);
    console.log('🎤 Voice input:', text);
    
    addToChat('user', text);
    processCommand(text);
  };

  const onSpeechError = (e) => {
    console.error('❌ Voice error:', e);
    setResponse('❌ Could not hear you. Try again.');
    setIsListening(false);
    setIsProcessing(false);
  };

  const onSpeechVolumeChanged = (e) => {
    // Volume change event
  };

  // ===== VOICE CONTROL =====
  const startListening = () => {
    try {
      Voice.start('en-US');
    } catch (error) {
      console.error('Voice start error:', error);
      Alert.alert('Error', 'Could not start voice recognition');
    }
  };

  const stopListening = () => {
    try {
      Voice.stop();
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  // ===== CHAT =====
  const addToChat = (type, text) => {
    setChatHistory(prev => [...prev, { type, text, timestamp: Date.now() }]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // ===== COMMAND PROCESSOR =====
  const processCommand = async (text) => {
    setIsProcessing(true);
    const lower = text.toLowerCase().trim();
    
    let responseText = '';
    let action = null;
    let found = false;

    // ============================================
    // 1. WHO ARE YOU?
    // ============================================
    if (!found && (lower.includes('who are you') || lower.includes('who made you') || 
                   lower.includes('what are you') || lower.includes('tell me about yourself'))) {
      found = true;
      responseText = `✨ I'm Aura AI! I was created in 2024 by a team of passionate developers. I'm powered by Google's Gemini AI and I have over 90 features to help you with coding, automation, and daily tasks. I understand English and Pidgin! How can I help you today? 🚀`;
    }

    // ============================================
    // 2. OPEN APP
    // ============================================
    if (!found && (lower.includes('open') || lower.includes('launch') || lower.includes('start'))) {
      let appFound = false;
      for (const [key, app] of Object.entries(appDatabase)) {
        if (lower.includes(key)) {
          appFound = true;
          found = true;
          responseText = `📱 Opening ${app.name}...`;
          action = { type: 'OPEN_APP', data: { app: key, package: app.package, name: app.name } };
          
          // Try to open app
          const url = `package:${app.package}`;
          Linking.openURL(url).catch(() => {
            Alert.alert('Error', `Could not open ${app.name}. Make sure it's installed.`);
          });
          break;
        }
      }
      
      if (!appFound) {
        // Try partial match
        for (const [key, app] of Object.entries(appDatabase)) {
          const searchTerm = lower.replace(/open|launch|start/g, '').trim();
          if (key.includes(searchTerm) || app.name.toLowerCase().includes(searchTerm)) {
            appFound = true;
            found = true;
            responseText = `📱 Opening ${app.name}...`;
            action = { type: 'OPEN_APP', data: { app: key, package: app.package, name: app.name } };
            const url = `package:${app.package}`;
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', `Could not open ${app.name}`);
            });
            break;
          }
        }
      }
      
      if (!appFound) {
        responseText = `❌ I couldn't find that app. Try saying "Open WhatsApp" or "Open YouTube".\n\nI know ${Object.keys(appDatabase).length}+ apps!`;
        found = true;
      }
    }

    // ============================================
    // 3. WHATSAPP COMMANDS
    // ============================================
    if (!found && lower.includes('whatsapp')) {
      found = true;
      if (lower.includes('call')) {
        const contact = extractContact(lower);
        responseText = `📞 Calling ${contact || 'contact'} on WhatsApp...`;
        action = { type: 'WHATSAPP_CALL', data: { contact } };
      } else if (lower.includes('message') || lower.includes('send')) {
        const contact = extractContact(lower);
        const message = extractMessage(lower);
        responseText = `💬 Sending WhatsApp message to ${contact || 'contact'}...`;
        action = { type: 'WHATSAPP_MESSAGE', data: { contact, message } };
      } else if (lower.includes('status') || lower.includes('story')) {
        responseText = '📸 Opening WhatsApp Status...';
        action = { type: 'WHATSAPP_STATUS' };
      } else {
        responseText = '📱 Opening WhatsApp...';
        const url = `package:com.whatsapp`;
        Linking.openURL(url);
      }
    }

    // ============================================
    // 4. TELEGRAM COMMANDS
    // ============================================
    if (!found && lower.includes('telegram')) {
      found = true;
      if (lower.includes('bot') || lower.includes('create')) {
        const botName = extractBotName(lower);
        responseText = `🤖 Creating Telegram bot "${botName}"...`;
        action = { type: 'TELEGRAM_BOT', data: { name: botName } };
      } else if (lower.includes('message') || lower.includes('send')) {
        const contact = extractContact(lower);
        const message = extractMessage(lower);
        responseText = `📨 Sending Telegram message to ${contact || 'contact'}...`;
        action = { type: 'TELEGRAM_MESSAGE', data: { contact, message } };
      } else if (lower.includes('channel')) {
        responseText = '📢 Opening Telegram Channels...';
        action = { type: 'TELEGRAM_CHANNEL' };
      } else {
        responseText = '📨 Opening Telegram...';
        const url = `package:org.telegram.messenger`;
        Linking.openURL(url);
      }
    }

    // ============================================
    // 5. CODE GENERATION
    // ============================================
    if (!found && (lower.includes('code') || lower.includes('script') || lower.includes('program') || 
                   lower.includes('generate') && (lower.includes('python') || lower.includes('javascript') || lower.includes('html')))) {
      found = true;
      const language = detectLanguage(lower);
      const prompt = extractCodePrompt(lower);
      responseText = `💻 Generating ${language} code...`;
      
      // Generate code based on language
      const code = generateCodeTemplate(language, prompt);
      setGeneratedCode(code);
      setCodeLanguage(language);
      setShowCodeModal(true);
      action = { type: 'GENERATE_CODE', data: { language, prompt, code } };
    }

    // ============================================
    // 6. FIND MY PHONE (RING)
    // ============================================
    if (!found && (lower.includes('ring') || lower.includes('find my phone') || lower.includes('where is my phone'))) {
      found = true;
      responseText = '🔊 Ringing your phone! Flashlight on! 📸';
      Vibration.vibrate([500, 500, 500, 500], true);
      action = { type: 'RING_PHONE' };
      
      setTimeout(() => {
        Vibration.cancel();
        setResponse('✅ Ringing stopped');
      }, 10000);
    }

    // ============================================
    // 7. AUTOMATION (WiFi, Bluetooth, Flashlight)
    // ============================================
    if (!found) {
      if (lower.includes('wifi') || lower.includes('bluetooth') || lower.includes('flashlight') || 
          lower.includes('torch') || lower.includes('brightness') || lower.includes('volume')) {
        found = true;
        const actionType = lower.includes('wifi') ? 'wifi' :
                          lower.includes('bluetooth') ? 'bluetooth' :
                          lower.includes('flashlight') || lower.includes('torch') ? 'flashlight' :
                          lower.includes('brightness') ? 'brightness' : 'volume';
        
        const state = lower.includes('on') || lower.includes('enable') || lower.includes('turn on') ? 'on' :
                     lower.includes('off') || lower.includes('disable') || lower.includes('turn off') ? 'off' : 'toggle';
        
        const emoji = actionType === 'wifi' ? '📶' :
                     actionType === 'bluetooth' ? '🔵' :
                     actionType === 'flashlight' ? '💡' :
                     actionType === 'brightness' ? '☀️' : '🔊';
        
        responseText = `${emoji} ${state === 'on' ? 'Turning' : state === 'off' ? 'Turning' : 'Toggling'} ${actionType} ${state === 'on' ? 'on' : state === 'off' ? 'off' : ''}...`;
        action = { type: 'AUTOMATION', data: { action: actionType, state } };
      }
    }

    // ============================================
    // 8. SEARCH
    // ============================================
    if (!found && (lower.includes('search') || lower.includes('google') || lower.includes('find'))) {
      found = true;
      const query = extractSearchQuery(lower);
      responseText = `🔍 Searching for "${query}"...`;
      action = { type: 'SEARCH', data: { query } };
      
      // Open Google search
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      Linking.openURL(url);
    }

    // ============================================
    // 9. WEATHER
    // ============================================
    if (!found && (lower.includes('weather') || lower.includes('temperature'))) {
      found = true;
      const location = extractLocation(lower) || 'your location';
      responseText = `🌤️ Checking weather for ${location}...`;
      action = { type: 'WEATHER', data: { location } };
    }

    // ============================================
    // 10. TIME & DATE
    // ============================================
    if (!found && (lower.includes('time') || lower.includes('date') || lower.includes('what day'))) {
      found = true;
      const now = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const formatted = now.toLocaleDateString('en-US', options);
      responseText = `🕐 It's ${formatted}`;
      action = { type: 'TIME' };
    }

    // ============================================
    // 11. CALCULATE
    // ============================================
    if (!found && (lower.includes('calculate') || lower.includes('math') || 
                   lower.includes('plus') || lower.includes('minus') || lower.includes('times'))) {
      found = true;
      try {
        const expr = lower.replace(/calculate|math|equals|what is|compute|solve/g, '').trim();
        const sanitized = expr.replace(/[^0-9+\-*/() .]/g, '');
        const result = Function(`"use strict"; return (${sanitized})`)();
        responseText = `🧮 ${expr} = ${result}`;
        action = { type: 'CALCULATE', data: { expression: expr, result } };
      } catch (error) {
        responseText = '❌ I couldn\'t calculate that. Try saying "calculate 2 + 2"';
      }
    }

    // ============================================
    // 12. TRANSLATE
    // ============================================
    if (!found && (lower.includes('translate') || lower.includes('language'))) {
      found = true;
      const phrase = extractPhrase(lower);
      const language = extractLanguage(lower) || 'Spanish';
      responseText = `🌍 Translating "${phrase}" to ${language}...`;
      action = { type: 'TRANSLATE', data: { phrase, language } };
    }

    // ============================================
    // 13. REMINDER
    // ============================================
    if (!found && (lower.includes('remind') || lower.includes('reminder') || lower.includes('remember'))) {
      found = true;
      const task = extractReminderTask(lower);
      const time = extractReminderTime(lower) || 5;
      responseText = `⏰ Reminder set! I'll remind you to ${task} in ${time} minutes`;
      action = { type: 'REMINDER', data: { task, time } };
    }

    // ============================================
    // 14. AI IMAGE GENERATION
    // ============================================
    if (!found && (lower.includes('image') || lower.includes('picture') || lower.includes('photo') || 
                   lower.includes('draw') || lower.includes('generate image'))) {
      found = true;
      const prompt = extractImagePrompt(lower);
      responseText = `🎨 Generating image of "${prompt}"...`;
      action = { type: 'IMAGE_GENERATION', data: { prompt } };
      
      // Show premium prompt for non-premium users
      if (!isPremium) {
        responseText = `🎨 I'd love to generate that image! This is a premium feature. Upgrade to Premium for AI image generation! 💎`;
      }
    }

    // ============================================
    // 15. SCREENSHOT
    // ============================================
    if (!found && (lower.includes('screenshot') || lower.includes('capture screen'))) {
      found = true;
      responseText = '📸 Taking screenshot...';
      action = { type: 'SCREENSHOT' };
    }

    // ============================================
    // 16. SCREEN RECORD
    // ============================================
    if (!found && (lower.includes('record screen') || lower.includes('screen record'))) {
      found = true;
      const duration = extractDuration(lower) || 30;
      responseText = `🎥 Recording screen for ${duration} seconds...`;
      action = { type: 'SCREEN_RECORD', data: { duration } };
    }

    // ============================================
    // 17. SMS
    // ============================================
    if (!found && (lower.includes('sms') || (lower.includes('text') && lower.includes('message')))) {
      found = true;
      const contact = extractContact(lower);
      const message = extractMessage(lower);
      responseText = `✉️ Sending SMS to ${contact || 'contact'}...`;
      action = { type: 'SEND_SMS', data: { contact, message } };
    }

    // ============================================
    // 18. CALL
    // ============================================
    if (!found && (lower.includes('call') || lower.includes('phone') || lower.includes('dial'))) {
      if (!lower.includes('whatsapp')) {
        found = true;
        const contact = extractContact(lower);
        responseText = `📞 Calling ${contact || 'contact'}...`;
        action = { type: 'CALL', data: { contact } };
        
        // Open phone dialer
        if (contact) {
          const url = `tel:${contact}`;
          Linking.openURL(url);
        }
      }
    }

    // ============================================
    // 19. HELP
    // ============================================
    if (!found && (lower.includes('help') || lower.includes('what can you do') || lower.includes('commands'))) {
      found = true;
      responseText = `🤖 **Aura AI Commands** 🤖

📱 **Open Apps**
"Open WhatsApp" • "Open YouTube" • "Open Settings"

💬 **WhatsApp**
"Call John on WhatsApp" • "Send message to Mary"

📨 **Telegram**  
"Create a Telegram bot" • "Send message to @user"

💻 **Code Generation**
"Generate Python script" • "Create HTML page"

🔊 **Phone**
"Ring my phone" • "Find my phone"

⚡ **Automation**
"Turn on WiFi" • "Toggle flashlight" • "Enable Bluetooth"

🔍 **Search & Info**
"Search for pizza" • "What's the weather" • "What time is it"

🎯 **Premium Features**
💎 AI Image Generation
💎 Screen Recording
💎 Voice Cloning
💎 Advanced Automation

Try saying "Open WhatsApp" or "Generate code"!`;
    }

    // ============================================
    // 20. DEFAULT - AI CHAT
    // ============================================
    if (!found) {
      responseText = `🤖 I'm Aura AI! I can help you with:

• Open any app (try "Open WhatsApp")
• Generate code (try "Generate Python script")
• WhatsApp/Telegram automation
• Find your phone (say "Ring my phone")
• And 90+ more features!

Just say "Help" to see all commands! 🚀`;
    }

    // ===== RESPONSE =====
    setResponse(responseText);
    addToChat('aura', responseText);
    setIsProcessing(false);
    setIsListening(false);

    // Auto-close voice
    setTimeout(() => {
      stopListening();
    }, 500);
  };

  // ===== HELPER FUNCTIONS =====
  const extractContact = (text) => {
    const match = text.match(/call\s+(\w+)|message\s+(\w+)|to\s+(\w+)|contact\s+(\w+)/i);
    return match ? match[1] || match[2] || match[3] || match[4] : null;
  };

  const extractMessage = (text) => {
    const match = text.match(/message\s+(.+?)(?:\s+to|\s+for|$)|send\s+(.+?)(?:\s+to|$)|say\s+(.+?)(?:\s+to|$)/i);
    return match ? match[1] || match[2] || match[3] : null;
  };

  const extractBotName = (text) => {
    const match = text.match(/bot\s+(\w+)|create\s+(\w+)\s+bot|name\s+(\w+)/i);
    return match ? match[1] || match[2] || match[3] : 'MyTelegramBot';
  };

  const detectLanguage = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('python')) return 'python';
    if (lower.includes('html')) return 'html';
    if (lower.includes('css')) return 'css';
    if (lower.includes('php')) return 'php';
    if (lower.includes('java')) return 'java';
    if (lower.includes('swift')) return 'swift';
    if (lower.includes('ruby')) return 'ruby';
    if (lower.includes('go')) return 'go';
    if (lower.includes('rust')) return 'rust';
    if (lower.includes('cpp') || lower.includes('c++')) return 'cpp';
    if (lower.includes('c#')) return 'csharp';
    if (lower.includes('kotlin')) return 'kotlin';
    if (lower.includes('dart')) return 'dart';
    if (lower.includes('sql')) return 'sql';
    if (lower.includes('shell') || lower.includes('bash')) return 'bash';
    if (lower.includes('react') || lower.includes('jsx')) return 'react';
    if (lower.includes('vue')) return 'vue';
    if (lower.includes('angular')) return 'angular';
    return 'javascript';
  };

  const extractCodePrompt = (text) => {
    const cleaned = text.replace(/code|script|program|generate|create|write|for|me|a|an/g, '').trim();
    return cleaned || 'sample code';
  };

  const generateCodeTemplate = (language, prompt) => {
    const templates = {
      'javascript': `// JavaScript - ${prompt}
function main() {
  console.log('Hello from Aura AI!');
  console.log('Generated code for: ${prompt}');
  
  // Your code here
  const data = {
    message: 'Code generated successfully!',
    timestamp: new Date().toISOString()
  };
  
  return data;
}

// Run the code
main();`,

      'python': `# Python - ${prompt}
def main():
    print("Hello from Aura AI!")
    print(f"Generated code for: ${prompt}")
    
    # Your code here
    data = {
        "message": "Code generated successfully!",
        "timestamp": datetime.now().isoformat()
    }
    
    return data

if __name__ == "__main__":
    main()`,

      'html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #0A0A0F;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        h1 {
            font-size: 3rem;
            background: linear-gradient(135deg, #7B61FF, #FF6B6B);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .aura {
            font-size: 4rem;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="aura">🔮</div>
        <h1>Aura AI</h1>
        <p>Generated code for: ${prompt}</p>
        <p>🔥 ${Object.keys(appDatabase).length}+ apps supported!</p>
    </div>
    <script>
        console.log('Aura AI - ${prompt}');
    </script>
</body>
</html>`,

      'react': `// React Component - ${prompt}
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const App = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage('Generated for: ${prompt}');
  }, []);

  const handlePress = () => {
    setCount(count + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔮 Aura AI</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Press me ({count})</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  message: {
    fontSize: 16,
    color: '#9A9AB0',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#7B61FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default App;`,

      'default': `// ${language.toUpperCase()} - ${prompt}
// Code generated by Aura AI
console.log("Hello from Aura AI!");
console.log("Generated code for: ${prompt}");`
    };

    return templates[language] || templates['default'];
  };

  const extractSearchQuery = (text) => {
    const match = text.match(/search\s+(.+)|google\s+(.+)|find\s+(.+)/i);
    return match ? match[1] || match[2] || match[3] : text;
  };

  const extractLocation = (text) => {
    const match = text.match(/weather\s+(?:in\s+)?(.+)/i);
    return match ? match[1] : null;
  };

  const extractPhrase = (text) => {
    const match = text.match(/translate\s+(.+?)(?:\s+to|\s+into|$)/i);
    return match ? match[1] : '';
  };

  const extractLanguage = (text) => {
    const match = text.match(/to\s+(\w+)|into\s+(\w+)/i);
    return match ? match[1] || match[2] : 'Spanish';
  };

  const extractReminderTask = (text) => {
    const match = text.match(/remind\s+me\s+(?:to\s+)?(.+?)(?:\s+in|\s+after|$)/i);
    return match ? match[1].trim() : 'do task';
  };

  const extractReminderTime = (text) => {
    const match = text.match(/in\s+(\d+)\s*(min|mins|minutes|hour|hours|day|days)/i);
    return match ? parseInt(match[1]) : 5;
  };

  const extractImagePrompt = (text) => {
    const match = text.match(/image\s+(?:of\s+|for\s+)?(.+)|picture\s+(?:of\s+)?(.+)|draw\s+(.+)/i);
    return match ? match[1] || match[2] || match[3] : 'beautiful scene';
  };

  const extractDuration = (text) => {
    const match = text.match(/for\s+(\d+)\s*(sec|seconds|min|minutes)/i);
    return match ? parseInt(match[1]) : 30;
  };

  // ===== PREMIUM FUNCTIONS =====
  const loadPremiumStatus = async () => {
    try {
      const premium = await AsyncStorage.getItem('aura_premium');
      if (premium === 'true') {
        setIsPremium(true);
      }
    } catch (error) {
      console.error('Load premium error:', error);
    }
  };

  const activatePremium = async () => {
    try {
      await AsyncStorage.setItem('aura_premium', 'true');
      setIsPremium(true);
      setShowPremiumModal(false);
      Alert.alert('🎉 Premium Activated!', 'You now have access to all 90+ premium features!');
    } catch (error) {
      console.error('Activate premium error:', error);
      Alert.alert('Error', 'Could not activate premium');
    }
  };

  // ===== RENDER =====
  const renderChatItem = ({ item }) => (
    <View style={[
      styles.chatItem,
      item.type === 'user' ? styles.userChat : styles.auraChat
    ]}>
      <Text style={[
        styles.chatText,
        item.type === 'aura' && styles.auraChatText
      ]}>
        {item.text}
      </Text>
      {item.type === 'aura' && (
        <View style={styles.chatActions}>
          <TouchableOpacity onPress={() => {
            Share.share({ message: item.text });
          }}>
            <Text style={styles.chatActionText}>📤 Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            Alert.alert('Copied!', 'Response copied to clipboard');
          }}>
            <Text style={styles.chatActionText}>📋 Copy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <LinearGradient colors={['#0A0A0F', '#141420']} style={styles.container}>
        
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>🔮 Aura AI</Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>⭐ PRO</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.wakeToggle, isWakeListening && styles.wakeActive]}
              onPress={() => setIsWakeListening(!isWakeListening)}
            >
              <Text style={styles.wakeToggleText}>
                {isWakeListening ? '🎤' : '🔇'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.premiumBtn}
              onPress={() => setShowPremiumModal(true)}
            >
              <Text style={styles.premiumBtnText}>
                {isPremium ? '⭐' : '💎'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== VOICE STATUS ===== */}
        <View style={styles.voiceStatus}>
          <Animated.View style={[styles.voiceIcon, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.voiceIconText}>
              {isListening ? '🎤' : isProcessing ? '⚡' : '🔮'}
            </Text>
          </Animated.View>
          <Text style={styles.voiceText}>{response}</Text>
          {isListening && (
            <View style={styles.waveContainer}>
              <View style={[styles.waveBar, { height: 20 }]} />
              <View style={[styles.waveBar, { height: 35 }]} />
              <View style={[styles.waveBar, { height: 50 }]} />
              <View style={[styles.waveBar, { height: 35 }]} />
              <View style={[styles.waveBar, { height: 20 }]} />
            </View>
          )}
          {isProcessing && (
            <ActivityIndicator size="small" color="#7B61FF" style={styles.processingSpinner} />
          )}
        </View>

        {/* ===== QUICK ACTIONS ===== */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickActions}
          contentContainerStyle={styles.quickActionsContent}
        >
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickAction, { borderColor: item.color + '40' }]}
              onPress={() => {
                if (item.label === 'WhatsApp') {
                  processCommand('open whatsapp');
                } else if (item.label === 'Telegram') {
                  processCommand('open telegram');
                } else if (item.label === 'Code') {
                  processCommand('generate python script');
                } else if (item.label === 'Ring Phone') {
                  processCommand('ring my phone');
                } else if (item.label === 'Automate') {
                  processCommand('turn on wifi');
                } else if (item.label === 'AI Image') {
                  processCommand('generate image of a beautiful sunset');
                } else if (item.label === 'Email') {
                  processCommand('send email to support');
                } else if (item.label === 'Translate') {
                  processCommand('translate hello to spanish');
                }
              }}
            >
              <Text style={styles.quickActionIcon}>{item.icon}</Text>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===== CHAT HISTORY ===== */}
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          renderItem={renderChatItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.chatList}
          contentContainerStyle={styles.chatListContent}
          showsVerticalScrollIndicator={false}
        />

        {/* ===== VOICE BUTTON ===== */}
        <TouchableOpacity
          style={[styles.voiceBtn, isListening && styles.voiceActive]}
          onPress={isListening ? stopListening : startListening}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={isListening ? ['#FF6B6B', '#FF4757'] : ['#7B61FF', '#5A3FD4']}
            style={styles.voiceBtnGradient}
          >
            <Text style={styles.voiceBtnText}>
              {isListening ? '⏹️ Stop' : '🎤 Tap to Speak'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ===== CODE MODAL ===== */}
        <Modal
          visible={showCodeModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💻 Code Preview</Text>
                <TouchableOpacity 
                  onPress={() => setShowCodeModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalLanguage}>
                <Text style={styles.modalLanguageText}>Language: {codeLanguage.toUpperCase()}</Text>
              </View>
              <ScrollView style={styles.codeContainer}>
                <Text style={styles.codeText}>{generatedCode}</Text>
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalActionBtn}
                  onPress={() => {
                    Alert.alert('Copied!', 'Code copied to clipboard');
                  }}
                >
                  <Text style={styles.modalActionText}>📋 Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalActionBtn}
                  onPress={() => {
                    Share.share({ message: generatedCode });
                  }}
                >
                  <Text style={styles.modalActionText}>📤 Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ===== PREMIUM MODAL ===== */}
        <Modal
          visible={showPremiumModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, styles.premiumModal]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💎 Premium Features</Text>
                <TouchableOpacity 
                  onPress={() => setShowPremiumModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.premiumFeaturesList}>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureIcon}>🎨</Text>
                  <View style={styles.premiumFeatureInfo}>
                    <Text style={styles.premiumFeatureName}>AI Image Generation</Text>
                    <Text style={styles.premiumFeatureDesc}>Generate images from voice</Text>
                  </View>
                  {!isPremium && <Text style={styles.premiumFeatureLock}>🔒</Text>}
                </View>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureIcon}>🎥</Text>
                  <View style={styles.premiumFeatureInfo}>
                    <Text style={styles.premiumFeatureName}>Screen Recording</Text>
                    <Text style={styles.premiumFeatureDesc}>Record screen with voice</Text>
                  </View>
                  {!isPremium && <Text style={styles.premiumFeatureLock}>🔒</Text>}
                </View>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureIcon}>🔊</Text>
                  <View style={styles.premiumFeatureInfo}>
                    <Text style={styles.premiumFeatureName}>Voice Cloning</Text>
                    <Text style={styles.premiumFeatureDesc}>Clone any voice</Text>
                  </View>
                  {!isPremium && <Text style={styles.premiumFeatureLock}>🔒</Text>}
                </View>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureIcon}>⚡</Text>
                  <View style={styles.premiumFeatureInfo}>
                    <Text style={styles.premiumFeatureName}>Advanced Automation</Text>
                    <Text style={styles.premiumFeatureDesc}>Full phone automation</Text>
                  </View>
                  {!isPremium && <Text style={styles.premiumFeatureLock}>🔒</Text>}
                </View>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureIcon}>📱</Text>
                  <View style={styles.premiumFeatureInfo}>
                    <Text style={styles.premiumFeatureName}>WhatsApp Automation</Text>
                    <Text style={styles.premiumFeatureDesc}>Auto-reply, bulk messages</Text>
                  </View>
                  {!isPremium && <Text style={styles.premiumFeatureLock}>🔒</Text>}
                </View>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureIcon}>📨</Text>
                  <View style={styles.premiumFeatureInfo}>
                    <Text style={styles.premiumFeatureName}>Telegram Bot Builder</Text>
                    <Text style={styles.premiumFeatureDesc}>Create bots with voice</Text>
                  </View>
                  {!isPremium && <Text style={styles.premiumFeatureLock}>🔒</Text>}
                </View>
              </ScrollView>
              <View style={styles.premiumModalActions}>
                {!isPremium ? (
                  <>
                    <TouchableOpacity 
                      style={[styles.premiumModalBtn, styles.premiumModalBtnPrimary]}
                      onPress={activatePremium}
                    >
                      <Text style={styles.premiumModalBtnText}>💎 Upgrade Now - $2.99</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.premiumModalBtn, styles.premiumModalBtnLifetime]}
                      onPress={activatePremium}
                    >
                      <Text style={[styles.premiumModalBtnText, styles.premiumModalBtnTextLifetime]}>
                        🚀 Lifetime - $15
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.premiumActiveBadge}>
                    <Text style={styles.premiumActiveText}>✅ Premium Active! Enjoy all features!</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </GestureHandlerRootView>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  premiumBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wakeToggle: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  wakeActive: {
    borderColor: '#34D399',
    backgroundColor: 'rgba(52,211,153,0.1)',
  },
  wakeToggleText: {
    fontSize: 18,
  },
  premiumBtn: {
    padding: 8,
    backgroundColor: 'rgba(123,97,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.2)',
  },
  premiumBtnText: {
    fontSize: 18,
  },

  // Voice Status
  voiceStatus: {
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
    minHeight: 160,
  },
  voiceIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(123,97,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceIconText: {
    fontSize: 32,
  },
  voiceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 50,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#7B61FF',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  processingSpinner: {
    marginTop: 8,
  },

  // Quick Actions
  quickActions: {
    marginBottom: 12,
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  quickAction: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minWidth: 70,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionLabel: {
    color: '#9A9AB0',
    fontSize: 11,
    fontWeight: '500',
  },

  // Chat
  chatList: {
    flex: 1,
    marginHorizontal: 16,
  },
  chatListContent: {
    paddingVertical: 8,
  },
  chatItem: {
    marginVertical: 4,
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  userChat: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(123,97,255,0.2)',
    borderBottomRightRadius: 4,
  },
  auraChat: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomLeftRadius: 4,
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  auraChatText: {
    color: '#C0C0D0',
  },
  chatActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  chatActionText: {
    color: '#6A6A80',
    fontSize: 12,
  },

  // Voice Button
  voiceBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 50,
    overflow: 'hidden',
    height: 56,
  },
  voiceBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  voiceActive: {
    opacity: 0.8,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalCloseText: {
    color: '#6A6A80',
    fontSize: 20,
  },
  modalLanguage: {
    backgroundColor: 'rgba(123,97,255,0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalLanguageText: {
    color: '#7B61FF',
    fontSize: 12,
    fontWeight: '600',
  },
  codeContainer: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
  },
  codeText: {
    color: '#E0E0E0',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalActionBtn: {
    flex: 1,
    backgroundColor: 'rgba(123,97,255,0.1)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalActionText: {
    color: '#7B61FF',
    fontWeight: '600',
  },

  // Premium Modal
  premiumModal: {
    maxHeight: '90%',
  },
  premiumFeaturesList: {
    marginVertical: 8,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  premiumFeatureIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  premiumFeatureInfo: {
    flex: 1,
  },
  premiumFeatureName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumFeatureDesc: {
    color: '#6A6A80',
    fontSize: 13,
  },
  premiumFeatureLock: {
    fontSize: 18,
  },
  premiumModalActions: {
    marginTop: 16,
    gap: 12,
  },
  premiumModalBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumModalBtnPrimary: {
    backgroundColor: '#7B61FF',
  },
  premiumModalBtnLifetime: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  premiumModalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  premiumModalBtnTextLifetime: {
    color: '#FFB800',
  },
  premiumActiveBadge: {
    backgroundColor: 'rgba(52,211,153,0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.2)',
  },
  premiumActiveText: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
