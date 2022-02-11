import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import TransactionScreen from "./screens/transaction";
import SearchScreen from "./screens/search";

const tab = createBottomTabNavigator();

export default class BottomTabNavigator extends Component {
  render() {
    return (
      <NavigationContainer>
        <tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === "Transaction") {
                iconName = "book";
              } else if (route.name === "Search") {
                iconName = "search";
              }
              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: "rgba(255, 255, 255, 0.7)",
            inactiveTintColor: "black",
            style: {
              height: 60,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            },
            labelStyle: {
              fontSize: 20,
              fontFamily: "Rajdhani_600SemiBold",
            },
            labelPosition: "beside-icon",
            tabStyle: {
              marginLeft: 10,
              marginRight: 10,
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <tab.Screen
            name="Transaction"
            component={TransactionScreen}
            initialParams={{ email: this.props.navigation.state.params?.email }}
          />
          <tab.Screen name="Search" component={SearchScreen} />
        </tab.Navigator>
      </NavigationContainer>
    );
  }
}
