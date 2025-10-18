import React from 'react';
import { Text, TextStyle, useWindowDimensions } from 'react-native';

import sharedStyles from '../../views/Styles';
import { useTheme } from '../../theme';
import { useAppSelector } from '../../lib/hooks';
import useShortnameToUnicode from '../../lib/hooks/useShortnameToUnicode';
import CustomEmoji from '../EmojiPicker/CustomEmoji';

type InlineEmojiTextProps = {
  text?: string;
  style?: TextStyle[];
  numberOfLines?: number;
  testID?: string;
};

const EMOJI_SHORTCODE_REGEX = /(:[a-z0-9_+\-]+:)/gi;

const InlineEmojiText = ({ text, style = [], numberOfLines = 1, testID }: InlineEmojiTextProps) => {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const customEmojis = useAppSelector(state => state.customEmojis as Record<string, { name: string; extension: string }>);
  const { formatShortnameToUnicode } = useShortnameToUnicode();

  if (!text) {
    return null;
  }

  const segments = text.split(EMOJI_SHORTCODE_REGEX).filter(segment => segment !== '');

  // Sizes aligned with markdown emoji rendering
  const customEmojiSize = {
    width: 15 * fontScale,
    height: 15 * fontScale
  };

  return (
    <Text
      testID={testID}
      numberOfLines={numberOfLines}
      style={[{ color: colors.fontDefault, fontSize: 16 }, sharedStyles.textRegular, ...style]}
      accessibilityLabel={text}
    >
      {segments.map((segment, index) => {
        const match = /^:([a-z0-9_+\-]+):$/i.exec(segment);
        if (match) {
          const name = match[1];
          const custom = customEmojis?.[name];
          if (custom) {
            return <CustomEmoji key={`emoji-${index}-${name}`} style={customEmojiSize} emoji={custom} />;
          }
          // Not a custom emoji, try convert to unicode
          return (
            <Text key={`emoji-${index}-${name}`}>
              {formatShortnameToUnicode(segment)}
            </Text>
          );
        }
        // Plain text segment (may include unicode already)
        return <Text key={`t-${index}`}>{segment}</Text>;
      })}
    </Text>
  );
};

export default InlineEmojiText;
