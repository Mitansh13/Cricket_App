import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/SettingsStyles';
import { AntDesign } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.closeDrawer()}>
        <AntDesign name="close" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Settings</Text>

      {/* Placeholder Content */}
      <Text style={styles.placeholder}>Customize your preferences here.</Text>
    </View>
  );
};

export default SettingsScreen;
