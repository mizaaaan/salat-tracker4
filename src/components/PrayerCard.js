/**
 * PrayerCard
 *
 * BUG 5 FIX: `activeOpacity={isTrackable ? 1 : 1}` was a dead ternary —
 * both branches were identical so no press feedback occurred on any card.
 * Fixed to `activeOpacity={isTrackable ? 0.92 : 1}` so trackable prayers
 * show a subtle dim on press (in addition to the spring scale animation).
 */

import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Image,
} from 'react-native';
import { useTheme } from '../constants/ThemeContext';

export default function PrayerCard({
  name, meta, time, endTime, isCompleted, isTrackable, onToggle,
}) {
  const { colors: Colors } = useTheme();

  // ── Animations ────────────────────────────────────────────────────────────
  const pressScale   = useRef(new Animated.Value(1)).current;
  const doneAnim     = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const checkScale   = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const checkOpacity = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(doneAnim,     { toValue: isCompleted ? 1 : 0, tension: 80,  friction: 8, useNativeDriver: false }),
      Animated.spring(checkScale,   { toValue: isCompleted ? 1 : 0, tension: 120, friction: 6, useNativeDriver: true }),
      Animated.timing(checkOpacity, { toValue: isCompleted ? 1 : 0, duration: 150,             useNativeDriver: true }),
    ]).start();
  }, [isCompleted]);

  const handlePress = () => {
    if (!isTrackable) return;
    Animated.sequence([
      Animated.timing(pressScale, { toValue: 0.97, duration: 70,  useNativeDriver: true }),
      Animated.spring(pressScale,  { toValue: 1,   tension: 200, friction: 5, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  // Animated colours (useNativeDriver: false required for colour interpolation)
  const leftBarColor = doneAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [meta.color, Colors.primary],
  });
  const overlayOpacity = doneAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.10],
  });
  const timeColor = doneAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [Colors.textSecondary, Colors.primary],
  });
  const ringBorderColor = doneAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [Colors.border, Colors.primary],
  });
  const ringBg = doneAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(0,0,0,0)', Colors.primary],
  });

  return (
    <Animated.View style={[{ transform: [{ scale: pressScale }] }, !isTrackable && styles.sunriseWrap]}>
      <TouchableOpacity
        onPress={handlePress}
        // BUG 5 FIX: was `isTrackable ? 1 : 1` (dead ternary, no feedback).
        // Now trackable prayers get a subtle dim on press; Sunrise stays opaque.
        activeOpacity={isTrackable ? 0.92 : 1}
        style={[styles.card, { backgroundColor: Colors.card }]}
      >
        {/* Layer 1: subtle prayer-colour wash */}
        <View style={[styles.wash, { backgroundColor: meta.color + '0D' }]} />

        {/* Layer 2: animated gold overlay on completion */}
        <Animated.View style={[styles.wash, { backgroundColor: Colors.primary, opacity: overlayOpacity }]} />

        {/* Layer 3: left glow bar */}
        <Animated.View style={[styles.leftBar, { backgroundColor: leftBarColor, shadowColor: meta.color }]} />

        {/* Content row */}
        <View style={styles.row}>

          {/* Icon */}
          <View style={[styles.iconBox, { backgroundColor: meta.color + '20', borderColor: meta.color + '30' }]}>
            {meta.image ? (
              <Image source={meta.image} style={styles.iconImage} resizeMode="cover" />
            ) : (
              <Text style={styles.iconEmoji}>{meta.icon}</Text>
            )}
          </View>

          {/* Name + Arabic */}
          <View style={styles.nameCol}>
            <Text style={[styles.name, { color: Colors.text }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.arabic, { color: meta.color }]}>{meta.arabic}</Text>
          </View>

          {/* Time + checkbox */}
          <View style={styles.rightCol}>
            <View style={styles.timeRange}>
              <Animated.Text style={[styles.time, { color: timeColor }]}>{time}</Animated.Text>
              {endTime ? (
                <>
                  <Text style={[styles.timeSep, { color: Colors.textMuted }]}> — </Text>
                  <Text style={[styles.timeEnd, { color: Colors.textSecondary }]}>{endTime}</Text>
                </>
              ) : null}
            </View>

            {isTrackable ? (
              <Animated.View style={[styles.ring, { borderColor: ringBorderColor, backgroundColor: ringBg }]}>
                <Animated.Text style={[
                  styles.checkmark,
                  { transform: [{ scale: checkScale }], opacity: checkOpacity, color: Colors.background },
                ]}>
                  ✓
                </Animated.Text>
              </Animated.View>
            ) : (
              <View style={[styles.markerDot, { backgroundColor: meta.color + '50' }]} />
            )}
          </View>

        </View>

        {/* Bottom border in prayer colour */}
        <View style={[styles.bottomLine, { backgroundColor: meta.color + '18' }]} />

      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sunriseWrap: { opacity: 0.52 },

  card: {
    borderRadius: 18,
    marginBottom: 10,
    overflow:     'hidden',
  },

  wash: { ...StyleSheet.absoluteFillObject },

  leftBar: {
    position:     'absolute',
    left:         0,
    top:          10,
    bottom:       10,
    width:        3,
    borderRadius: 3,
  },

  row: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingLeft:    22,
    paddingRight:   16,
    paddingTop:     13,
    paddingBottom:  13,
    gap:            14,
  },

  iconBox: {
    width:          44,
    height:         44,
    borderRadius:   12,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22, lineHeight: 26 },
  iconImage: { width: 40, height: 40, borderRadius: 10 },

  nameCol: { flex: 1, gap: 3 },
  name:    { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  arabic:  { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },

  rightCol: { alignItems: 'flex-end', gap: 10 },
  timeRange: {
    flexDirection:  'row',
    alignItems:     'center',
    flexWrap:       'wrap',
    justifyContent: 'flex-end',
  },
  time:    { fontSize: 13, fontWeight: '700', letterSpacing: 0.3, textAlign: 'right' },
  timeSep: { fontSize: 12, fontWeight: '400' },
  timeEnd: { fontSize: 13, fontWeight: '500', letterSpacing: 0.3, textAlign: 'right' },

  ring: {
    width:          30,
    height:         30,
    borderRadius:   15,
    borderWidth:    2,
    alignItems:     'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 14, fontWeight: '900', lineHeight: 16 },

  markerDot: { width: 8, height: 8, borderRadius: 4 },

  bottomLine: { height: 1, marginHorizontal: 22 },
});
