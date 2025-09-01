/**
 * Navegador de grupos do MusiConnect.
 *
 * Gerencia navegação entre telas de grupos e perfil de grupo.
 * Use este navigator para funcionalidades relacionadas a grupos.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupsScreen from '../screens/GroupsScreen';
import GroupProfileScreen from '../screens/GroupProfileScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';

export type GroupStackParamList = {
  GroupsList: undefined;
  GroupProfile: { groupId: string };
  CreateGroup: undefined;
};

const Stack = createNativeStackNavigator<GroupStackParamList>();

const GroupStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupProfile" component={GroupProfileScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
    </Stack.Navigator>
  );
};

export default GroupStackNavigator;
