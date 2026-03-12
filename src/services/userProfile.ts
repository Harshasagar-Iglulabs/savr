import type {UserProfile} from '../types';
import {API_ENDPOINTS} from './endpoints';
import {apiRequest} from './http';

export async function updateUserName(
  payload: UserProfile,
  token: string,
): Promise<UserProfile> {
  return apiRequest<UserProfile>(
    API_ENDPOINTS.users.updateName,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    token,
  );
}
