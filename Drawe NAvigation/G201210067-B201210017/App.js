// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AdminNavigator } from './navigations/admin.navigation';
import { AuthNavigator } from './navigations/auth.navigation';

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer >
      <Stack.Navigator screenOptions={{ headerShown: false, navigationBarHidden: true, gestureEnabled: false}}>
        <Stack.Screen name={'auth'} component={AuthNavigator} />
        <Stack.Screen name={'admin'} component={AdminNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
