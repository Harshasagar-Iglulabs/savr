import React, {useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Card, Text} from 'react-native-paper';
import {FormInput} from '../components/common/FormInput';
import {PrimaryButton} from '../components/common/PrimaryButton';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {setProfile} from '../store/slices/userSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.user.profile);

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);

  const onContinue = () => {
    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    dispatch(setProfile({firstName, lastName}));
    navigation.reset({index: 0, routes: [{name: 'Restaurants'}]});
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={{uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format&fit=crop'}}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.formWrap}>
          <Card mode="contained" style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="headlineSmall" style={styles.title}>
                Complete Your Profile
              </Text>
              <FormInput label="First Name" value={firstName} onChangeText={setFirstName} />
              <FormInput label="Last Name" value={lastName} onChangeText={setLastName} />
              <PrimaryButton
                label="Continue"
                onPress={onContinue}
                disabled={!firstName.trim() || !lastName.trim()}
              />
            </Card.Content>
          </Card>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  hero: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  formWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    marginHorizontal: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    gap: 10,
  },
  title: {
    color: '#027146',
    fontFamily: 'Nunito-Bold',
  },
});
