import React, {useEffect} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
        contentContainerStyle={[
          styles.content,
          notifications.length === 0 && styles.contentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIllustration}>
              <View style={styles.emptyPlate}>
                <MaterialIcons name="circle" size={74} color={PALETTE.surface} />
                <MaterialIcons
                  name="notifications-none"
                  size={28}
                  color={PALETTE.primary}
                  style={styles.centerIcon}
                />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubText}>New updates and alerts will appear here.</Text>
          </View>
        }
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
  contentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyIllustration: {
    width: 86,
    height: 86,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPlate: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: PALETTE.background,
    borderWidth: 2,
    borderColor: PALETTE.divider,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerIcon: {
    position: 'absolute',
  },
  emptyTitle: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  emptySubText: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
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
