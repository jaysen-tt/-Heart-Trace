import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

interface PinInputModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void;
    isSetting?: boolean;
    currentPin?: string | null;
}

export const PinInputModal = ({ 
    visible, 
    onClose, 
    onSuccess, 
    isSetting = false, 
    currentPin = null 
}: PinInputModalProps) => {
    const { colors, t } = useSettings();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'verify' | 'create' | 'confirm'>('verify');
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (visible) {
            setPin('');
            setConfirmPin('');
            setError('');
            setStep(isSetting ? 'create' : 'verify');
        }
    }, [visible, isSetting]);

    const handleNumberPress = (num: string) => {
         Haptics.selectionAsync();
         setError('');
         
         if (step === 'verify') {
             const newPin = pin + num;
             if (newPin.length <= 4) setPin(newPin);
             if (newPin.length === 4) {
                 if (newPin === currentPin) {
                     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                     setTimeout(() => onSuccess(newPin), 200);
                 } else {
                     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                     setError(t('pin_incorrect'));
                     setTimeout(() => setPin(''), 500);
                 }
             }
         } else if (step === 'create') {
             const newPin = pin + num;
             if (newPin.length <= 4) setPin(newPin);
             if (newPin.length === 4) {
                 setTimeout(() => {
                     setStep('confirm');
                 }, 200);
             }
         } else if (step === 'confirm') {
             const newConf = confirmPin + num;
             if (newConf.length <= 4) setConfirmPin(newConf);
             if (newConf.length === 4) {
                 if (newConf === pin) {
                     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                     setTimeout(() => onSuccess(newConf), 200);
                 } else {
                     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                     setError(t('pin_mismatch'));
                     setTimeout(() => {
                         setStep('create');
                         setPin('');
                         setConfirmPin('');
                     }, 1000);
                 }
             }
         }
    };

    const handleDelete = () => {
        Haptics.selectionAsync();
        if (step === 'verify' || step === 'create') {
            setPin(prev => prev.slice(0, -1));
        } else {
            setConfirmPin(prev => prev.slice(0, -1));
        }
    };

    if (!visible) return null;

    const getTitle = () => {
        if (step === 'verify') return t('pin_enter');
        if (step === 'create') return t('pin_set');
        if (step === 'confirm') return t('pin_confirm');
    };

    const currentVal = (step === 'verify' || step === 'create') ? pin : confirmPin;

    return (
        <Modal visible={visible} transparent animationType="slide">
             <View style={styles.pinOverlay}>
                 <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
                 <TouchableOpacity style={styles.closePin} onPress={onClose}>
                     <Ionicons name="close" size={28} color={colors.text} />
                 </TouchableOpacity>
                 
                 <Text style={[styles.pinTitle, { color: colors.text }]}>{getTitle()}</Text>
                 <View style={styles.dotsContainer}>
                     {[0,1,2,3].map(i => (
                         <View key={i} style={[
                             styles.pinDot, 
                             { borderColor: colors.text, backgroundColor: i < currentVal.length ? colors.text : 'transparent' }
                         ]} />
                     ))}
                 </View>
                 {error ? <Text style={styles.errorText}>{error}</Text> : null}

                 <View style={styles.keypad}>
                     {[1,2,3,4,5,6,7,8,9].map(n => (
                         <TouchableOpacity key={n} style={[styles.key, { backgroundColor: colors.surfaceHighlight }]} onPress={() => handleNumberPress(n.toString())}>
                             <Text style={[styles.keyText, { color: colors.text }]}>{n}</Text>
                         </TouchableOpacity>
                     ))}
                     <View style={styles.key} />
                     <TouchableOpacity style={[styles.key, { backgroundColor: colors.surfaceHighlight }]} onPress={() => handleNumberPress('0')}>
                         <Text style={[styles.keyText, { color: colors.text }]}>0</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.key} onPress={handleDelete}>
                         <Ionicons name="backspace-outline" size={28} color={colors.text} />
                     </TouchableOpacity>
                 </View>
             </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
  pinOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closePin: {
      position: 'absolute',
      top: 60,
      right: 30,
      padding: 10,
      zIndex: 10,
  },
  pinTitle: {
      fontSize: 22,
      ...FONTS.bold,
      marginBottom: 40,
  },
  dotsContainer: {
      flexDirection: 'row',
      gap: 24,
      marginBottom: 60,
  },
  pinDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
  },
  errorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginBottom: 20,
      position: 'absolute',
      top: '35%',
  },
  keypad: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 280,
      justifyContent: 'space-between',
      gap: 20,
  },
  key: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
  },
  keyText: {
      fontSize: 28,
      ...FONTS.medium,
  },
});
