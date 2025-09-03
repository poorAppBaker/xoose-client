import * as Clipboard from 'expo-clipboard';

/**
 * Copies a URL to the clipboard
 * @param url The URL to copy
 * @returns Promise that resolves when the URL is copied
 */
export const copyUrlToClipboard = async (url: string): Promise<void> => {
  try {
    await Clipboard.setStringAsync(url);
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    throw new Error('Failed to copy URL to clipboard');
  }
};

/**
 * Gets the current content from clipboard
 * @returns Promise that resolves with the clipboard content
 */
export const getClipboardContent = async (): Promise<string> => {
  try {
    return await Clipboard.getStringAsync();
  } catch (error) {
    console.error('Failed to get clipboard content:', error);
    throw new Error('Failed to get clipboard content');
  }
}; 