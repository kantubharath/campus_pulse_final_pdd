import React, { useEffect } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const Loader = () => {
  const spinValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.loaderWrapper}>
        <Animated.View style={[styles.outerRing, {
          transform: [{ rotate: spin }, { scale: pulseValue }],
        },]} />
        {[0, 1, 2].map((index) => (
          <Animated.View key={index} style={[styles.dot, {
            transform: [
              { rotate: `${index * 120}deg` },
              { translateY: -40 },
              { scale: pulseValue },
            ],
          },]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  loaderWrapper: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  outerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#6b48ff",
    borderStyle: 'dashed',
    position: 'absolute',
    top: 10,
    left: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00c853",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -6,
    marginTop: -6,
  },
});


export default Loader;