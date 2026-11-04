/** Versi aplikasi dari `app.json` (`expo.version`) — satu-satunya sumber, jangan ditulis manual di layar. */
import Constants from 'expo-constants';

export const versiAplikasi: string = Constants.expoConfig?.version ?? '-';
