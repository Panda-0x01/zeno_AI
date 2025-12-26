# Low-End PC Optimization Guide

This project has been optimized to run smoothly on low-end PCs and older hardware.

## 🚀 Performance Optimizations Applied

### Backend Optimizations
- **Smaller AI Model**: Uses `llama3.2:1b` (1 billion parameters) instead of larger models
- **Reduced Context**: Limited to 2048 tokens instead of 4096
- **Memory Management**: Low memory mode enabled
- **Request Limiting**: Only 1 concurrent request to prevent overload
- **Response Caching**: Enabled to reduce repeated processing
- **Smaller Cache**: 32MB cache size to save RAM

### Frontend Optimizations
- **Hardware Acceleration**: CSS transforms use GPU when available
- **Reduced Animations**: Automatic detection of low-end devices
- **Performance Monitoring**: Built-in performance tracking
- **Throttled Frame Rate**: 30fps on low-end devices vs 60fps on powerful ones
- **Memory Cleanup**: Automatic garbage collection optimizations
- **Responsive Design**: Adapts to device capabilities

### Visual Enhancements
- **Blurred Background**: Beautiful gradient with blur effects
- **Glass Morphism**: Modern UI with backdrop filters
- **Adaptive Effects**: Automatically disables expensive effects on weak hardware

## 📋 System Requirements

### Minimum Requirements
- **RAM**: 2GB (4GB recommended)
- **CPU**: Dual-core processor
- **Storage**: 2GB free space
- **GPU**: Integrated graphics (dedicated GPU recommended for better blur effects)

### Recommended Models for Low-End PCs
1. `llama3.2:1b` - Fastest, lowest memory usage
2. `phi3:mini` - Good balance of speed and quality
3. `gemma2:2b` - Slightly larger but still efficient

## ⚙️ Additional Optimizations You Can Apply

### 1. Ollama Model Selection
```bash
# Install the smallest model
ollama pull llama3.2:1b

# Or use an even smaller model
ollama pull phi3:mini
```

### 2. System-Level Optimizations
- Close unnecessary background applications
- Ensure at least 1GB free RAM before starting
- Use SSD storage if available
- Enable hardware acceleration in your browser

### 3. Browser Optimizations
- Use Chrome or Edge for better performance
- Enable hardware acceleration in browser settings
- Close other browser tabs while using the app
- Clear browser cache regularly

### 4. Environment Variables for Ultra Low-End PCs
Add these to your `.env` file for maximum performance:
```env
# Ultra low-end mode
DEFAULT_MODEL=llama3.2:1b
MAX_CONTEXT_TOKENS=1024
MAX_CONCURRENT_REQUESTS=1
CACHE_SIZE_MB=16
LOW_MEMORY_MODE=true
```

## 🔧 Troubleshooting Performance Issues

### If the app is still slow:
1. **Check RAM usage**: Task Manager → Performance → Memory
2. **Reduce model size**: Switch to `phi3:mini` or `llama3.2:1b`
3. **Disable blur effects**: Add `low-end-device` class to body
4. **Close other applications**: Free up system resources
5. **Check disk space**: Ensure at least 1GB free

### Performance Monitoring
The app includes built-in performance monitoring that will:
- Automatically detect low-end devices
- Reduce animation complexity
- Throttle frame rates
- Warn about slow operations in console

## 💡 Tips for Best Performance

1. **Start with the smallest model** and upgrade only if needed
2. **Keep conversations short** to reduce memory usage
3. **Restart the app periodically** to clear memory
4. **Use the desktop app** instead of browser when possible
5. **Monitor system resources** and close heavy applications

## 🎨 Visual Effects Control

The blur effects automatically adapt to your hardware:
- **High-end PCs**: Full blur and glass effects
- **Mid-range PCs**: Reduced blur intensity
- **Low-end PCs**: Minimal effects, solid backgrounds
- **Mobile devices**: Effects disabled for battery life

You can manually control this by adding CSS classes:
```css
/* Force low-end mode */
body.low-end-device {
  /* Disables expensive effects */
}
```

## 📊 Expected Performance

### Low-End PC (2GB RAM, Dual-core):
- **Model Loading**: 10-30 seconds
- **Response Time**: 5-15 seconds per message
- **Memory Usage**: 500MB-1GB
- **CPU Usage**: 50-80% during generation

### Mid-Range PC (8GB RAM, Quad-core):
- **Model Loading**: 5-10 seconds
- **Response Time**: 2-8 seconds per message
- **Memory Usage**: 1-2GB
- **CPU Usage**: 30-60% during generation

Remember: This is a completely **FREE** project under MIT License! 🎉