// pages/_app.tsx
import '../styles/globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import type { AppProps } from 'next/app';
import Script from 'next/script'; // Importa Script para PayPal
import { useState } from 'react'; // Importa useState

function MyApp({ Component, pageProps }: AppProps) {
  const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);

  return (
    <>
      <Component {...pageProps} paypalSdkLoaded={paypalSdkLoaded} />

      {/* Script del SDK de PayPal */}
      {/* Es crucial que NEXT_PUBLIC_PAYPAL_CLIENT_ID esté configurado correctamente en Vercel */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        strategy="afterInteractive" // Carga el script después de que la página se vuelve interactiva
        onLoad={() => {
          console.log('¡PayPal SDK se ha cargado exitosamente!');
          setPaypalSdkLoaded(true); // Establece el estado a true cuando el SDK carga
        }}
        onError={(e) => console.error('Error al cargar el SDK de PayPal:', e)}
      />
    </>
  );
}

export default MyApp;