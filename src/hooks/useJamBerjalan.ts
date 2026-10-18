/** Jam berjalan: detik yang sudah lewat sejak `sejakIso`, diperbarui tiap detik. Null bila tidak berjalan. */
import { useEffect, useState } from 'react';

const detikSejak = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));

export function useJamBerjalan(sejakIso: string | null): number | null {
  const [detik, setDetik] = useState<number | null>(sejakIso ? detikSejak(sejakIso) : null);

  useEffect(() => {
    if (!sejakIso) {
      setDetik(null);
      return;
    }
    setDetik(detikSejak(sejakIso));
    const t = setInterval(() => setDetik(detikSejak(sejakIso)), 1000);
    return () => clearInterval(t);
  }, [sejakIso]);

  return detik;
}

/** 83 → "00:01:23" (jam bisa lebih dari 24). */
export function formatJam(detik: number): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(detik / 3600))}:${p(Math.floor((detik % 3600) / 60))}:${p(detik % 60)}`;
}
