import 'react-native-gesture-handler';

import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Routes from './routes';
import AppProvider from './hooks/index';

declare const global: { HermesInternal: null | {} };

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#312e38" />
      <AppProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#312e38' }}>
          <Routes />
        </SafeAreaView>
      </AppProvider>
    </NavigationContainer>
  );
};

export default App;
