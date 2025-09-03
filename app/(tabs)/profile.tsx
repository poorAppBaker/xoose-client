// app/(tabs)/profile.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfileScreen() {
	const { theme } = useTheme();
	const { t } = useTranslation();
	const user = useAuthStore(state => state.user);
	const updateProfile = useAuthStore(state => state.updateProfile);
	const logout = useAuthStore(state => state.logout);

	const [isEditing, setIsEditing] = useState(false);
	const [firstName, setFirstName] = useState(user?.firstName || '');
	const [lastName, setLastName] = useState(user?.lastName || '');
	const [email, setEmail] = useState(user?.email || '');

	const handleSaveProfile = () => {
		updateProfile(firstName, lastName, email);
		Alert.alert(t('tab_profile.success'), t('tab_profile.profile_updated_successfully'));
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setFirstName(user?.firstName || '');
		setLastName(user?.lastName || '');
		setEmail(user?.email || '');
		setIsEditing(false);
	};

	const handleLogout = async () => {
		Alert.alert(
			t('tab_profile.logout_confirm_title'),
			t('tab_profile.logout_confirm_message'),
			[
				{
					text: t('tab_profile.cancel'),
					style: 'cancel',
				},
				{
					text: t('tab_profile.logout'),
					style: 'destructive',
					onPress: async () => {
						try {
							await logout();
						} catch (error) {
							console.error('Logout failed:', error);
							Alert.alert(t('tab_profile.error'), t('tab_profile.logout_failed'));
						}
					},
				},
			]
		);
	};

	const getInitials = () => {
		if (!user?.firstName) return 'U';
		return user.firstName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
	};

	const styles = createStyles(theme);

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('tab_profile.profile')}</Text>
			</View>

			<ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
				{/* Profile Header Card */}
				<View style={styles.profileCard}>
					<View style={styles.avatarWrap}>
						<View style={styles.avatarContainer}>
							<View style={styles.avatar}>
								<Text style={styles.avatarText}>{getInitials()}</Text>
							</View>
							<View style={styles.statusBadge}>
								<Ionicons name="checkmark" size={12} color="white" />
							</View>
						</View>
					</View>

					<Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
					<Text style={styles.userEmail}>{user?.email}</Text>
				</View>

				<View style={styles.detailContainer}>
					{/* Personal Details Card */}
					<View style={styles.detailsCard}>
						<View style={styles.cardHeader}>
							<Text style={styles.cardTitle}>{t('tab_profile.personal_details')}</Text>
							<TouchableOpacity
								style={styles.editButton}
								onPress={() => setIsEditing(!isEditing)}
							>
								<Text style={styles.editButtonText}>
									{isEditing ? t('tab_profile.cancel_edit') : t('tab_profile.edit')}
								</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.formContainer}>
							{/* First Name Field */}
							<View style={styles.fieldContainer}>
								<Text style={styles.fieldLabel}>{t('tab_profile.firstName')}</Text>
								{isEditing ? (
									<View style={styles.inputWrapper}>
										<Input
											value={firstName}
											onChangeText={setFirstName}
											placeholder={t('tab_profile.enter_first_name_placeholder')}
										/>
									</View>
								) : (
									<View style={styles.valueContainer}>
										<Text style={styles.valueText}>{user?.firstName}</Text>
									</View>
								)}
							</View>

							{/* Last Name Field */}
							<View style={styles.fieldContainer}>
								<Text style={styles.fieldLabel}>{t('tab_profile.lastName')}</Text>
								{isEditing ? (
									<View style={styles.inputWrapper}>
										<Input
											value={lastName}
											onChangeText={setLastName}
											placeholder={t('tab_profile.enter_last_name_placeholder')}
										/>
									</View>
								) : (
									<View style={styles.valueContainer}>
										<Text style={styles.valueText}>{user?.lastName}</Text>
									</View>
								)}
							</View>

							{/* Email Field */}
							<View style={styles.fieldContainer}>
								<Text style={styles.fieldLabel}>{t('tab_profile.email')}</Text>
								{isEditing ? (
									<View style={styles.inputWrapper}>
										<Input
											value={email}
											onChangeText={setEmail}
											placeholder={t('tab_profile.enter_email_placeholder')}
											keyboardType="email-address"
											autoCapitalize="none"
										/>
									</View>
								) : (
									<View style={styles.valueContainer}>
										<Text style={styles.valueText}>{user?.email}</Text>
									</View>
								)}
							</View>

							{/* Role Field */}
							<View style={styles.fieldContainer}>
								<Text style={styles.fieldLabel}>{t('tab_profile.role')}</Text>
								<View style={styles.valueContainer}>
									<Text style={styles.valueText}>
										{user?.role === 'manager' ? t('tab_profile.manager') : t('tab_profile.team_member')}
									</Text>
								</View>
							</View>

							{/* Save Button */}
							{isEditing && (
								<View style={styles.saveButtonContainer}>
									<Button
										title={t('tab_profile.save_changes')}
										onPress={handleSaveProfile}
										variant="primary"
										style={styles.saveButton}
									/>
								</View>
							)}
						</View>
					</View>

					{/* Logout Button */}
					<View style={styles.logoutContainer}>
						<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
							<Text style={styles.logoutText}>{t('tab_profile.logout')}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
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