# Voice Input Troubleshooting Guide

This guide helps you resolve voice input issues in Zeno AI.

## 🎤 Common Voice Input Issues

### Issue 1: "Speech recognition is not supported"
**Cause**: Your browser doesn't support the Web Speech API

**Solutions**:
- ✅ Use **Chrome** (recommended) - Best support
- ✅ Use **Microsoft Edge** - Good support  
- ✅ Use **Safari** - Limited but functional
- ❌ Avoid **Firefox** - Very limited support

### Issue 2: "Microphone permission denied"
**Cause**: Browser blocked microphone access

**Solutions**:
1. **Chrome/Edge**: Click the microphone icon in address bar → Allow
2. **Safari**: Safari menu → Settings → Websites → Microphone → Allow
3. **System Settings**: 
   - Windows: Settings → Privacy → Microphone → Allow apps
   - Mac: System Preferences → Security & Privacy → Microphone

### Issue 3: "No microphone found"
**Cause**: No audio input device detected

**Solutions**:
1. Check physical microphone connection
2. Test microphone in other apps
3. Update audio drivers
4. Check Windows Sound settings → Recording devices

### Issue 4: "Network error" or "Service not allowed"
**Cause**: Internet connection issues or HTTPS requirement

**Solutions**:
1. **Check Internet Connection**:
   - Ensure you have a stable internet connection
   - Voice recognition uses Google's cloud servers
   - Try opening other websites to verify connectivity

2. **HTTPS Requirement**: Voice recognition needs secure connection
   - ✅ `https://` URLs work
   - ✅ `localhost` works for development
   - ❌ `http://` URLs don't work (except localhost)

3. **Network Troubleshooting**:
   - Restart your router/modem
   - Try a different network (mobile hotspot)
   - Check if firewall/antivirus is blocking the connection
   - Disable VPN temporarily to test

4. **Corporate/School Networks**:
   - Network may block Google's speech servers
   - Contact IT administrator about allowing speech recognition
   - Try using personal mobile data instead

5. **Rate Limiting**:
   - Google may temporarily limit requests
   - Wait 5-10 minutes before trying again
   - Avoid rapid repeated attempts

### Issue 5: "No speech detected"
**Cause**: Audio input issues or background noise

**Solutions**:
1. Speak clearly and loudly
2. Reduce background noise
3. Check microphone sensitivity
4. Try push-to-talk mode in settings

## 🔧 Browser-Specific Instructions

### Google Chrome (Recommended)
1. Click microphone icon in address bar
2. Select "Always allow" for this site
3. Refresh the page

### Microsoft Edge
1. Click microphone icon in address bar
2. Select "Allow" 
3. Refresh the page

### Safari
1. Safari → Preferences → Websites
2. Select "Microphone" from sidebar
3. Set to "Allow" for your site

### Firefox (Limited Support)
- Firefox has very limited Web Speech API support
- Consider using Chrome or Edge instead

## 🛠️ Advanced Troubleshooting

### Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Look for voice-related errors
4. Common error messages:
   - `not-allowed`: Permission denied
   - `no-speech`: No audio detected
   - `audio-capture`: Microphone issues
   - `network`: Connection problems

### Test Voice Recognition
1. Open Chrome
2. Go to: `chrome://settings/content/microphone`
3. Ensure microphone is allowed
4. Test with Google Voice Search

### System Audio Settings

#### Windows 10/11
1. Right-click speaker icon → Sounds
2. Go to "Recording" tab
3. Ensure microphone is enabled and set as default
4. Test microphone levels

#### macOS
1. System Preferences → Sound
2. Go to "Input" tab
3. Select correct microphone
4. Adjust input volume

## 🎯 Optimal Setup

### Recommended Configuration
- **Browser**: Chrome or Edge
- **Connection**: HTTPS or localhost
- **Microphone**: Dedicated USB microphone (better than built-in)
- **Environment**: Quiet room with minimal background noise

### Settings in Zeno AI
1. Open Settings (gear icon)
2. Go to "Voice" section
3. Configure:
   - **STT Engine**: Web Speech API (Default)
   - **Push to Talk**: Enable for noisy environments
   - **Language**: Match your speaking language

## 🔍 Testing Voice Input

### Quick Test
1. Click the microphone button in chat input
2. Look for red recording indicator
3. Speak clearly: "Hello, this is a test"
4. Check if text appears in input field

### Debug Mode
1. Open browser console (F12)
2. Click microphone button
3. Watch for console messages:
   - `[Voice] Starting voice recording...`
   - `[Voice] Recording started`
   - `[Voice] Transcript: [your text]`

## 📱 Mobile Devices

### iOS Safari
- Voice recognition works but may be limited
- Ensure microphone permission is granted
- May require user interaction to start

### Android Chrome
- Generally works well
- Check microphone permissions in app settings
- May need to enable "Use microphone" in site settings

## 🆘 Still Having Issues?

### Fallback Options
1. **Type instead**: Voice is optional, typing always works
2. **Different browser**: Try Chrome if using another browser
3. **Different device**: Test on another computer/phone
4. **External microphone**: Try a USB headset or microphone

### Report Issues
If voice input still doesn't work:
1. Note your browser and version
2. Check console for error messages
3. Try the troubleshooting steps above
4. Consider using text input as alternative

## ✅ Success Indicators

Voice input is working correctly when you see:
- 🔴 Red recording indicator when speaking
- 📝 Text appearing in real-time as you speak
- 🎤 Microphone button changes to stop icon
- 📱 No error messages in console

Voice input should feel natural and responsive when properly configured!