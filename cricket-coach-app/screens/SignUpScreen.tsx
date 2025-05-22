import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "../styles/SignUpStyles";
import { useRouter } from "expo-router";
import { validateSignUp } from "../js/signupValidation";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState({
    name: "",
    email: "",
    birthDate: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = () => {
    const validationErrors = validateSignUp({
      name,
      email,
      birthDate,
      role,
      password,
      confirmPassword,
    });

    const hasErrors = validationErrors && Object.values(validationErrors).some((msg) => msg !== "");


    if (validationErrors && typeof validationErrors === 'object') {
  setError(validationErrors);
} else {
  console.log("Signup success!", { name, email, birthDate, role });
  setError({
    name: "",
    email: "",
    birthDate: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  setName("");
  setEmail("");
  setBirthDate("");
  setPassword("");
  setConfirmPassword("");
  setRole("");
}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Join Us</Text>
      <Text style={styles.subheader}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#6B7280"
        value={name}
        onChangeText={setName}
      />
      {error.name ? <Text style={styles.error}>{error.name}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#6B7280"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {error.email ? <Text style={styles.error}>{error.email}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Birth Date (dd-mm-yyyy)"
        placeholderTextColor="#6B7280"
        value={birthDate}
        onChangeText={setBirthDate}
      />
      {error.birthDate ? (
        <Text style={styles.error}>{error.birthDate}</Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6B7280"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {error.password ? (
        <Text style={styles.error}>{error.password}</Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#6B7280"
        value={confirmPassword}
        secureTextEntry
        onChangeText={setConfirmPassword}
      />
      {error.confirmPassword ? (
        <Text style={styles.error}>{error.confirmPassword}</Text>
      ) : null}

      <View style={styles.radioContainer}>
        <TouchableOpacity
          onPress={() => setRole("Player")}
          style={styles.radioButton}
        >
          <View style={styles.radioCircle}>
            {role === "Player" && <View style={styles.radioDot} />}
          </View>
          <Text>Player</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole("Coach")}
          style={styles.radioButton}
        >
          <View style={styles.radioCircle}>
            {role === "Coach" && <View style={styles.radioDot} />}
          </View>
          <Text>Coach</Text>
        </TouchableOpacity>
      </View>
      {error.role ? <Text style={styles.error}>{error.role}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/")}>
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.linkText}>Back to Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
