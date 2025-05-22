import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import CoachDrawerContent from "./CoachDrawerContent";
import { styles } from "../styles/CoachHomeStyles";

const Drawer = createDrawerNavigator();

const HomeContent = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={styles.menu}>☰</Text>
        </TouchableOpacity>
        <View style={styles.profile}>
          <Text style={styles.name}>Coach Mit</Text>
          <Image source={require("../assets/images/boy.png")} style={styles.profileImage} />
        </View>
      </View>
      <View style={styles.stats}>
        <View style={styles.statBox}><Text style={styles.statLabel}>Students</Text><Text style={styles.statValue}>25</Text></View>
        <View style={styles.statBox}><Text style={styles.statLabel}>Sessions</Text><Text style={styles.statValue}>12</Text></View>
        <View style={styles.statBox}><Text style={styles.statLabel}>Videos</Text><Text style={styles.statValue}>48</Text></View>
      </View>
    </View>
  );
};

export default function CoachHomeScreen() {
  return (
      <Drawer.Navigator drawerContent={(props) => <CoachDrawerContent {...props} />}>
        <Drawer.Screen name="Home" component={HomeContent} />
      </Drawer.Navigator>
  );
}
