// components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
	rounded?: boolean;
	size?: 'small' | 'medium' | 'large';
	fullWidth?: boolean;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
	title,
	onPress,
	disabled = false,
	loading = false,
	variant = 'primary',
	rounded = true,
	size = 'medium',
	fullWidth = false,
	style,
	textStyle,
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	const getButtonStyle = () => {
		const baseStyle = [styles.button, styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]];

		switch (variant) {
			case 'primary':
				baseStyle.push(styles.buttonPrimary);
				break;
			case 'secondary':
				baseStyle.push(styles.buttonSecondary);
				break;
			case 'outline':
				baseStyle.push(styles.buttonOutline);
				break;
			case 'ghost':
				baseStyle.push(styles.buttonGhost);
				break;
		}

		if (rounded) {
			baseStyle.push(styles.buttonRounded);
		}

		if (fullWidth) {
			baseStyle.push(styles.buttonFullWidth);
		}

		if (disabled || loading) {
			baseStyle.push(styles.buttonDisabled);
		}

		return baseStyle;
	};
	const getTextStyle = () => {
		const baseStyle = [styles.buttonText, styles[`buttonText${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]];

		switch (variant) {
			case 'primary':
				baseStyle.push(styles.buttonTextPrimary);
				break;
			case 'secondary':
				baseStyle.push(styles.buttonTextSecondary);
				break;
			case 'outline':
				baseStyle.push(styles.buttonTextOutline);
				break;
			case 'ghost':
				baseStyle.push(styles.buttonTextGhost);
				break;
		}

		if (disabled || loading) {
			baseStyle.push(styles.buttonTextDisabled);
		}

		return baseStyle;
	};

	return (
		<TouchableOpacity
			style={[...getButtonStyle(), style]}
			onPress={onPress}
			disabled={disabled || loading}
			activeOpacity={0.8}
		>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={variant === 'primary' ? '#ffffff' : theme.colors.gray100}
				/>
			) : (
				<Text style={[...getTextStyle(), textStyle]}>
					{title}
				</Text>
			)}
		</TouchableOpacity>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: theme.borderRadius.lg,
		flexDirection: 'row',
	},

	// Size variants
	buttonSmall: {
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		minHeight: 40,
	},
	buttonMedium: {
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		minHeight: 48,
	},
	buttonLarge: {
		paddingVertical: theme.spacing.md + 2,
		paddingHorizontal: theme.spacing.lg,
		minHeight: 56,
	},

	// Color variants
	buttonPrimary: {
		backgroundColor: theme.colors.primary, // Orange color from design
		...theme.shadows.md,
	},
	buttonSecondary: {
		backgroundColor: theme.colors.secondary,
		...theme.shadows.md,
	},
	buttonOutline: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: theme.colors.primary,
	},
	buttonGhost: {
		backgroundColor: '#EDE8FF',
	},
	buttonDisabled: {
		backgroundColor: theme.colors.textLight,
		opacity: 0.6,
	},
	buttonRounded: {
		borderRadius: 9999,
	},
	buttonFullWidth: {
		width: '100%',
	},

	// Text styles
	buttonText: {
		...theme.typography.button,
		textAlign: 'center',
		fontWeight: '700',
	},
	buttonTextSmall: {
		fontSize: 14,
		fontWeight: '700',
	},
	buttonTextMedium: {
		fontSize: 16,
		fontWeight: '700',
	},
	buttonTextLarge: {
		fontSize: 18,
		fontWeight: '700',
	},

	// Text color variants
	buttonTextPrimary: {
		color: '#ffffff',
	},
	buttonTextSecondary: {
		color: '#ffffff',
	},
	buttonTextOutline: {
		color: theme.colors.primary,
	},
	buttonTextGhost: {
		color: theme.colors.primary,
	},
	buttonTextDisabled: {
		color: '#ffffff',
	},
});

export default Button;