import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';

const SwipeableListItem = ({ 
  children, 
  onEdit, 
  onDelete, 
  editIcon = 'pencil',
  deleteIcon = 'delete'
}) => {
  const { theme } = useTheme();
  const swipeAnimation = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
        // Only recognize horizontal swipes, ignore vertical
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderMove: (evt, { dx }) => {
        // Only allow left swipe (negative dx), limit to -120px
        if (dx < 0) {
          const clampedDx = Math.max(Math.min(dx, 0), -120);
          swipeAnimation.setValue(clampedDx);
        }
      },
      onPanResponderRelease: (evt, { dx, vx }) => {
        // Use velocity for faster swipe detection
        const shouldOpen = dx < -40 || vx < -0.5;
        
        Animated.spring(swipeAnimation, {
          toValue: shouldOpen ? -120 : 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 10,
        }).start();
      },
    })
  ).current;

  const handleEdit = () => {
    // Close swipe before action
    Animated.timing(swipeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onEdit?.();
    });
  };

  const handleDelete = () => {
    // Close swipe before action
    Animated.timing(swipeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete?.();
    });
  };

  return (
    <View style={styles.container}>
      {/* Action buttons container - Hidden by default, revealed on swipe */}
      <View style={[styles.actionsContainer, { backgroundColor: theme.colors.error }]}>
        <IconButton
          icon={editIcon}
          size={20}
          iconColor="white"
          onPress={handleEdit}
          style={styles.editButton}
        />
        <IconButton
          icon={deleteIcon}
          size={20}
          iconColor="white"
          onPress={handleDelete}
          style={styles.deleteButton}
        />
      </View>

      {/* Swipeable content - Slides left to reveal buttons */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX: swipeAnimation }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  editButton: {
    margin: 0,
  },
  deleteButton: {
    margin: 0,
  },
  content: {
    zIndex: 1,
  },
});

export default SwipeableListItem;
