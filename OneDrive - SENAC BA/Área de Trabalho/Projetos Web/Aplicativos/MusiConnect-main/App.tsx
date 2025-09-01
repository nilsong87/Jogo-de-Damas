/**
 * Arquivo principal do MusiConnect.
 *
 * Envolve o app com os providers necessários (AuthProvider, PaperProvider) e renderiza o AppNavigator.
 * Este é o ponto de entrada do aplicativo.
 */
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './app/context/AuthContext';
import AppNavigator from './app/navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
