/**
 * Navegador principal do MusiConnect.
 *
 * Gerencia a navegação global entre as telas principais do app.
 * Importe e use este componente como root navigator no App.tsx.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen'; // Import EditPostScreen

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="CreatePost" 
              component={CreatePostScreen} 
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen // Add EditPostScreen as a modal
              name="EditPost" 
              component={EditPostScreen} 
              options={{ presentation: 'modal' }}
            />
          </Stack.Group>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
