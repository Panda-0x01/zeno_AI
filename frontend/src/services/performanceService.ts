/**
 * Performance optimization service for low-end PCs
 */
export class PerformanceService {
  private static instance: PerformanceService;
  private isLowEndDevice = false;
  private performanceObserver?: PerformanceObserver;

  private constructor() {
    this.detectDeviceCapabilities();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private detectDeviceCapabilities(): void {
    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    
    // Consider low-end if:
    // - Less than 4GB RAM
    // - Less than 4 CPU cores
    // - Mobile device
    this.isLowEndDevice = 
      deviceMemory < 4 || 
      hardwareConcurrency < 4 || 
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (this.isLowEndDevice) {
      console.log('Low-end device detected, enabling performance optimizations');
      this.enableLowEndOptimizations();
    }
  }

  private enableLowEndOptimizations(): void {
    // Add CSS class for low-end optimizations
    document.body.classList.add('low-end-device');
    
    // Reduce animation frame rate
    this.throttleAnimations();
    
    // Enable reduced motion
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
  }

  private throttleAnimations(): void {
    // Override requestAnimationFrame to reduce frame rate on low-end devices
    const originalRAF = window.requestAnimationFrame;
    let lastTime = 0;
    const targetFPS = this.isLowEndDevice ? 30 : 60;
    const interval = 1000 / targetFPS;

    window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      return originalRAF((currentTime: number) => {
        if (currentTime - lastTime >= interval) {
          lastTime = currentTime;
          callback(currentTime);
        }
      });
    };
  }

  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.duration > 16) {
            console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  // Debounce function for expensive operations
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Throttle function for frequent operations
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Check if device is low-end
  isLowEnd(): boolean {
    return this.isLowEndDevice;
  }

  // Get optimal chunk size for processing
  getOptimalChunkSize(): number {
    return this.isLowEndDevice ? 50 : 100;
  }

  // Get optimal timeout for operations
  getOptimalTimeout(): number {
    return this.isLowEndDevice ? 5000 : 3000;
  }

  // Memory cleanup
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Export singleton instance
export const performanceService = PerformanceService.getInstance();