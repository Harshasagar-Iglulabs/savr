import React from 'react';
import {StyleSheet} from 'react-native';
import {TextInput, type TextInputProps} from 'react-native-paper';
import {PALETTE} from '../../constants/palette';

type Props = TextInputProps & {
  label: string;
};

export function FormInput({label, style, contentStyle, ...rest}: Props) {
  return (
    <TextInput
      mode="outlined"
      label={label}
      style={[styles.input, style]}
      contentStyle={[styles.content, contentStyle]}
      outlineColor={PALETTE.input.border}
      activeOutlineColor={PALETTE.input.focusBorder}
      placeholderTextColor={PALETTE.input.placeholder}
      textColor={PALETTE.input.text}
      theme={{
        fonts: {
          bodyLarge: {fontFamily: 'Nunito-Regular'},
          bodySmall: {fontFamily: 'Nunito-Regular'},
          labelLarge: {fontFamily: 'Nunito-Regular'},
        },
      }}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: PALETTE.input.background,
    marginBottom: 20,
  },
  content: {
    fontFamily: 'Nunito-Regular',
    paddingVertical: 10,
    textAlignVertical: 'center',
  },
});
