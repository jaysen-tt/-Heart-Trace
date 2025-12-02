import { Platform, ToastAndroid } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { TargetWidget } from '../widget/TargetWidget';

const APP_GROUP_IDENTIFIER = 'group.com.hearttrace.app';

export const syncWidgetData = async (
  targetDate: string, 
  birthday: string,
  labels: { lifeProgress: string; daysLeft: string } = { lifeProgress: 'LIFE PROGRESS', daysLeft: 'DAYS LEFT' }
) => {
  if (Platform.OS !== 'android') return;

  try {
    console.log(`[${new Date().toISOString()}] Starting widget sync...`);
    // ToastAndroid.show('正在同步 Widget 数据...', ToastAndroid.SHORT);

    const now = new Date();
    const target = new Date(targetDate);
    const birth = new Date(birthday);
    
    // Calculate remaining days
    const diffTime = target.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate life progress
    // Assume life expectancy is roughly target date - birth date for this context
    // Or simplified: (Now - Birth) / (Target - Birth)
    const totalLifeSpan = target.getTime() - birth.getTime();
    const livedLifeSpan = now.getTime() - birth.getTime();
    let lifeProgress = 0;
    
    if (totalLifeSpan > 0) {
      lifeProgress = livedLifeSpan / totalLifeSpan;
    }
    
    // Clamp between 0 and 1
    lifeProgress = Math.min(Math.max(lifeProgress, 0), 1);

    const widgetData = {
      targetDate,
      lifeProgress,
      remainingDays,
      labelText: labels.lifeProgress,
      daysText: labels.daysLeft
    };

    console.log(`[${new Date().toISOString()}] Syncing widget data:`, widgetData);

    // 1. Request immediate update (Prioritize UI feedback)
    try {
      requestWidgetUpdate({
        widgetName: 'TargetWidget',
        renderWidget: () => <TargetWidget {...widgetData} />,
      });
      console.log('Widget update requested successfully');
    } catch (updateError) {
      console.error('Error requesting widget update:', updateError);
    }

    // 2. Save to Shared Preferences for background updates
    try {
      await SharedGroupPreferences.setItem('widgetData', JSON.stringify(widgetData), APP_GROUP_IDENTIFIER);
      console.log('Widget data saved to SharedPrefs');
    } catch (prefsError) {
      console.error('Error saving to SharedPrefs:', prefsError);
    }

  } catch (error) {
    console.error('Error calculating widget data:', error);
  }
};
