/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, StatusBar, useColorScheme, View} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import PhotoCaptureView from './src/ui/PhotoCaptureView';
import {Provider} from 'react-redux';
import {store} from './src/store';
import {NativeRouter, Route, Routes} from 'react-router-native';
import PhotoListView from './src/ui/PhotoListView';

const backgroundStyle = {
  backgroundColor: Colors.lighter,
  flex: 1,
};

const App = () => {
  return (
    <NativeRouter>
      <Provider store={store}>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar barStyle={'light-content'} />
          <View
            style={{
              backgroundColor: Colors.white,
              flex: 1,
            }}>
            <Routes>
              <Route path="/" element={<PhotoListView />} />
              <Route path="/capture" element={<PhotoCaptureView />} />
            </Routes>
          </View>
        </SafeAreaView>
      </Provider>
    </NativeRouter>
  );
};

export default App;
