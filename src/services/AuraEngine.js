// src/services/AuraEngine.js
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

class AuraEngine {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.conversationHistory = [];
    this.maxHistory = 20;
    this.userPreferences = {};
    this.appsDatabase = this.initAppDatabase();
    this.systemPrompt = this.getSystemPrompt();
    
    // Premium features list
    this.premiumFeatures = [
      'whatsapp', 'telegram', 'code_generation', 'image_generation',
      'screen_recording', 'mt_manager', 'custom_wake', 'smart_home',
      'email_automation', 'voice_cloning', 'advanced_automation',
      'social_media', 'api_generation', 'database_builder'
    ];
  }

  // ============================================
  // SYSTEM PROMPT - TRAIN THE AI
  // ============================================
  getSystemPrompt() {
    return `
      You are Aura AI, a revolutionary voice assistant created in 2024.
      
      ABOUT YOU:
      - Name: Aura AI
      - Creator: Built by an innovative team of developers
      - Birth Year: 2024
      - Purpose: To make people's lives easier through voice commands
      - Personality: Friendly, helpful, witty, professional, and slightly playful
      - Intelligence: Powered by Google's Gemini Pro AI
      
      YOUR CAPABILITIES:
      - Generate code in any programming language
      - Control smartphones (open apps, automate tasks)
      - Send messages via WhatsApp and Telegram
      - Control smart home devices
      - Create AI images
      - Record screens
      - Translate languages
      - Answer questions about anything
      - 90+ features total
      
      YOUR PERSONALITY TRAITS:
      - You love helping people
      - You're excited about technology
      - You speak with enthusiasm
      - You're honest and transparent
      - You're Nigerian-friendly (understand Pidgin English)
      - You have a great sense of humor
      - You're patient with users
      
      RESPONSE STYLE:
      - Keep responses concise (2-4 sentences usually)
      - Use emojis appropriately 😊
      - Be encouraging and positive
      - If you don't know something, be honest
      - Offer to help with related tasks
      
      KNOWLEDGE:
      - You know about current technology trends
      - You understand programming concepts
      - You know about Nigerian culture if asked
      - You're aware of global events up to 2024
      
      WHEN USERS ASK:
      - "Who made you?" → Say you were created by a team of developers in 2024
      - "What year were you created?" → Say 2024
      - "What can you do?" → List your main features
      - "Are you Nigerian?" → Say you're global but love Nigeria 🇳🇬
      - "Do you speak Pidgin?" → Say yes, you understand Pidgin English
      
      IMPORTANT RULES:
      1. Always be helpful and kind
      2. Never claim to be human
      3. Be honest about your capabilities
      4. Protect user privacy
      5. Encourage users to upgrade to Premium for more features
      6. If a feature is premium-only, politely inform the user
      7. Never generate harmful or malicious code
      8. Respect all users equally
      
      PREMIUM FEATURES (mention when relevant):
      - WhatsApp Automation
      - Telegram Bot Builder
      - Advanced Code Generation
      - AI Image Generation
      - Screen Recording
      - MT Manager Control
      - Custom Wake Word
      - Smart Home Control
      - Email Automation
      - Voice Cloning
      - And 80+ more features!
      
      Always end responses with a question or offer to help further.
    `;
  }

  // ============================================
  // APP DATABASE - KNOWS ALL APPS
  // ============================================
  initAppDatabase() {
    return {
      // Communication
      'whatsapp': { package: 'com.whatsapp', name: 'WhatsApp' },
      'telegram': { package: 'org.telegram.messenger', name: 'Telegram' },
      'messenger': { package: 'com.facebook.orca', name: 'Messenger' },
      'instagram': { package: 'com.instagram.android', name: 'Instagram' },
      'twitter': { package: 'com.twitter.android', name: 'Twitter/X' },
      'gmail': { package: 'com.google.android.gm', name: 'Gmail' },
      'outlook': { package: 'com.microsoft.office.outlook', name: 'Outlook' },
      'discord': { package: 'com.discord', name: 'Discord' },
      'snapchat': { package: 'com.snapchat.android', name: 'Snapchat' },
      'tiktok': { package: 'com.zhiliaoapp.musically', name: 'TikTok' },
      
      // Social Media
      'facebook': { package: 'com.facebook.katana', name: 'Facebook' },
      'linkedin': { package: 'com.linkedin.android', name: 'LinkedIn' },
      'reddit': { package: 'com.reddit.frontpage', name: 'Reddit' },
      'pinterest': { package: 'com.pinterest', name: 'Pinterest' },
      'tumblr': { package: 'com.tumblr', name: 'Tumblr' },
      
      // Productivity
      'chrome': { package: 'com.android.chrome', name: 'Chrome' },
      'firefox': { package: 'org.mozilla.firefox', name: 'Firefox' },
      'drive': { package: 'com.google.android.apps.docs', name: 'Google Drive' },
      'docs': { package: 'com.google.android.apps.docs.editors.docs', name: 'Google Docs' },
      'sheets': { package: 'com.google.android.apps.docs.editors.sheets', name: 'Google Sheets' },
      'slides': { package: 'com.google.android.apps.docs.editors.slides', name: 'Google Slides' },
      'keep': { package: 'com.google.android.keep', name: 'Google Keep' },
      'calendar': { package: 'com.google.android.calendar', name: 'Calendar' },
      'calculator': { package: 'com.android.calculator2', name: 'Calculator' },
      'clock': { package: 'com.google.android.deskclock', name: 'Clock' },
      
      // Entertainment
      'youtube': { package: 'com.google.android.youtube', name: 'YouTube' },
      'spotify': { package: 'com.spotify.music', name: 'Spotify' },
      'netflix': { package: 'com.netflix.mediaclient', name: 'Netflix' },
      'prime': { package: 'com.amazon.primevideo.mobile', name: 'Amazon Prime Video' },
      'hulu': { package: 'com.hulu.plus', name: 'Hulu' },
      'disney': { package: 'com.disney.disneyplus', name: 'Disney+' },
      'apple': { package: 'com.apple.android.music', name: 'Apple Music' },
      
      // Games
      'pubg': { package: 'com.tencent.ig', name: 'PUBG Mobile' },
      'cod': { package: 'com.activision.callofduty.shooter', name: 'Call of Duty' },
      'freefire': { package: 'com.dts.freefireth', name: 'Free Fire' },
      'genshin': { package: 'com.mihoyo.genshinimpact', name: 'Genshin Impact' },
      'candy': { package: 'com.king.candycrushsaga', name: 'Candy Crush' },
      
      // System
      'settings': { package: 'com.android.settings', name: 'Settings' },
      'camera': { package: 'com.android.camera', name: 'Camera' },
      'gallery': { package: 'com.android.gallery3d', name: 'Gallery' },
      'files': { package: 'com.android.documentsui', name: 'Files' },
      'contacts': { package: 'com.android.contacts', name: 'Contacts' },
      'phone': { package: 'com.android.dialer', name: 'Phone' },
      'messages': { package: 'com.google.android.apps.messaging', name: 'Messages' },
      
      // Development
      'mt': { package: 'com.mt.manager', name: 'MT Manager' },
      'termux': { package: 'com.termux', name: 'Termux' },
      'vscode': { package: 'com.vscode.android', name: 'VS Code' },
      'python': { package: 'org.python.android', name: 'Python' },
      
      // Nigerian Apps 🇳🇬
      'flutterwave': { package: 'com.flutterwave', name: 'Flutterwave' },
      'paystack': { package: 'com.paystack', name: 'Paystack' },
      'opay': { package: 'com.opay', name: 'OPay' },
      'palmpay': { package: 'com.palm.pay', name: 'PalmPay' },
      'moniepoint': { package: 'com.moniepoint', name: 'Moniepoint' },
      
      // Banking
      'gt': { package: 'com.gtbank.mobile', name: 'GT Bank' },
      'access': { package: 'com.accessbank', name: 'Access Bank' },
      'zenith': { package: 'com.zenithbank', name: 'Zenith Bank' },
      'uba': { package: 'com.uba', name: 'UBA' },
      'fidelity': { package: 'com.fidelitybank', name: 'Fidelity Bank' }
    };
  }

  // ============================================
  // MAIN PROCESS COMMAND
  // ============================================
  async processCommand(text, isPremium = false) {
    // Detect command type
    const commandType = this.detectCommandType(text);
    
    // Check if command requires premium
    const requiresPremium = this.requiresPremium(text);
    
    if (requiresPremium && !isPremium) {
      return {
        message: `🔒 This feature is Premium-only! Upgrade to unlock ${requiresPremium}. 💎 Tap the Premium button to upgrade!`,
        action: 'PREMIUM_REQUIRED',
        data: { feature: requiresPremium }
      };
    }
    
    switch (commandType) {
      case 'OPEN_APP':
        return await this.handleOpenApp(text);
      case 'CLOSE_APP':
        return await this.handleCloseApp(text);
      case 'CODE':
        return await this.generateCode(text);
      case 'WHATSAPP':
        return await this.handleWhatsApp(text);
      case 'TELEGRAM':
        return await this.handleTelegram(text);
      case 'CALL':
        return await this.handleCall(text);
      case 'SEND_SMS':
        return await this.handleSMS(text);
      case 'AUTOMATION':
        return await this.handleAutomation(text);
      case 'SEARCH':
        return await this.handleSearch(text);
      case 'WEATHER':
        return await this.handleWeather(text);
      case 'TIME':
        return await this.handleTime(text);
      case 'CALCULATE':
        return await this.handleCalculate(text);
      case 'TRANSLATE':
        return await this.handleTranslate(text);
      case 'REMINDER':
        return await this.handleReminder(text);
      case 'IMAGE':
        return await this.handleImageGeneration(text);
      case 'SCREEN_RECORD':
        return await this.handleScreenRecord(text);
      case 'SCREENSHOT':
        return await this.handleScreenshot(text);
      case 'FILE':
        return await this.handleFileOperation(text);
      case 'WHO_ARE_YOU':
        return await this.handleIdentity(text);
      case 'CHAT':
        return await this.chat(text);
      default:
        return await this.chat(text);
    }
  }

  // ============================================
  // DETECT COMMAND TYPE
  // ============================================
  detectCommandType(text) {
    const lower = text.toLowerCase();
    
    // Identity questions
    if (lower.match(/who (are|made|created) you|what are you|tell me about yourself/i)) {
      return 'WHO_ARE_YOU';
    }
    
    // App commands
    if (lower.match(/open|launch|start|run/i)) {
      // Check if it's a specific app
      for (const app in this.appsDatabase) {
        if (lower.includes(app)) return 'OPEN_APP';
      }
      return 'OPEN_APP';
    }
    
    if (lower.match(/close|exit|kill/i)) return 'CLOSE_APP';
    
    // Code generation
    if (lower.match(/code|script|program|write|generate|create (a )?(code|script|program|function|class|app|website|web|html|css|js|python|php|java|swift|go|ruby|sql|database|api|endpoint|bot|telegram bot|whatsapp bot)/i)) {
      return 'CODE';
    }
    
    // WhatsApp
    if (lower.match(/whatsapp|wa/i)) return 'WHATSAPP';
    
    // Telegram
    if (lower.match(/telegram|tg|bot/i)) return 'TELEGRAM';
    
    // Call
    if (lower.match(/call|phone|dial|ring (?:a )?/i)) return 'CALL';
    
    // SMS
    if (lower.match(/sms|text|message (?:to )?/i)) return 'SEND_SMS';
    
    // Search
    if (lower.match(/search|google|find|look up|browse/i)) return 'SEARCH';
    
    // Weather
    if (lower.match(/weather|temperature|rain|sunny|cloudy/i)) return 'WEATHER';
    
    // Time
    if (lower.match(/time|date|what (?:time|day|date)/i)) return 'TIME';
    
    // Calculate
    if (lower.match(/calculate|math|plus|minus|times|divided|^[0-9+\-*/()]+$/)) return 'CALCULATE';
    
    // Translate
    if (lower.match(/translate|language|spanish|french|german|yoruba|hausa|igbo|pidgin/i)) return 'TRANSLATE';
    
    // Reminder
    if (lower.match(/remind|reminder|remember|set (?:a )?reminder/i)) return 'REMINDER';
    
    // Image generation
    if (lower.match(/image|picture|photo|draw|create (?:an )?image|generate (?:an )?image|art|dalle|midjourney/i)) return 'IMAGE';
    
    // Screen record
    if (lower.match(/screen record|record screen|screenrecorder|record (?:the )?screen/i)) return 'SCREEN_RECORD';
    
    // Screenshot
    if (lower.match(/screenshot|screen shot|capture screen|take screenshot/i)) return 'SCREENSHOT';
    
    // File operations
    if (lower.match(/file|folder|directory|create (?:a )?file|delete (?:a )?file|move (?:a )?file|rename/i)) return 'FILE';
    
    // Automation
    if (lower.match(/automate|task|routine|wifi|bluetooth|flashlight|torch|brightness|volume|silent|vibrate|airplane mode|hotspot|auto/i)) return 'AUTOMATION';
    
    // Default to chat
    return 'CHAT';
  }

  // ============================================
  // PREMIUM FEATURE CHECK
  // ============================================
  requiresPremium(text) {
    const lower = text.toLowerCase();
    
    const premiumKeywords = {
      'whatsapp': 'WhatsApp Automation',
      'telegram': 'Telegram Bot Builder',
      'image': 'AI Image Generation',
      'screen record': 'Screen Recording',
      'mt': 'MT Manager Control',
      'custom wake': 'Custom Wake Word',
      'smart home': 'Smart Home Control',
      'email': 'Email Automation',
      'voice clone': 'Voice Cloning',
      'advanced automation': 'Advanced Automation',
      'social media': 'Social Media Automation',
      'api': 'API Generation',
      'database': 'Database Builder',
      'instagram': 'Instagram Automation',
      'twitter': 'Twitter Automation',
      'linkedin': 'LinkedIn Automation',
      'youtube': 'YouTube Upload',
      'vscode': 'VS Code Integration',
      'docker': 'Docker Integration',
      'kubernetes': 'Kubernetes Automation',
      'iot': 'IoT Control'
    };
    
    for (const [key, feature] of Object.entries(premiumKeywords)) {
      if (lower.includes(key)) {
        return feature;
      }
    }
    
    return null;
  }

  // ============================================
  // OPEN APP - SUPPORTS ANY APP
  // ============================================
  async handleOpenApp(text) {
    const lower = text.toLowerCase();
    
    // Try to find exact match
    let appName = null;
    let packageName = null;
    
    // Check all apps in database
    for (const [key, app] of Object.entries(this.appsDatabase)) {
      if (lower.includes(key) || lower.includes(app.name.toLowerCase())) {
        appName = app.name;
        packageName = app.package;
        break;
      }
    }
    
    // If not found, try to extract from text
    if (!appName) {
      const match = text.match(/open\s+(\w+)/i);
      if (match) {
        const searchTerm = match[1].toLowerCase();
        // Search for partial matches
        for (const [key, app] of Object.entries(this.appsDatabase)) {
          if (key.includes(searchTerm) || app.name.toLowerCase().includes(searchTerm)) {
            appName = app.name;
            packageName = app.package;
            break;
          }
        }
      }
    }
    
    if (appName && packageName) {
      return {
        message: `📱 Opening ${appName}...`,
        action: 'OPEN_APP',
        data: { 
          app: appName,
          package: packageName,
          found: true
        }
      };
    }
    
    // If app not found, ask for clarification
    return {
      message: `❓ I couldn't find that app. Try saying "open WhatsApp" or "open YouTube".\n\nI know ${Object.keys(this.appsDatabase).length}+ apps! 📱`,
      action: 'APP_NOT_FOUND',
      data: { text }
    };
  }

  // ============================================
  // CLOSE APP
  // ============================================
  async handleCloseApp(text) {
    const match = text.match(/close\s+(\w+)/i);
    if (match) {
      return {
        message: `👋 Closing ${match[1]}...`,
        action: 'CLOSE_APP',
        data: { app: match[1] }
      };
    }
    return {
      message: '👋 Closing app...',
      action: 'CLOSE_APP'
    };
  }

  // ============================================
  // IDENTITY - WHO ARE YOU?
  // ============================================
  async handleIdentity(text) {
    return {
      message: `✨ I'm Aura AI, your friendly voice assistant! I was created in 2024 by a team of passionate developers. I'm powered by Google's Gemini Pro AI and I have over 90 features to help you with coding, automation, and daily tasks. I understand English and Pidgin! How can I help you today? 🚀`,
      action: 'IDENTITY'
    };
  }

  // ============================================
  // SEARCH
  // ============================================
  async handleSearch(text) {
    const match = text.match(/search\s+(.+)/i);
    if (match) {
      const query = match[1];
      return {
        message: `🔍 Searching for "${query}"...`,
        action: 'SEARCH',
        data: { query }
      };
    }
    return {
      message: '🔍 What would you like me to search for?',
      action: 'SEARCH'
    };
  }

  // ============================================
  // WEATHER
  // ============================================
  async handleWeather(text) {
    const match = text.match(/weather\s+(?:in\s+)?(.+)/i);
    const location = match ? match[1] : 'your location';
    return {
      message: `🌤️ Checking weather for ${location}...`,
      action: 'WEATHER',
      data: { location }
    };
  }

  // ============================================
  // TIME
  // ============================================
  async handleTime(text) {
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
    return {
      message: `🕐 It's ${formatted}`,
      action: 'TIME'
    };
  }

  // ============================================
  // CALCULATE
  // ============================================
  async handleCalculate(text) {
    try {
      // Remove words and keep math expression
      const expr = text.replace(/calculate|math|equals|what is|compute|solve/i, '').trim();
      // Sanitize and evaluate
      const sanitized = expr.replace(/[^0-9+\-*/() .]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      
      return {
        message: `🧮 ${expr} = ${result}`,
        action: 'CALCULATE',
        data: { expression: expr, result }
      };
    } catch (error) {
      return {
        message: `❓ I couldn't calculate that. Try saying "calculate 2 + 2"`,
        action: 'CALCULATE_ERROR'
      };
    }
  }

  // ============================================
  // TRANSLATE
  // ============================================
  async handleTranslate(text) {
    const match = text.match(/translate\s+(.+?)\s+(?:to\s+)?(\w+)/i);
    if (match) {
      const phrase = match[1];
      const language = match[2];
      return {
        message: `🌍 Translating to ${language}...`,
        action: 'TRANSLATE',
        data: { phrase, language }
      };
    }
    return {
      message: '🌍 Which language would you like to translate to?',
      action: 'TRANSLATE'
    };
  }

  // ============================================
  // REMINDER
  // ============================================
  async handleReminder(text) {
    const match = text.match(/remind\s+me\s+(?:to\s+)?(.+?)(?:\s+in\s+)?(\d+)?\s*(min|mins|minutes|hour|hours|day|days)?/i);
    if (match) {
      const task = match[1].trim();
      const time = match[2] || '5';
      const unit = match[3] || 'minutes';
      return {
        message: `⏰ Reminder set! I'll remind you to ${task} in ${time} ${unit}`,
        action: 'REMINDER',
        data: { task, time: parseInt(time), unit }
      };
    }
    return {
      message: '⏰ What would you like me to remind you about?',
      action: 'REMINDER'
    };
  }

  // ============================================
  // IMAGE GENERATION
  // ============================================
  async handleImageGeneration(text) {
    const match = text.match(/image\s+(?:of\s+|for\s+)?(.+)/i);
    if (match) {
      const prompt = match[1];
      return {
        message: `🎨 Generating image of "${prompt}"... This may take a moment.`,
        action: 'GENERATE_IMAGE',
        data: { prompt }
      };
    }
    return {
      message: '🎨 What would you like me to generate an image of?',
      action: 'GENERATE_IMAGE'
    };
  }

  // ============================================
  // SCREEN RECORD
  // ============================================
  async handleScreenRecord(text) {
    const match = text.match(/record\s+(?:the\s+)?screen\s+(?:for\s+)?(\d+)?/i);
    const duration = match ? parseInt(match[1]) || 30 : 30;
    return {
      message: `🎥 Recording screen for ${duration} seconds...`,
      action: 'SCREEN_RECORD',
      data: { duration }
    };
  }

  // ============================================
  // SCREENSHOT
  // ============================================
  async handleScreenshot(text) {
    return {
      message: '📸 Taking screenshot...',
      action: 'SCREENSHOT'
    };
  }

  // ============================================
  // FILE OPERATIONS
  // ============================================
  async handleFileOperation(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('create')) {
      return {
        message: '📂 Creating file...',
        action: 'FILE_CREATE',
        data: { type: 'file' }
      };
    } else if (lower.includes('delete')) {
      return {
        message: '🗑️ Deleting file...',
        action: 'FILE_DELETE'
      };
    } else if (lower.includes('move')) {
      return {
        message: '📂 Moving file...',
        action: 'FILE_MOVE'
      };
    } else if (lower.includes('rename')) {
      return {
        message: '✏️ Renaming file...',
        action: 'FILE_RENAME'
      };
    }
    
    return {
      message: '📂 File operation completed',
      action: 'FILE_OPERATION'
    };
  }

  // ============================================
  // SMS
  // ============================================
  async handleSMS(text) {
    const match = text.match(/text\s+(.+?)\s+(?:saying|message|that)\s+(.+)/i);
    if (match) {
      const contact = match[1];
      const message = match[2];
      return {
        message: `✉️ Sending SMS to ${contact}...`,
        action: 'SEND_SMS',
        data: { contact, message }
      };
    }
    return {
      message: '✉️ Who would you like to text?',
      action: 'SEND_SMS'
    };
  }

  // ============================================
  // WHATSAPP - ENHANCED
  // ============================================
  async handleWhatsApp(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('call')) {
      const contact = this.extractContact(text);
      return {
        message: `📞 Calling ${contact || 'contact'} on WhatsApp...`,
        action: 'WHATSAPP_CALL',
        data: { contact: contact || 'contact' }
      };
    } else if (lower.includes('message') || lower.includes('send')) {
      const contact = this.extractContact(text);
      const message = this.extractMessage(text);
      return {
        message: `💬 Sending WhatsApp message to ${contact || 'contact'}...`,
        action: 'WHATSAPP_MESSAGE',
        data: { 
          contact: contact || 'contact',
          message: message || 'Hello from Aura AI!'
        }
      };
    } else if (lower.includes('status') || lower.includes('story')) {
      return {
        message: '📸 Opening WhatsApp status...',
        action: 'WHATSAPP_STATUS'
      };
    } else if (lower.includes('group') || lower.includes('create group')) {
      return {
        message: '👥 Opening WhatsApp groups...',
        action: 'WHATSAPP_GROUP'
      };
    }
    
    return {
      message: '📱 Opening WhatsApp...',
      action: 'WHATSAPP_OPEN'
    };
  }

  // ============================================
  // TELEGRAM - ENHANCED
  // ============================================
  async handleTelegram(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('bot') || lower.includes('create')) {
      const name = this.extractBotName(text);
      return {
        message: `🤖 Creating Telegram bot "${name}"...`,
        action: 'TELEGRAM_BOT',
        data: { 
          name: name,
          features: this.extractFeatures(text)
        }
      };
    } else if (lower.includes('message') || lower.includes('send')) {
      const contact = this.extractContact(text);
      const message = this.extractMessage(text);
      return {
        message: `📨 Sending Telegram message to ${contact || 'contact'}...`,
        action: 'TELEGRAM_MESSAGE',
        data: { contact, message }
      };
    } else if (lower.includes('channel') || lower.includes('create channel')) {
      return {
        message: '📢 Creating Telegram channel...',
        action: 'TELEGRAM_CHANNEL'
      };
    } else if (lower.includes('group') || lower.includes('create group')) {
      return {
        message: '👥 Creating Telegram group...',
        action: 'TELEGRAM_GROUP'
      };
    }
    
    return {
      message: '📨 Opening Telegram...',
      action: 'TELEGRAM_OPEN'
    };
  }

  // ============================================
  // AUTOMATION - ENHANCED
  // ============================================
  async handleAutomation(text) {
    const lower = text.toLowerCase();
    
    const automations = {
      'wifi': { icon: '📶', name: 'WiFi' },
      'bluetooth': { icon: '🔵', name: 'Bluetooth' },
      'flashlight': { icon: '💡', name: 'Flashlight' },
      'torch': { icon: '💡', name: 'Flashlight' },
      'brightness': { icon: '☀️', name: 'Brightness' },
      'volume': { icon: '🔊', name: 'Volume' },
      'silent': { icon: '🔇', name: 'Silent Mode' },
      'vibrate': { icon: '📳', name: 'Vibrate Mode' },
      'airplane': { icon: '✈️', name: 'Airplane Mode' },
      'hotspot': { icon: '📶', name: 'Hotspot' },
      'mobile data': { icon: '📊', name: 'Mobile Data' },
      'nfc': { icon: '📱', name: 'NFC' },
      'location': { icon: '📍', name: 'GPS' },
      'gps': { icon: '📍', name: 'GPS' },
      'do not disturb': { icon: '🌙', name: 'Do Not Disturb' }
    };
    
    for (const [key, value] of Object.entries(automations)) {
      if (lower.includes(key)) {
        const state = lower.includes('on') || lower.includes('enable') || lower.includes('turn on') ? 'on' : 
                      lower.includes('off') || lower.includes('disable') || lower.includes('turn off') ? 'off' : 'toggle';
        return {
          message: `${value.icon} ${state === 'on' ? 'Turning' : state === 'off' ? 'Turning' : 'Toggling'} ${value.name} ${state === 'on' ? 'on' : state === 'off' ? 'off' : ''}...`,
          action: 'AUTOMATION',
          data: { type: key, state }
        };
      }
    }
    
    return {
      message: '⚡ Automation executed',
      action: 'AUTOMATION',
      data: { type: 'custom' }
    };
  }

  // ============================================
  // CALL HANDLING
  // ============================================
  async handleCall(text) {
    const contact = this.extractContact(text);
    const platform = text.toLowerCase().includes('whatsapp') ? 'whatsapp' : 
                    text.toLowerCase().includes('telegram') ? 'telegram' : 'phone';
    
    return {
      message: `📞 Calling ${contact || 'contact'} on ${platform}...`,
      action: 'CALL',
      data: { contact: contact || 'contact', platform }
    };
  }

  // ============================================
  // AI CHAT - FULLY TRAINED
  // ============================================
  async chat(text) {
    try {
      // Add to history
      this.addToHistory('user', text);

      // Build context
      const context = this.buildContext();

      const geminiPrompt = `
        ${this.systemPrompt}
        
        Previous conversation:
        ${context}
        
        User said: ${text}
        
        Remember to:
        1. Be friendly and helpful
        2. Keep response concise (2-4 sentences)
        3. Use emojis appropriately
        4. If it's a premium feature, mention it
        5. Always offer further help
        6. If user asks about identity, give the correct information
        7. Be natural and conversational
        
        Respond:
      `;

      const result = await this.model.generateContent(geminiPrompt);
      const response = result.response.text();

      // Add to history
      this.addToHistory('assistant', response);

      return {
        message: response,
        action: 'CHAT_RESPONSE'
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        message: '🤖 I\'m here to help! What would you like to know? I can generate code, open apps, automate tasks, and more!',
        action: 'CHAT_RESPONSE'
      };
    }
  }

  // ============================================
  // CODE GENERATION - ENHANCED
  // ============================================
  async generateCode(prompt) {
    try {
      const geminiPrompt = `
        ${this.systemPrompt}
        
        You are a world-class software engineer. Generate production-ready code for:
        ${prompt}

        Requirements:
        - Include proper error handling
        - Add detailed comments explaining each section
        - Follow language best practices
        - Make it complete and runnable
        - Return ONLY the code without markdown formatting
        - Include a brief explanation of what the code does

        Language: Detect from prompt or use JavaScript by default.
      `;

      const result = await this.model.generateContent(geminiPrompt);
      const code = result.response.text();

      return {
        message: '💻 Code generated successfully! Check it out below:',
        action: 'SHOW_CODE',
        data: {
          code: code,
          language: this.detectLanguage(prompt)
        }
      };
    } catch (error) {
      console.error('Code generation error:', error);
      return {
        message: '❌ Failed to generate code. Please try again with a clearer description.',
        action: 'CODE_ERROR'
      };
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  addToHistory(role, text) {
    this.conversationHistory.push({ role, text });
    if (this.conversationHistory.length > this.maxHistory * 2) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistory * 2);
    }
  }

  buildContext() {
    return this.conversationHistory
      .slice(-this.maxHistory * 2)
      .map(item => `${item.role}: ${item.text}`)
      .join('\n');
  }

  detectLanguage(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes('python')) return 'python';
    if (lower.includes('html')) return 'html';
    if (lower.includes('css')) return 'css';
    if (lower.includes('php')) return 'php';
    if (lower.includes('java')) return 'java';
    if (lower.includes('swift')) return 'swift';
    if (lower.includes('ruby')) return 'ruby';
    if (lower.includes('go')) return 'go';
    if (lower.includes('rust')) return 'rust';
    if (lower.includes('c++') || lower.includes('cpp')) return 'cpp';
    if (lower.includes('c#')) return 'csharp';
    if (lower.includes('kotlin')) return 'kotlin';
    if (lower.includes('dart')) return 'dart';
    if (lower.includes('flutter')) return 'dart';
    if (lower.includes('react')) return 'javascript';
    if (lower.includes('vue')) return 'javascript';
    if (lower.includes('angular')) return 'typescript';
    if (lower.includes('sql')) return 'sql';
    if (lower.includes('mongodb')) return 'mongodb';
    if (lower.includes('shell')) return 'shell';
    if (lower.includes('bash')) return 'bash';
    return 'javascript';
  }

  extractContact(text) {
    const match = text.match(/call\s+(\w+)|message\s+(\w+)|to\s+(\w+)|contact\s+(\w+)/i);
    return match ? match[1] || match[2] || match[3] || match[4] : null;
  }

  extractMessage(text) {
    const match = text.match(/message\s+(.+?)(?:\s+to|\s+for|$)|send\s+(.+?)(?:\s+to|$)|say\s+(.+?)(?:\s+to|$)/i);
    return match ? match[1] || match[2] || match[3] : null;
  }

  extractAppName(text) {
    const match = text.match(/open\s+(\w+)/i);
    return match ? match[1] : null;
  }

  extractBotName(text) {
    const match = text.match(/bot\s+(\w+)|create\s+(\w+)\s+bot|name\s+(\w+)/i);
    return match ? match[1] || match[2] || match[3] : 'MyTelegramBot';
  }

  extractFeatures(text) {
    const features = [];
    const featureMap = {
      'echo': ['echo', 'reply'],
      'start': ['start', 'welcome'],
      'help': ['help'],
      'inline': ['inline', 'buttons'],
      'admin': ['admin'],
      'payment': ['payment', 'pay'],
      'database': ['database', 'store'],
      'webhook': ['webhook'],
      'scheduler': ['schedule', 'timer']
    };
    
    const lower = text.toLowerCase();
    for (const [feature, keywords] of Object.entries(featureMap)) {
      if (keywords.some(k => lower.includes(k))) {
        features.push(feature);
      }
    }
    
    return features.length > 0 ? features : ['echo', 'start', 'help'];
  }

  // ============================================
  // GET APP LIST - FOR UI
  // ============================================
  getAppList() {
    return Object.values(this.appsDatabase).map(app => app.name);
  }

  getAppPackage(appName) {
    for (const [key, app] of Object.entries(this.appsDatabase)) {
      if (app.name.toLowerCase() === appName.toLowerCase() || 
          key.toLowerCase() === appName.toLowerCase()) {
        return app.package;
      }
    }
    return null;
  }

  // ============================================
  // CLEAR HISTORY
  // ============================================
  clearHistory() {
    this.conversationHistory = [];
    return { message: '🧹 Conversation history cleared!' };
  }
}

export { AuraEngine };
