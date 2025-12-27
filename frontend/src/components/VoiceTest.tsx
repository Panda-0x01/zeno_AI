import { useState } from 'react';
import { voiceService } from '../services/voiceService';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export default function VoiceTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [recognition, setRecognition] = useState<any>(null);

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${icon} [${timestamp}] ${message}`]);
  };

  const runDiagnostics = async () => {
    setTestResults([]);
    addResult('Starting voice diagnostics...');

    // Check browser support
    if (voiceService.isRecognitionSupported()) {
      addResult('Speech recognition is supported', 'success');
    } else {
      addResult('Speech recognition is NOT supported', 'error');
      const recommendations = voiceService.getRecommendations();
      recommendations.forEach(rec => addResult(rec, 'error'));
      return;
    }

    // Check synthesis support
    if (voiceService.isSynthesisSupported()) {
      addResult('Speech synthesis is supported', 'success');
    } else {
      addResult('Speech synthesis is NOT supported', 'error');
    }

    // Check browser info
    const browser = voiceService.getBrowserInfo();
    addResult(`Browser: ${browser.isChrome ? 'Chrome' : browser.isEdge ? 'Edge' : browser.isSafari ? 'Safari' : browser.isFirefox ? 'Firefox' : 'Unknown'}`);

    // Check HTTPS
    if (location.protocol === 'https:' || location.hostname === 'localhost') {
      addResult('Secure context: OK', 'success');
    } else {
      addResult('Secure context: FAILED (HTTPS required)', 'error');
    }

    // Test microphone permission
    try {
      const hasPermission = await voiceService.requestPermission();
      if (hasPermission) {
        addResult('Microphone permission: GRANTED', 'success');
      } else {
        addResult('Microphone permission: DENIED', 'error');
      }
    } catch (error) {
      addResult(`Microphone permission error: ${error}`, 'error');
    }

    // List available voices
    const voices = voiceService.getAvailableVoices();
    addResult(`Available voices: ${voices.length}`);
    if (voices.length > 0) {
      voices.slice(0, 3).forEach(voice => {
        addResult(`  - ${voice.name} (${voice.lang})`);
      });
    }

    addResult('Diagnostics complete!');
  };

  const testRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (recognition) {
        recognition.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const rec = voiceService.createRecognition({
        continuous: false,
        interimResults: true,
        lang: 'en-US'
      });

      rec.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        addResult('Recording started - speak now!', 'success');
      };

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(transcript);
        addResult(`Recognized: "${transcript}"`);
      };

      rec.onerror = (event: any) => {
        addResult(`Recording error: ${event.error}`, 'error');
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
        addResult('Recording ended');
      };

      setRecognition(rec);
      rec.start();
    } catch (error) {
      addResult(`Failed to start recording: ${error}`, 'error');
    }
  };

  const testSpeech = async () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const testText = transcript || 'Hello! This is a voice synthesis test. If you can hear this, speech synthesis is working correctly.';
    
    try {
      setIsSpeaking(true);
      addResult(`Speaking: "${testText.substring(0, 50)}..."`);
      await voiceService.speak(testText);
      addResult('Speech synthesis completed', 'success');
    } catch (error) {
      addResult(`Speech synthesis error: ${error}`, 'error');
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="voice-test">
      <h3>🎤 Voice Input Test</h3>
      
      <div className="test-controls">
        <button onClick={runDiagnostics} className="test-button">
          🔍 Run Diagnostics
        </button>
        
        <button 
          onClick={testRecording} 
          className={`test-button ${isRecording ? 'recording' : ''}`}
        >
          {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          {isRecording ? 'Stop Recording' : 'Test Recording'}
        </button>
        
        <button 
          onClick={testSpeech} 
          className={`test-button ${isSpeaking ? 'speaking' : ''}`}
          disabled={!transcript && !isSpeaking}
        >
          {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {isSpeaking ? 'Stop Speech' : 'Test Speech'}
        </button>
      </div>

      {transcript && (
        <div className="transcript">
          <strong>Transcript:</strong> "{transcript}"
        </div>
      )}

      <div className="test-results">
        {testResults.map((result, index) => (
          <div key={index} className="test-result">
            {result}
          </div>
        ))}
      </div>

      <div className="test-help">
        <p><strong>How to test:</strong></p>
        <ol>
          <li>Click "Run Diagnostics" to check your setup</li>
          <li>Click "Test Recording" and speak clearly</li>
          <li>Click "Test Speech" to hear the recognized text</li>
        </ol>
        <p>If tests fail, check the <a href="/VOICE_TROUBLESHOOTING.md" target="_blank">troubleshooting guide</a>.</p>
      </div>
    </div>
  );
}