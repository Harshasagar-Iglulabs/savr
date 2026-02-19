import React, {useEffect} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {PALETTE} from '../constants/palette';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  clearNotifications,
  markAllNotificationsRead,
} from '../store/slices/notificationSlice';

function formatTime(epoch: number): string {
  return new Date(epoch).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.notifications.items);

  useEffect(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  return (
    <ScreenContainer>
      <View style={styles.actions}>
        <Button
          mode="outlined"
          textColor={PALETTE.primary}
          style={styles.clearButton}
          onPress={() => dispatch(clearNotifications())}
          disabled={notifications.length === 0}>
          Clear All
        </Button>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Card mode="outlined" style={styles.emptyCard}>
            <Card.Content>
              <Text variant="titleMedium">No notifications yet</Text>
              <Text variant="bodySmall">New FCM messages will appear here.</Text>
            </Card.Content>
          </Card>
        }
        contentContainerStyle={styles.content}
        renderItem={({item}) => (
          <Card mode="contained" style={styles.itemCard}>
            <Card.Content style={styles.itemContent}>
              <Text variant="titleSmall" style={styles.itemTitle}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.itemBody}>
                {item.body}
              </Text>
              <Text variant="labelSmall" style={styles.itemTime}>
                {formatTime(item.receivedAtEpoch)}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'flex-end',
  },
  clearButton: {
    borderColor: PALETTE.primary,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 20,
    gap: 10,
  },
  emptyCard: {
    marginTop: 10,
  },
  itemCard: {
    borderRadius: 14,
    backgroundColor: PALETTE.surface,
  },
  itemContent: {
    gap: 6,
  },
  itemTitle: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  itemBody: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  itemTime: {
    color: PALETTE.textMuted,
    fontFamily: 'Nunito-Regular',
  },
});
