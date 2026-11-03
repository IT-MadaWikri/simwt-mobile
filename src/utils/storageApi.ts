/** URL berkas storage api-simwt (drawing, gambar part): URL dasar API tanpa `/api`, lalu `/storage/<path>`. */
import { API_CONFIG } from '../../constants/Api';

export const buatUrlStorageApi = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${API_CONFIG.BASE_URL.replace(/\/api\/?$/, '')}/storage/${path.replace(/^\/+/, '')}`;
