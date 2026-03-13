import React from 'react';
import {StyleSheet} from 'react-native';
import {Snackbar} from 'react-native-paper';
import {PALETTE} from '../../constants/palette';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {hideGlobalSnackbar} from '../../store/slices/uiSlice';

export function GlobalSnackbar() {
  const dispatch = useAppDispatch();
  const {visible, message, type} = useAppSelector(state => state.ui.snackbar);

  const backgroundColor =
    type === 'error'
      ? PALETTE.status.error
      : type === 'success'
      ? PALETTE.status.success
      : PALETTE.status.info;

  return (
    <Snackbar
      visible={visible && Boolean(message)}
      onDismiss={() => dispatch(hideGlobalSnackbar())}
      duration={2600}
      style={[styles.snackbar, {backgroundColor}]}
      wrapperStyle={styles.wrapper}>
      {message}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
  },
  snackbar: {
    marginHorizontal: 12,
    borderRadius: 12,
  },
});
