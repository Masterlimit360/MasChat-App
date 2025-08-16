// config.ts
// This config now uses the same BASE_URL as your login screen
import { BASE_URL } from './app/api/client';

export const apiUrl = BASE_URL;

export default {
  API_URL: apiUrl,
  ENV: 'production',
  IS_DEV: false,
};
