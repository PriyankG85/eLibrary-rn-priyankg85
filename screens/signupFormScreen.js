import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { t } from "react-native-tailwindcss";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

const SignupFormScreen = ({ navigation }) => {
  const [uname, setUname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");

  const handleAuthFirebase = () => {
    createUserWithEmailAndPassword(getAuth(), email, password)
      .then((credentials) => {
        navigation.navigate("BottomMenuBar", {
          uid: credentials.user.uid,
          email: credentials.user.email,
          password: credentials.user.password,
        });
      })
      .catch((err) => alert(err.message));
  };

  return (
    <View style={[t.bgGray600, t.flex1, t.itemsCenter, t.justifyCenter]}>
      <Text style={[t.pB16, t.text4xl, t.fontBold, { color: "#efefef" }]}>
        Sign Up
      </Text>
      <TextInput
        style={[
          t.p2,
          t.textCenter,
          t.textWhite,
          t.border,
          t.borderWhite,
          t.textLg,
          t.roundedSm,
        ]}
        autoFocus
        onChangeText={(e) => setUname(e)}
        placeholder={"Enter Username"}
        placeholderTextColor={"#efefef"}
      />
      <TextInput
        style={[
          t.p2,
          t.mT6,
          t.textCenter,
          t.textWhite,
          t.border,
          t.borderWhite,
          t.textLg,
          t.roundedSm,
        ]}
        onChangeText={(e) => setEmail(e)}
        placeholder={"Enter Email"}
        placeholderTextColor={"#efefef"}
      />
      <TextInput
        style={[
          t.p2,
          t.mT6,
          t.textCenter,
          t.textWhite,
          t.border,
          t.borderWhite,
          t.textLg,
          t.roundedSm,
        ]}
        secureTextEntry
        onChangeText={(e) => setPass(e)}
        placeholder={"Enter Password"}
        placeholderTextColor={"#efefef"}
      />
      <TouchableOpacity
        disabled={email.length === 0 || password.length === 0 ? true : false}
        onPress={() =>
          (email.length !== 0 || password.length !== 0) && handleAuthFirebase()
        }
        style={[t.pX3, t.pY1, t.mT12, t.border, t.borderWhite, t.roundedSm]}
      >
        <Text style={[t.textLg, t.textWhite]}>Signup</Text>
      </TouchableOpacity>
      <View style={[t.flexRow, t.itemsCenter, t.mT5]}>
        <Text style={[t.textSm, t.textGray200]}>Already have an account </Text>
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <Text style={[t.textSm, t.textBlue300]}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupFormScreen;
