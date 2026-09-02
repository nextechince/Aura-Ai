// App.js
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MMKV } from 'react-native-mmkv';
import { Provider } from 'zustand';

import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store';
import { requestAllPermissions } from './src/utils/Permissions';
import { initVoiceService } from './src/services/VoiceService';
import { initPremiumManager } from './src/services/PremiumManager';

// Ignore specific warnings
LogBox.ignoreLogs([
  'EventEmitter.removeListener',
  '[react-native-gesture-handler]',
  'Require cycle:'
]);

// Initialize storage
export const storage = new MMKV();

const App = () => {
  const { setAppReady, isAppReady } = useStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 1. Request all permissions
      await requestAllPermissions();

      // 2. Initialize voice service
      await initVoiceService();

      // 3. Initialize premium manager
      await initPremiumManager();

      // 4. Check premium status
      const isPremium = await checkPremiumStatus();
      useStore.setState({ isPremium });

      // 5. Set app ready
      setAppReady(true);

      console.log('🔮 Aura AI initialized successfully!');
    } catch (error) {
      console.error('App initialization error:', error);
    }
  };

  if (!isAppReady) {
    // Show splash while loading
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0A0A0F"
          translucent
        />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
