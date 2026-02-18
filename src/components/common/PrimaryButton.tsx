import React from 'react';
import {Button} from 'react-native-paper';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({label, onPress, loading, disabled}: Props) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      contentStyle={{paddingVertical: 6}}>
      {label}
    </Button>
  );
}
