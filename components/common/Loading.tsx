// components/common/Loading.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingProps {
	size?: 'small' | 'large';
	color?: string;
	text?: string;
	fullscreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
	size = 'large',
	color = '#2563eb',
	text = 'Loading...',
	fullscreen = false,
}) => {
	return (
		<View style={[styles.container, fullscreen && styles.fullscreen]}>
			<ActivityIndicator size={size} color={color} />
			{text && <Text style={styles.text}>{text}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fullscreen: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		zIndex: 999,
	},
	text: {
		marginTop: 12,
		color: '#6b7280',
	},
});

export default Loading;