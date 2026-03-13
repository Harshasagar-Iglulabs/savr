/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import {handleBackgroundFcmMessage} from './src/services/pushNotifications';

messaging().setBackgroundMessageHandler(async message => {
  handleBackgroundFcmMessage(message);
});

AppRegistry.registerComponent(appName, () => App);
