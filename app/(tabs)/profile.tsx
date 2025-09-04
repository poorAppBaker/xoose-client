// app/(tabs)/profile.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen() {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Profile</Text>
			</View>
		</SafeAreaView>
	);
}

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	header: {
		paddingHorizontal: theme.spacing.lg,
		paddingTop: theme.spacing.xl,
		paddingBottom: theme.spacing.md,
		backgroundColor: theme.colors.background,
	},
	headerTitle: {
		...theme.typography.h2,
		color: theme.colors.text,
	},
	scrollContainer: {
		flex: 1,
	},
	profileCard: {
		alignItems: 'center',
	},
	avatarWrap: {
		backgroundColor: theme.colors.backgroundCard,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 50,
		height: 80,
	},
	avatarContainer: {
		position: 'relative',
		top: 30,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: theme.colors.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 3,
		borderColor: 'white',
		...theme.shadows.md,
	},
	avatarText: {
		fontSize: 28,
		fontWeight: 'bold',
		color: 'white',
	},
	statusBadge: {
		position: 'absolute',
		bottom: 2,
		right: 2,
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: theme.colors.success,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: 'white',
	},
	userName: {
		...theme.typography.h2,
		color: theme.colors.text,
		marginBottom: 4,
		textAlign: 'center',
	},
	userEmail: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		textAlign: 'center',
	},
	detailContainer: {
		padding: theme.spacing.lg,
	},
	detailsCard: {
		backgroundColor: theme.colors.backgroundCard,
		borderRadius: theme.borderRadius.xl,
		padding: theme.spacing.lg,
		marginBottom: theme.spacing.lg,
		borderWidth: 1,
		borderColor: theme.colors.border,
		...theme.shadows.sm,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: theme.spacing.lg,
	},
	cardTitle: {
		...theme.typography.h3,
		color: theme.colors.secondary,
	},
	editButton: {
		backgroundColor: theme.colors.primary,
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		borderRadius: theme.borderRadius.xl,
		...theme.shadows.sm,
	},
	editButtonText: {
		color: 'white',
		fontWeight: '600',
		fontSize: 14,
	},
	formContainer: {
		gap: theme.spacing.sm,
	},
	fieldContainer: {
		gap: theme.spacing.sm,
	},
	fieldLabel: {
		...theme.typography.bodySmall,
		color: theme.colors.text,
		fontWeight: '600',
	},
	inputWrapper: {
		// Input component handles its own styling
	},
	valueContainer: {
		backgroundColor: theme.colors.inputReadOnly,
		borderRadius: theme.borderRadius.lg,
		padding: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	valueText: {
		...theme.typography.body,
		color: theme.colors.text,
	},
	saveButtonContainer: {
		marginTop: theme.spacing.md,
	},
	saveButton: {
		backgroundColor: theme.colors.primary,
	},
	logoutContainer: {
		marginBottom: theme.spacing.xl,
	},
	logoutButton: {
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: theme.colors.error,
		borderRadius: theme.borderRadius.lg,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoutText: {
		...theme.typography.button,
		color: theme.colors.error,
		fontWeight: '600',
	},
});