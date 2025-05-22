import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/StudentsStyles';
import { FontAwesome, Feather } from '@expo/vector-icons';

const students = ['Andy', 'Brian', 'Chiku', 'Danny'];

const StudentsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Feather name="user" size={50} color="#1D4ED8" />
        <Text style={styles.title}>Students</Text>
      </View>

      {students.map((student, index) => (
        <TouchableOpacity key={index} style={styles.item}>
          <FontAwesome name="user" size={20} color="#111827" />
          <Text style={styles.itemText}>{student}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.item}>
        <Feather name="user-plus" size={20} color="#111827" />
        <Text style={styles.itemText}>Add Student</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Feather name="settings" size={20} color="#111827" />
        <Text style={styles.itemText}>Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default StudentsScreen;
