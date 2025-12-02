import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface WidgetData {
  targetDate: string;
  lifeProgress: number;
  remainingDays: number;
  labelText?: string;
  daysText?: string;
}

export function TargetWidget({ targetDate, lifeProgress, remainingDays, labelText, daysText }: WidgetData) {
  console.log('Rendering TargetWidget', { targetDate, lifeProgress, remainingDays, labelText, daysText });
  
  // Ensure valid progress value between 0 and 1
  const progress = Math.min(Math.max(lifeProgress || 0, 0), 1);
  const remaining = remainingDays || 0;
  const label = (labelText || 'LIFE PROGRESS').toUpperCase();
  const daysLabel = (daysText || 'DAYS LEFT').toUpperCase();

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#d4d5c3',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#45413e',
      }}
    >
      {/* Main Content Container */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 'match_parent',
          width: 'match_parent',
        }}
      >
        {/* Header Section */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <FlexWidget style={{ flexDirection: 'column' }}>
             <TextWidget
              text={label}
              style={{
                fontSize: 12,
                color: '#6d6a68',
                fontWeight: 'bold',
                letterSpacing: 1,
                marginBottom: 4,
              }}
            />
            <FlexWidget
              style={{
                height: 4,
                width: 24,
                backgroundColor: '#45413e',
                borderRadius: 2,
              }}
            />
          </FlexWidget>

          <TextWidget
            text={`${(progress * 100).toFixed(0)}%`}
            style={{
              fontSize: 42,
              color: '#45413e',
              fontWeight: 'bold',
              fontFamily: 'sans-serif-condensed',
              marginTop: -8,
            }}
          />
        </FlexWidget>

        {/* Progress Bar */}
        <FlexWidget
          style={{
            height: 16,
            width: 'match_parent',
            backgroundColor: '#b8b9a9', // Slightly darker than bg for depth
            borderRadius: 8,
            flexDirection: 'row',
            borderWidth: 1.5,
            borderColor: '#45413e',
            marginVertical: 12,
            padding: 2, // Inner padding for the bar
          }}
        >
          <FlexWidget
            style={{
              height: 'match_parent',
              width: 0,
              flex: progress > 0.01 ? progress : 0.01,
              backgroundColor: '#45413e',
              borderRadius: 5,
            }}
          />
          <FlexWidget
             style={{
               height: 'match_parent',
               width: 0,
               flex: (1 - progress) > 0 ? (1 - progress) : 0,
             }}
           />
        </FlexWidget>

        {/* Footer Section */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <TextWidget
            text={`${remaining}`}
            style={{
              fontSize: 36,
              color: '#45413e',
              fontWeight: 'bold',
              fontFamily: 'sans-serif-condensed',
              marginBottom: -4,
            }}
          />
          <TextWidget
            text={daysLabel}
            style={{
              fontSize: 12,
              color: '#6d6a68',
              fontWeight: 'bold',
              letterSpacing: 1,
              marginBottom: 6,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
