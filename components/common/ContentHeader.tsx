import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View, ViewProps, ViewStyle } from "react-native";
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';


interface ContentHeaderProps extends ViewProps {
  title: string;
  back?: boolean;
  onBackPress?: () => void;
  style?: ViewStyle;
}

export default function ContentHeader({ title = "", back = true, onBackPress, style, ...props }: ContentHeaderProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const styles = createStyles(theme);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }

  return <View style={[styles.container, style]}>
    {
      back &&
      <TouchableOpacity onPress={handleBackPress}>
        <Ionicons size={24} name="arrow-back" color={theme.colors.blue500} />
      </TouchableOpacity>
    }
    <Text style={styles.title}>{title}</Text>
  </View>
}


const createStyles = (theme: any) => StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.gray800,
  },
});