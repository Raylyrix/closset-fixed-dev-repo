import React, { useState, useEffect } from 'react';
import { MainLayout } from './MainLayout';
import { TabletLayout } from './TabletLayout';

interface ResponsiveLayoutProps {
  children?: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // Check for touch capability
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Device detection logic
      if (width >= 1024) {
        setDeviceType('desktop');
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('mobile');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return <div style={{ width: '100vw', height: '100vh', background: '#0f0f23' }} />;
  }

  // Render appropriate layout based on device type
  switch (deviceType) {
    case 'tablet':
      return <TabletLayout>{children}</TabletLayout>;
    case 'mobile':
      return <TabletLayout>{children}</TabletLayout>; // Use tablet layout for mobile too
    case 'desktop':
    default:
      return <MainLayout>{children}</MainLayout>;
  }
}




