// src/services/VoiceService.js
import Voice from 'react-native-voice';
import { AuraEngine } from './AuraEngine';

class VoiceService {
  constructor() {
    this.isInitialized = false;
    this.isListening = false;
    this.callbacks = {};
    this.auraEngine = new AuraEngine();
    this.wakeWord = 'aura';
    this.isWakeListening = false;
    this.wakeTimeout = null;
  }

  init() {
    if (this.isInitialized) return;

    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged.bind(this);

    this.isInitialized = true;
    console.log('🎤 Voice service initialized');
  }

  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  // Wake word detection
  startWakeDetection() {
    if (this.isWakeListening) return;
    this.isWakeListening = true;
    console.log('🔊 Started wake word detection');
    this.listenForWake();
  }

  stopWakeDetection() {
    this.isWakeListening = false;
    if (this.wakeTimeout) {
      clearTimeout(this.wakeTimeout);
    }
    console.log('🔇 Stopped wake word detection');
  }

  listenForWake() {
    if (!this.isWakeListening) return;

    Voice.start('en-US')
      .then(() => {
        console.log('🎤 Listening for wake word...');
      })
      .catch((error) => {
        console.error('Wake word error:', error);
      });

    // Set timeout to restart listening
    this.wakeTimeout = setTimeout(() => {
      this.listenForWake();
    }, 3000);
  }

  // Start voice recognition
  startListening() {
    if (this.isListening) return;
    this.isListening = true;

    Voice.start('en-US')
      .then(() => {
        console.log('🎤 Started listening');
      })
      .catch((error) => {
        console.error('Voice start error:', error);
        this.isListening = false;
      });
  }

  stopListening() {
    if (!this.isListening) return;
    this.isListening = false;
    Voice.stop();
    console.log('🛑 Stopped listening');
  }

  // Voice event handlers
  onSpeechStart(e) {
    console.log('Speech started');
  }

  onSpeechEnd(e) {
    console.log('Speech ended');
    this.isListening = false;
  }

  onSpeechResults(e) {
    const text = e.value[0]?.toLowerCase() || '';
    console.log('🎤 Voice input:', text);

    // Check for wake word
    if (text.includes(this.wakeWord)) {
      if (this.callbacks.onWakeWord) {
        this.callbacks.onWakeWord();
      }
      return;
    }

    // Process command
    if (this.callbacks.onSpeechResults) {
      this.callbacks.onSpeechResults(text);
    }
  }

  onSpeechError(e) {
    console.error('Speech error:', e);
    this.isListening = false;
    if (this.callbacks.onSpeechError) {
      this.callbacks.onSpeechError(e);
    }
  }

  onSpeechVolumeChanged(e) {
    // Volume change event
  }

  // Process commands with AI
  async processCommand(text) {
    try {
      const result = await this.auraEngine.processCommand(text);
      return result;
    } catch (error) {
      console.error('Command processing error:', error);
      return {
        message: '❌ Sorry, I encountered an error. Please try again.'
      };
    }
  }

  destroy() {
    this.stopWakeDetection();
    this.stopListening();
    Voice.destroy();
    this.isInitialized = false;
    console.log('🗑️ Voice service destroyed');
  }
}

export { VoiceService };
