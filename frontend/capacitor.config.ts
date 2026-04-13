import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.easeon380.app',
  appName: 'Ease-On',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['easeon-380.web.app', '*.firebaseapp.com', '*.googleapis.com']
  }
};

export default config;
