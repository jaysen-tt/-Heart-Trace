import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { startOfYear, endOfYear, differenceInMilliseconds, parseISO, isValid } from 'date-fns';
import { useSettings } from '../context/SettingsContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

const ProgressBar = ({ percent, color }: { percent: number, color: string }) => {
    const clamped = Math.min(Math.max(percent, 0), 100);
    return (
        <View style={[styles.track, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
        </View>
    );
};

const ProgressCard = ({ label, percent, color, subLabel, colors }: any) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
            <Text style={[styles.percent, { color: colors.text }]}>{percent.toFixed(1)}%</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        </View>
        <ProgressBar percent={percent} color={color} />
        {subLabel && <Text style={[styles.subLabel, { color: colors.textTertiary }]}>{subLabel}</Text>}
    </View>
);

export default function ProgressSection() {
    const { birthDate, targetDate, colors, t } = useSettings();
    const today = new Date();

    // Year Progress
    const startYear = startOfYear(today);
    const endYear = endOfYear(today);
    const yearTotal = differenceInMilliseconds(endYear, startYear);
    const yearElapsed = differenceInMilliseconds(today, startYear);
    const yearPercent = (yearElapsed / yearTotal) * 100;
    const daysLeftInYear = Math.ceil((differenceInMilliseconds(endYear, today)) / (1000 * 60 * 60 * 24));

    // Life/Target Progress
    let targetPercent = 0;
    let targetValid = false;

    if (birthDate && targetDate) {
        const start = parseISO(birthDate);
        const end = parseISO(targetDate);
        if (isValid(start) && isValid(end)) {
            const total = differenceInMilliseconds(end, start);
            const elapsed = differenceInMilliseconds(today, start);
            targetPercent = (elapsed / total) * 100;
            targetValid = true;
        }
    }

    return (
        <View style={styles.container}>
            {/* Target Progress */}
            <View style={styles.column}>
                <ProgressCard 
                    label={t('pref_target_date')}
                    percent={targetValid ? targetPercent : 0}
                    color={colors.todayIndicator} // Use main theme color
                    subLabel={targetValid ? `${Math.floor(targetPercent)}% completed` : 'Set dates in settings'}
                    colors={colors}
                />
            </View>

            {/* Spacer */}
            <View style={{ width: SPACING.sm }} />

            {/* Year Progress */}
            <View style={styles.column}>
                <ProgressCard 
                    label={t('pref_year_progress')}
                    percent={yearPercent}
                    color={colors.success} // Different color for variety
                    subLabel={`${daysLeftInYear} ${t('stats_days')} left`}
                    colors={colors}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    column: {
        flex: 1,
    },
    card: {
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        minHeight: 100,
        justifyContent: 'space-between',
    },
    cardHeader: {
        marginBottom: SPACING.sm,
    },
    percent: {
        fontSize: 24,
        ...FONTS.bold,
    },
    label: {
        fontSize: 12,
        ...FONTS.medium,
        textTransform: 'uppercase',
    },
    track: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: SPACING.xs,
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
    subLabel: {
        fontSize: 10,
    }
});

