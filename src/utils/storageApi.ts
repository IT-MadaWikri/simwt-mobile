/** URL berkas storage api-simwt (drawing, gambar part): URL dasar API tanpa `/api`, lalu `/storage/<path>`. */
import { API_CONFIG } from '../../constants/Api';

/** URL berkas storage web SIMWT (foto Kaizen lama, foto profil): URL penuh dipakai apa adanya, path relatif diberi host web. */
export const buatUrlStorageWeb = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${API_CONFIG.STORAGE_WEB_URL}/storage/${path.replace(/^\/+/, '')}`;

export const buatUrlStorageApi = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${API_CONFIG.BASE_URL.replace(/\/api\/?$/, '')}/storage/${path.replace(/^\/+/, '')}`;
