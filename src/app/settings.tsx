import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PinInputModal } from '../components/PinInputModal';
import { syncWidgetData } from '../utils/WidgetSync';

const SectionHeader = ({ title, color }: { title: string, color: string }) => (
  <Text style={[styles.sectionHeader, { color }]}>{title}</Text>
);

const SettingItem = ({ 
  icon, 
  label, 
  value, 
  onPress, 
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  colors,
  imageUri
}: { 
  icon?: any, 
  label: string, 
  value?: string, 
  onPress?: () => void,
  isSwitch?: boolean,
  switchValue?: boolean,
  onSwitchChange?: (val: boolean) => void,
  colors: any,
  imageUri?: string | null
}) => (
  <TouchableOpacity 
    style={[styles.item, { borderBottomColor: colors.border }]} 
    onPress={onPress} 
    activeOpacity={isSwitch ? 1 : 0.7}
    disabled={isSwitch}
  >
    <View style={styles.itemLeft}>
      {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarImage} />
      ) : (
          <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name={icon || "person-outline"} size={20} color={colors.text} />
          </View>
      )}
      <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
    </View>
    <View style={styles.itemRight}>
      {isSwitch ? (
        <Switch 
          value={switchValue} 
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.surfaceHighlight, true: colors.success }}
          thumbColor={'#FFFFFF'}
          ios_backgroundColor={colors.surfaceHighlight}
        />
      ) : (
        <>
          {value && <Text style={[styles.itemValue, { color: colors.text }]}>{value}</Text>}
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </>
      )}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, theme, language, name, avatarUri, birthDate, targetDate, lifeExpectancy, isJournalLocked, journalPin, t, setTheme, setLanguage, setName, setAvatarUri, setBirthDate, setTargetDate, setLifeExpectancy, setJournalLock } = useSettings();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'name' | 'lifeExpectancy'>('name');
  const [tempValue, setTempValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinFlow, setPinFlow] = useState<'enable' | 'disable' | 'change'>('enable');

  const handleJournalLockToggle = (value: boolean) => {
      if (value) {
          // Enable lock
          setPinFlow('enable');
          setPinModalVisible(true);
      } else {
          // Disable lock - verify first
          setPinFlow('disable');
          setPinModalVisible(true);
      }
  };

  const handlePinSuccess = async (pin: string) => {
      if (pinFlow === 'enable') {
          await setJournalLock(pin);
          setPinModalVisible(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (pinFlow === 'disable') {
          await setJournalLock(null);
          setPinModalVisible(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
  };

  const showDocument = (title: string, content: string) => {
      Alert.alert(title, content, [{ text: 'Close' }]);
  };

  const toggleTheme = (val: boolean) => {
      Haptics.selectionAsync();
      setTheme(val ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
      Haptics.selectionAsync();
      setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handleAvatarPick = () => {
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    if (avatarUri) {
        Alert.alert(
            t('profile_avatar'),
            '',
            [
                { text: t('journal_cancel'), style: 'cancel' },
                { 
                    text: t('journal_delete'), 
                    style: 'destructive',
                    onPress: () => {
                        setAvatarUri(null);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                },
                { 
                    text: t('mood_edit'), 
                    onPress: pickImage 
                }
            ]
        );
    } else {
        pickImage();
    }
  };

  const openModal = (type: 'name' | 'lifeExpectancy') => {
      setModalType(type);
      if (type === 'name') setTempValue(name || '');
      else if (type === 'lifeExpectancy') setTempValue(lifeExpectancy || '');
      setModalVisible(true);
  };

  const openDatePicker = () => {
      setTempDate(birthDate ? new Date(birthDate) : new Date());
      setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (selectedDate && event.type !== 'dismissed') {
            const dateStr = selectedDate.toISOString().split('T')[0];
            setBirthDate(dateStr);
        }
    } else {
        if (selectedDate) {
            setTempDate(selectedDate);
        }
    }
  };

  const saveDate = () => {
      const dateStr = tempDate.toISOString().split('T')[0];
      setBirthDate(dateStr);
      setShowDatePicker(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Sync widget data immediately
      if (Platform.OS === 'android' && targetDate) {
          syncWidgetData(targetDate, dateStr);
      }
  };

  const saveValue = () => {
      const val = tempValue.trim();
      if (modalType === 'name') {
          setName(val);
      } else if (modalType === 'lifeExpectancy') {
          setLifeExpectancy(val);
          // Sync widget data if birthDate exists
          if (Platform.OS === 'android' && birthDate) {
            // Calculate target date based on new life expectancy
            // This logic duplicates Context logic, ideally should wait for Context update
            // But for immediate feedback we can approximate or rely on Context effect in _layout
            // For now, let's trust _layout effect for this one as it involves date calculation logic
          }
      }
      setModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getModalTitle = () => {
      if (modalType === 'name') return t('profile_name');
      if (modalType === 'lifeExpectancy') return t('pref_target_age');
      return '';
  };

  const getPlaceholder = () => {
      if (modalType === 'name') return t('profile_placeholder_name');
      return t('pref_placeholder_age');
  };

  const userAgreement = t('legal_ua_content');
  const privacyPolicy = t('legal_pp_content');
  const helpContent = t('about_help_content');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings_title')}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile */}
        <SectionHeader title={t('profile_section')} color={colors.textSecondary} />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
             <SettingItem 
                imageUri={avatarUri}
                icon="person-circle-outline"
                label={t('profile_avatar')} 
                value={avatarUri ? t('mood_edit') : t('mood_log')} 
                onPress={handleAvatarPick}
                colors={colors} 
              />
             <SettingItem 
                icon="text-outline" 
                label={t('profile_name')} 
                value={name || t('profile_placeholder_name')} 
                onPress={() => openModal('name')}
                colors={colors} 
              />
        </View>

        {/* Countdown Settings */}
        <SectionHeader title={t('pref_countdown_section')} color={colors.textSecondary} />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
             <SettingItem 
                icon="calendar-outline" 
                label={t('pref_birth_date')} 
                value={birthDate || t('pref_placeholder_date')} 
                onPress={openDatePicker}
                colors={colors} 
              />
             <SettingItem 
                icon="hourglass-outline" 
                label={t('pref_target_age')} 
                value={lifeExpectancy ? `${lifeExpectancy}` : t('pref_placeholder_age')} 
                onPress={() => openModal('lifeExpectancy')}
                colors={colors} 
              />
        </View>

        {/* Preferences */}
        <SectionHeader title={t('pref_section')} color={colors.textSecondary} />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingItem 
            icon="lock-closed-outline" 
            label={t('journal_lock') || "Journal Lock"} // Fallback if translation missing
            isSwitch
            switchValue={isJournalLocked}
            onSwitchChange={handleJournalLockToggle}
            colors={colors} 
          />
          <SettingItem 
            icon="language-outline" 
            label={t('pref_language')} 
            value={language === 'en' ? 'English' : '中文'} 
            onPress={toggleLanguage}
            colors={colors} 
          />
          <SettingItem 
            icon={theme === 'dark' ? "moon-outline" : "sunny-outline"} 
            label={t('pref_theme')}
            isSwitch
            switchValue={theme === 'dark'}
            onSwitchChange={toggleTheme}
            colors={colors}
          />
        </View>

        {/* About */}
        <SectionHeader title={t('about_section')} color={colors.textSecondary} />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.aboutHeader, { borderBottomColor: colors.border }]}>
             <View style={[styles.logoPlaceholder, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                 <Image source={require('../../assets/icon.png')} style={{ width: 64, height: 64, borderRadius: 16 }} />
             </View>
             <Text style={[styles.appName, { color: colors.text }]}>每日刻度</Text>
             <Text style={[styles.version, { color: colors.textTertiary }]}>Version 1.0.0</Text>
          </View>
          
          <SettingItem 
            icon="people-outline" 
            label={t('about_devs')} 
            value="jaysen & Daxin" 
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem 
            icon="help-circle-outline" 
            label={t('about_help')} 
            onPress={() => showDocument(t('about_help'), helpContent)} 
            colors={colors}
          />
        </View>

        {/* Legal */}
        <SectionHeader title={t('legal_section')} color={colors.textSecondary} />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingItem 
            icon="document-text-outline" 
            label={t('legal_user_agreement')} 
            onPress={() => showDocument(t('legal_user_agreement'), userAgreement)} 
            colors={colors}
          />
          <SettingItem 
            icon="shield-checkmark-outline" 
            label={t('legal_privacy')} 
            onPress={() => showDocument(t('legal_privacy'), privacyPolicy)} 
            colors={colors}
          />
        </View>

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
            {t('footer_designed')} 两个像素
        </Text>
        
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
             <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                 <View style={styles.modalBackdrop}>
                     <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                 </View>
             </TouchableWithoutFeedback>
             <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                 <Text style={[styles.modalTitle, { color: colors.text }]}>{getModalTitle()}</Text>
                 <TextInput 
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceHighlight }]}
                    value={tempValue}
                    onChangeText={setTempValue}
                    placeholder={getPlaceholder()}
                    placeholderTextColor={colors.textTertiary}
                    autoFocus
                    keyboardType={modalType === 'lifeExpectancy' ? 'numeric' : 'default'}
                 />
                 <View style={styles.modalActions}>
                     <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                         <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>{t('journal_cancel')}</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.todayIndicator }]} onPress={saveValue}>
                         <Text style={[styles.modalBtnText, { color: colors.background, fontWeight: 'bold' }]}>{t('editor_save')}</Text>
                     </TouchableOpacity>
                 </View>
             </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* PIN Modal */}
      <PinInputModal 
          visible={pinModalVisible}
          onClose={() => setPinModalVisible(false)}
          onSuccess={handlePinSuccess}
          isSetting={pinFlow === 'enable'}
          currentPin={journalPin}
      />

      {/* Date Picker Modal (iOS) or conditional (Android) */}
      {showDatePicker && (
          Platform.OS === 'ios' ? (
             <Modal visible={showDatePicker} transparent animationType="fade">
                 <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                     <View style={styles.modalOverlay}>
                        <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                        <TouchableWithoutFeedback>
                            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, width: '90%', maxWidth: 360, alignItems: 'center', zIndex: 10 }}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="inline"
                                    onChange={handleDateChange}
                                    style={{ width: '100%' }}
                                    maximumDate={new Date()}
                                    locale={language === 'zh' ? 'zh-CN' : 'en-US'}
                                    themeVariant={theme}
                                />
                                <TouchableOpacity 
                                    style={{ marginTop: 16, paddingVertical: 12, paddingHorizontal: 32, backgroundColor: colors.todayIndicator, borderRadius: 25, width: '100%', alignItems: 'center' }}
                                    onPress={saveDate}
                                >
                                    <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>{t('editor_done')}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                     </View>
                 </TouchableWithoutFeedback>
             </Modal>
          ) : (
             <DateTimePicker
                value={birthDate ? new Date(birthDate) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
             />
          )
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
      padding: 4,
  },
  title: {
    fontSize: 18,
    ...FONTS.bold,
  },
  scrollContent: {
      padding: SPACING.lg,
      paddingBottom: 50,
  },
  sectionHeader: {
      fontSize: 12,
      ...FONTS.bold,
      textTransform: 'uppercase',
      marginBottom: SPACING.sm,
      marginTop: SPACING.md,
      marginLeft: SPACING.xs,
  },
  section: {
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      borderWidth: 1,
      marginBottom: SPACING.lg,
  },
  item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: SPACING.md,
      borderBottomWidth: 1,
  },
  itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
  },
  iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
  },
  avatarImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
  },
  itemLabel: {
      fontSize: 16,
      ...FONTS.medium,
  },
  itemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  itemValue: {
      fontSize: 14,
  },
  aboutHeader: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
      borderBottomWidth: 1,
  },
  logoPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
      borderWidth: 1,
  },
  appName: {
      fontSize: 20,
      ...FONTS.bold,
  },
  appCnName: {
      fontSize: 18,
      fontWeight: 'normal',
  },
  version: {
      fontSize: 12,
      marginTop: 4,
  },
  footer: {
      textAlign: 'center',
      fontSize: 12,
      marginTop: SPACING.lg,
  },
  
  // Modal
  modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      padding: SPACING.xl,
  },
  modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      borderWidth: 1,
      gap: SPACING.lg,
  },
  modalTitle: {
      fontSize: 18,
      ...FONTS.bold,
      textAlign: 'center',
  },
  input: {
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      fontSize: 16,
  },
  modalActions: {
      flexDirection: 'row',
      gap: SPACING.md,
  },
  modalBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: RADIUS.round,
  },
  modalBtnText: {
      fontSize: 16,
  },
});
