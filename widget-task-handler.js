import React from 'react';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler, FlexWidget, TextWidget } from 'react-native-android-widget';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { TargetWidget } from './src/widget/TargetWidget';

const APP_GROUP_IDENTIFIER = 'group.com.hearttrace.app';

if (Platform.OS === 'android') {
  const widgetTaskHandler = async (props) => {
    const widgetInfo = props.widgetInfo;
    let widgetData = {};
    
    try {
      // Try to get data from props first (if passed directly)
      if (widgetInfo?.data) {
          try {
             widgetData = JSON.parse(widgetInfo.data);
          } catch (e) {
             console.log('Error parsing widgetInfo.data:', e);
          }
      }
      
      // If no data in props, try shared prefs
      if (!widgetInfo?.data) {
          try {
            console.log('Attempting to read SharedPrefs...');
            const data = await SharedGroupPreferences.getItem('widgetData', APP_GROUP_IDENTIFIER);
            console.log('Read from SharedPrefs:', data);
            if (data) {
              const parsed = JSON.parse(data);
              widgetData = { ...widgetData, ...parsed };
            }
          } catch (e) {
            // Ignore error code 0 (file not found) to reduce noise
            if (e.code !== 0 && e != 0) {
               console.log('Error reading widget data from SharedPrefs:', e);
            } else {
               console.log('SharedPrefs file not found (first run?), using defaults.');
            }
          }
      }

      console.log('Rendering Widget with data:', widgetData);

      return <TargetWidget 
          targetDate={widgetData.targetDate || '2025-01-01'} 
          lifeProgress={typeof widgetData.lifeProgress === 'number' ? widgetData.lifeProgress : 0} 
          remainingDays={typeof widgetData.remainingDays === 'number' ? widgetData.remainingDays : 0} 
      />;
    } catch (error) {
      console.error('Widget Task Handler Crash:', error);
      // Fallback Error Widget
      return (
        <FlexWidget style={{ height: 'match_parent', width: 'match_parent', backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
           <TextWidget text="Widget Error" style={{ fontSize: 16, color: '#ff0000' }} />
           <TextWidget text={error.message || 'Unknown'} style={{ fontSize: 12, color: '#000000' }} />
        </FlexWidget>
      );
    }
  };

  registerWidgetTaskHandler(widgetTaskHandler);
}
