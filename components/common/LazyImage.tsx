// components/common/LazyImage.tsx
import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageSource } from '../../services/file';

interface LazyImageProps {
  uri: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const LazyImage: React.FC<LazyImageProps> = ({
  uri,
  style,
  resizeMode = 'cover'
}) => {
  const [imageSource, setImageSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const source = await getImageSource('/files/' + uri);

        if (isMounted) {
          setImageSource(source);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
    };
  }, [uri]);

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  if (hasError || !imageSource) {
    return (
      <View style={[styles.container, style]}>
        <Ionicons name="image-outline" size={24} color="#9ca3af" />
      </View>
    );
  }

  return (
    <Image
      source={imageSource}
      style={style || styles.image}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: '#f3f4f6',
  }
});

export default LazyImage;