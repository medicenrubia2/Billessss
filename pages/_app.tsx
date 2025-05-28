// pages/_app.tsx
import '../styles/globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import type { AppProps } from 'next/app';
import Script from 'next/script'; // Importa Script
import { useState, useEffect } from 'react'; // Importa useState y useEffect

function MyApp({ Component, pageProps }: AppProps) {
  const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);

  // Este useEffect es opcional si solo necesitas cargar Tidio una vez en la vida del componente
  // Si el snippet de Tidio es muy simple y solo necesitas que se ejecute al cargar la página
  // puedes ponerlo directamente dentro del return como el script de PayPal.
  // Sin embargo, Tidio suele proporcionar un código que se auto-ejecuta.

  return (
    <>
      <Component {...pageProps} paypalSdkLoaded={paypalSdkLoaded} />

      {/* Script del SDK de PayPal - SOLO AQUÍ */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        strategy="afterInteractive" // Carga el script después de que la página se vuelve interactiva
        onLoad={() => {
          console.log('¡PayPal SDK se ha cargado exitosamente!');
          setPaypalSdkLoaded(true);
        }}
        onError={(e) => console.error('Error al cargar el SDK de PayPal:', e)}
      />

      {/* Script de Tidio - Colócalo AQUÍ, reemplazando con tu snippet real */}
      {/* Es crucial que uses el snippet EXACTO que Tidio te dio. */}
      <Script
        src="//code.tidio.co/YOUR_PUBLIC_KEY.js" // Reemplaza 'YOUR_PUBLIC_KEY' con tu clave pública de Tidio
        strategy="lazyOnload" // 'lazyOnload' es a menudo bueno para chats para no bloquear la carga inicial
        onLoad={() => {
          console.log('¡Tidio chat se ha cargado!');
        }}
        onError={(e) => console.error('Error al cargar Tidio chat:', e)}
      />

      {/* Si Tidio te da un snippet más complejo con un bloque <script> interno,
          tendrías que crear un componente separado o insertarlo dinámicamente.
          Pero la mayoría de las veces es solo un script SRC como el de arriba. */}
    </>
  );
}

export default MyApp;