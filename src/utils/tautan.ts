/**
 * Pembacaan tautan: host dan pengenalan domain SIMWT. Dipakai notifikasi (konfirmasi tautan eksternal)
 * dan pemindai QR (QR Pass gerbang).
 */
import { API_CONFIG } from '../../constants/Api';

export const hostTautan = (url: string) => url.match(/^https?:\/\/([^/:?#]+)/i)?.[1].toLowerCase() ?? '';

const HOST_API = hostTautan(API_CONFIG.BASE_URL);

/** Domain milik SIMWT: mwtpart.co.id (beserta subdomain) dan host API yang sedang dipakai. */
export const hostInternal = (host: string) =>
  host === 'mwtpart.co.id' || host.endsWith('.mwtpart.co.id') || (!!HOST_API && host === HOST_API);

/** Token pass dari tautan QR Pass Form Keluar Pabrik (`…/form-keluar-pabrik/gerbang/{token}`); null bila bukan. */
export const tokenQrGerbang = (data: string) =>
  data.trim().match(/^https?:\/\/[^/]+\/layanan\/hrd\/form-keluar-pabrik\/gerbang\/([A-Za-z0-9]+)\/?$/i)?.[1] ?? null;
