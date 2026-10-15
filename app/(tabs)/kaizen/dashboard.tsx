// Dashboard Kaizen dihapus dari mobile; rute lama diarahkan ke Kaizen Saya.
import { Redirect } from 'expo-router';

export default function KaizenDashboardLama() {
  return <Redirect href="/kaizen" />;
}
