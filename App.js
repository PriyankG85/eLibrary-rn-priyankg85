import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import BottomMenuBar from "./bottomTabNavigator";
import * as Fonts from "expo-font";
import { Rajdhani_600SemiBold } from "@expo-google-fonts/rajdhani";
import LoginScreen from "./screens/loginFormScreen";
import SignupScreen from "./screens/signupFormScreen";
import { createSwitchNavigator, createAppContainer } from "react-navigation";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isFontLoaded: false,
    };
  }

  async loadFonts() {
    await Fonts.loadAsync({
      Rajdhani_600SemiBold,
    });
    this.setState({ isFontLoaded: true });
  }

  componentDidMount() {
    this.loadFonts();
  }

  render() {
    const { isFontLoaded } = this.state;
    if (isFontLoaded) {
      return (
        <View style={styles.container}>
          <StatusBar style="auto" />
          <AppContainer />
        </View>
      );
    }
    return null;
  }
}

const AppNavigator = createSwitchNavigator(
  {
    LoginScreen,
    SignupScreen,
    BottomMenuBar,
  },
  { initialRouteName: "LoginScreen" }
);

const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#efefef",
    overflow: "hidden",
  },
});
