import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles/CoachDrawerStyles";
import { DrawerContentComponentProps } from "@react-navigation/drawer";

import {
  FontAwesome5,
  MaterialIcons,
  Entypo,
  Feather,
} from "@expo/vector-icons";

const CoachDrawerContent = (props: DrawerContentComponentProps) => {
  const navigation = useNavigation();

  const handleNavigate = (screenName: string) => {
    navigation.navigate(screenName as never); // 'as never' avoids TS errors for now
  };

  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawerContent}>
      <View style={styles.profileSection}>
        <Image
          source={require("../assets/images/boy.png")}
          style={styles.profileImage}
        />
        <Text style={styles.coachName}>Coach Mit</Text>
        <Text style={styles.coachRole}>Head Coach</Text>
      </View>

      <TouchableOpacity
        onPress={() => handleNavigate("PersonalInfo")}
        style={styles.menuItem}
      >
        <FontAwesome5 name="user" size={20} color="#1D4ED8" />
        <Text style={styles.menuText}>Personal Information</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigate("Students")}
        style={styles.menuItem}
      >
        <FontAwesome5 name="graduation-cap" size={20} color="#1D4ED8" />
        <Text style={styles.menuText}>Students</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigate("AllVideos")}
        style={styles.menuItem}
      >
        <Entypo name="video" size={20} color="#1D4ED8" />
        <Text style={styles.menuText}>All Videos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigate("AllPictures")}
        style={styles.menuItem}
      >
        <Entypo name="image" size={20} color="#1D4ED8" />
        <Text style={styles.menuText}>All Pictures</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigate("Favourites")}
        style={styles.menuItem}
      >
        <FontAwesome5 name="heart" size={20} color="#1D4ED8" />
        <Text style={styles.menuText}>Favourites</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigate("Settings")}
        style={styles.menuItem}
      >
        <Feather name="settings" size={20} color="#1D4ED8" />
        <Text style={styles.menuText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        // onPress={() => handleLogout()} // You need to define this function
        style={styles.menuItem}
      >
        <Feather name="log-out" size={20} color="red" />
        <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default CoachDrawerContent;
