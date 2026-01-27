import { useEffect, useRef } from 'react';

export function useMercadoPago(publicKey: string) {
  const mpRef = useRef<any>(null);

  useEffect(() => {
    if (window.MercadoPago && !mpRef.current) {
      mpRef.current = new window.MercadoPago(publicKey, {
        locale: 'pt-BR',
      });
    }
  }, [publicKey]);

  return mpRef.current;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}
