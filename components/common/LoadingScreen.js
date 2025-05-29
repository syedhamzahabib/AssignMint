// src/components/common/LoadingScreen.js
// Reusable loading screen component

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants';

const LoadingScreen = ({ 
  message = 'Loading...', 
  submessage,
  color = COLORS.primary,
  size = 'large',
  showAnimation = true,
  style,
  fullScreen = true 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (showAnimation) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, scaleAnim, showAnimation]);

  const Container = fullScreen ? View : React.Fragment;
  const containerStyle = fullScreen ? [styles.fullScreen, style] : style;

  return (
    <Container style={containerStyle}>
      <Animated.View 
        style={[
          styles.container,
          !fullScreen && styles.inlineContainer,
          showAnimation && {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.loadingContent}>
          {/* Activity Indicator */}
          <ActivityIndicator 
            size={size} 
            color={color} 
            style={styles.spinner}
          />
          
          {/* Main Message */}
          <Text style={[styles.message, { color }]}>
            {message}
          </Text>
          
          {/* Sub Message */}
          {submessage && (
            <Text style={styles.submessage}>
              {submessage}
            </Text>
          )}
          
          {/* Loading Dots Animation */}
          <LoadingDots color={color} />
        </View>
      </Animated.View>
    </Container>
  );
};

// Animated loading dots component
const LoadingDots = ({ color }) => {
  const dot1Anim = React.useRef(new Animated.Value(0)).current;
  const dot2Anim = React.useRef(new Animated.Value(0)).current;
  const dot3Anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const createDotAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 200),
      createDotAnimation(dot3Anim, 400),
    ]).start();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View style={styles.dotsContainer}>
      {[dot1Anim, dot2Anim, dot3Anim].map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: color },
            {
              opacity: anim,
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

// Skeleton loader component for content placeholders
export const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.gray200,
          opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          }),
        },
        style,
      ]}
    />
  );
};

// Card skeleton for loading task cards
export const TaskCardSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonHeader}>
      <SkeletonLoader width="60%" height={16} />
      <SkeletonLoader width="20%" height={16} />
    </View>
    <SkeletonLoader width="80%" height={12} style={{ marginBottom: SPACING.sm }} />
    <SkeletonLoader width="40%" height={12} style={{ marginBottom: SPACING.md }} />
    <View style={styles.skeletonFooter}>
      <SkeletonLoader width="30%" height={24} borderRadius={12} />
      <SkeletonLoader width="25%" height={24} borderRadius={12} />
    </View>
  </View>
);

// Multiple task cards skeleton
export const TaskListSkeleton = ({ count = 3 }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <TaskCardSkeleton key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  inlineContainer: {
    flex: 0,
    paddingVertical: SPACING.xl,
  },
  loadingContent: {
    alignItems: 'center',
    maxWidth: 280,
  },
  spinner: {
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semiBold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  submessage: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Skeleton styles
  skeletonCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default LoadingScreen;