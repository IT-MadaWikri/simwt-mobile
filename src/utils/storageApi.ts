/** URL berkas storage SIMWT (sim-mwt): URL penuh dipakai apa adanya, path relatif diberi host web lalu `/storage/<path>`. */
import { API_CONFIG } from '../../constants/Api';

export const buatUrlStorageWeb = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${API_CONFIG.STORAGE_WEB_URL}/storage/${path.replace(/^\/+/, '')}`;
