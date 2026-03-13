import React, {useCallback, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ActivityIndicator, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ConfirmationDialog} from '../../components/common/ConfirmationDialog';
import {FormInput} from '../../components/common/FormInput';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {
  deleteRestaurantByAdmin,
  fetchRestaurantsByAdmin,
  type AdminRestaurant,
  type AdminRestaurantsPagination,
} from '../../services/admin';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {resetToUserLogin} from '../../store/slices/authSlice';
import {clearNotifications} from '../../store/slices/notificationSlice';
import {clearRestaurantState} from '../../store/slices/restaurantSlice';
import {clearUserState} from '../../store/slices/userSlice';
import {clearAllPersistedUserSessionData} from '../../utils/localStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminRestaurants'>;

const DEFAULT_PAGINATION: AdminRestaurantsPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

export function AdminRestaurantsScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.auth.session?.role ?? '');
  const token = useAppSelector(state => state.auth.session?.token ?? '');
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [deleteTarget, setDeleteTarget] = useState<AdminRestaurant | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRestaurants = useCallback(
    async (page: number, search: string) => {
      if (!token.trim()) {
        setError('Missing authenticated token.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetchRestaurantsByAdmin(token, {
          page,
          limit: DEFAULT_PAGINATION.limit,
          search,
        });
        setRestaurants(response.items);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to fetch restaurants.');
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      if (role !== 'admin') {
        navigation.goBack();
        return;
      }
      loadRestaurants(1, query).catch(() => {
        // Error state is handled in loadRestaurants.
      });
    }, [loadRestaurants, navigation, query, role]),
  );

  const onDelete = (restaurant: AdminRestaurant) => {
    setDeleteTarget(restaurant);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    if (!token.trim()) {
      setError('Missing authenticated token.');
      return;
    }

    setDeleting(true);
    setError('');
    try {
      await deleteRestaurantByAdmin(deleteTarget.id, token);
      setDeleteTarget(null);
      await loadRestaurants(pagination.page, query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete restaurant.');
    } finally {
      setDeleting(false);
    }
  };

  const onLogout = async () => {
    await clearAllPersistedUserSessionData();
    dispatch(clearNotifications());
    dispatch(clearUserState());
    dispatch(clearRestaurantState());
    dispatch(resetToUserLogin());
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  return (
    <ScreenContainer>
      <View style={styles.row}>
        <Text variant="headlineSmall" style={styles.title}>
          Restaurants
        </Text>
        <View style={styles.actionsRow}>
          <PrimaryButton
            label="Add"
            onPress={() => navigation.navigate('AdminAddRestaurant')}
          />
          <Pressable onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <FormInput
        label="Search"
        value={query}
        placeholder="Store name, phone, cuisine..."
        onChangeText={setQuery}
      />
      <PrimaryButton
        label="Search"
        onPress={() => {
          loadRestaurants(1, query).catch(() => {
            // Error state is handled in loadRestaurants.
          });
        }}
        disabled={loading}
      />

      {loading ? <ActivityIndicator color={PALETTE.primary} style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={restaurants}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={() => {
          loadRestaurants(pagination.page, query).catch(() => {
            // Error state is handled in loadRestaurants.
          });
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No restaurants available.</Text>
          ) : null
        }
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                {item.storeName}
              </Text>
              <View style={styles.headerActions}>
                <Text style={styles.statusText}>{item.status ?? 'active'}</Text>
                <Pressable
                  onPress={() =>
                    navigation.navigate('AdminEditRestaurant', {restaurant: item})
                  }
                  style={styles.editIconButton}
                  hitSlop={8}>
                  <MaterialIcons name="edit" size={16} color={PALETTE.primary} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.cardLine}>Owner: {item.ownerName || '-'}</Text>
            <Text style={styles.cardLine}>{item.phone || 'No phone'}</Text>
            <Text style={styles.cardLine}>{item.email || 'No email'}</Text>
            <Text style={styles.cardLine}>{item.cuisine || 'No cuisine'}</Text>
            <Text style={styles.cardLine}>{item.address || 'No address'}</Text>
            <View style={styles.cardFooter}>
              <View />
              <Pressable onPress={() => onDelete(item)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <View style={styles.paginationRow}>
        <PrimaryButton
          label="Prev"
          onPress={() => {
            const nextPage = Math.max(1, pagination.page - 1);
            loadRestaurants(nextPage, query).catch(() => {
              // Error state is handled in loadRestaurants.
            });
          }}
          disabled={loading || pagination.page <= 1}
        />
        <Text style={styles.pageText}>
          Page {pagination.page} / {Math.max(1, pagination.totalPages)}
        </Text>
        <PrimaryButton
          label="Next"
          onPress={() => {
            const nextPage = Math.min(
              Math.max(1, pagination.totalPages),
              pagination.page + 1,
            );
            loadRestaurants(nextPage, query).catch(() => {
              // Error state is handled in loadRestaurants.
            });
          }}
          disabled={loading || pagination.page >= Math.max(1, pagination.totalPages)}
        />
      </View>

      <ConfirmationDialog
        visible={Boolean(deleteTarget)}
        title="Delete Restaurant"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.storeName}?`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          onConfirmDelete().catch(() => {
            // Error state is handled in onConfirmDelete.
          });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: PALETTE.status.error,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: PALETTE.surface,
  },
  logoutText: {
    color: PALETTE.status.error,
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  loader: {
    marginTop: 12,
  },
  errorText: {
    color: PALETTE.status.error,
    fontFamily: 'Nunito-Regular',
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
  emptyText: {
    marginTop: 18,
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },
  card: {
    backgroundColor: PALETTE.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: PALETTE.input.border,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    flex: 1,
  },
  statusText: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Bold',
    textTransform: 'capitalize',
  },
  cardLine: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  editIconButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.surface,
  },
  cardFooter: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderColor: PALETTE.status.error,
    borderWidth: 1,
  },
  deleteText: {
    color: PALETTE.status.error,
    fontFamily: 'Nunito-Bold',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pageText: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
});
