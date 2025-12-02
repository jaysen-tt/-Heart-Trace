import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RADIUS, SPACING, FONTS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

interface PhotoCardProps {
  photoUri?: string;
  onPhotoSelect: (uri: string | undefined) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photoUri, onPhotoSelect }) => {
  const { colors, t } = useSettings();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onPhotoSelect(result.assets[0].uri);
    }
  };

  const handleLongPress = () => {
    if (!photoUri) return;
    Alert.alert(
        'Remove Photo',
        'Do you want to remove this daily moment?',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => onPhotoSelect(undefined) }
        ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('photo_title')}</Text>
        <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
      </View>

      <TouchableOpacity 
        style={[styles.photoArea, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]} 
        onPress={pickImage}
        onLongPress={handleLongPress}
        activeOpacity={0.9}
      >
        {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
            <View style={styles.placeholder}>
                <Ionicons name="add" size={32} color={colors.textTertiary} />
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>{t('photo_placeholder')}</Text>
            </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    ...FONTS.bold,
  },
  photoArea: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
  },
  placeholder: {
      alignItems: 'center',
      gap: 8,
  },
  placeholderText: {
      fontSize: 14,
  }
});
