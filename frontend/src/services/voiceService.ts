/**
 * Voice Service for handling speech recognition and synthesis
 */
export class VoiceService {
  private static instance: VoiceService;
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isSupported = false;
  private hasPermission = false;

  private constructor() {
    this.checkSupport();
    this.initializeSynthesis();
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private checkSupport(): void {
    // Check for speech recognition support
    this.isSupported = 
      'webkitSpeechRecognition' in window || 
      'SpeechRecognition' in window;

    console.log('[VoiceService] Speech recognition supported:', this.isSupported);
  }

  private initializeSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      console.log('[VoiceService] Speech synthesis available');
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      this.hasPermission = true;
      console.log('[VoiceService] Microphone permission granted');
      return true;
    } catch (error) {
      console.error('[VoiceService] Microphone permission denied:', error);
      this.hasPermission = false;
      return false;
    }
  }

  createRecognition(options: {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    maxAlternatives?: number;
  } = {}): any {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported');
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    
    // Set default options
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = options.lang ?? 'en-US';
    recognition.maxAlternatives = options.maxAlternatives ?? 1;

    console.log('[VoiceService] Recognition created with options:', options);
    
    return recognition;
  }

  async speak(text: string, options: {
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis is not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      if (options.voice) utterance.voice = options.voice;
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      utterance.onend = () => {
        console.log('[VoiceService] Speech synthesis completed');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('[VoiceService] Speech synthesis error:', event);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      console.log('[VoiceService] Starting speech synthesis:', text.substring(0, 50) + '...');
      this.synthesis.speak(utterance);
    });
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      console.log('[VoiceService] Speech synthesis stopped');
    }
  }

  isRecognitionSupported(): boolean {
    return this.isSupported;
  }

  isSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }

  hasAudioPermission(): boolean {
    return this.hasPermission;
  }

  getBrowserInfo(): {
    userAgent: string;
    isChrome: boolean;
    isFirefox: boolean;
    isSafari: boolean;
    isEdge: boolean;
  } {
    const userAgent = navigator.userAgent;
    return {
      userAgent,
      isChrome: /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
      isFirefox: /Firefox/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      isEdge: /Edg/.test(userAgent)
    };
  }

  getRecommendations(): string[] {
    const browser = this.getBrowserInfo();
    const recommendations: string[] = [];

    if (!this.isSupported) {
      recommendations.push('Use Chrome, Edge, or Safari for voice recognition support');
    }

    if (!this.hasPermission) {
      recommendations.push('Allow microphone access in browser settings');
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      recommendations.push('Voice recognition requires HTTPS or localhost');
    }

    if (browser.isFirefox) {
      recommendations.push('Firefox has limited speech recognition support');
    }

    return recommendations;
  }
}

// Export singleton instance
export const voiceService = VoiceService.getInstance();