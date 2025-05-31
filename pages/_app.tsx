// C:\Users\martin\Desktop\aplicaciones\rhai\my-rhai-landing\pages\_app.tsx

import '../styles/globals.css'; // Tus estilos globales, si los tienes
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script'; // Importa el componente Script de Next.js

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Componente Head para metadatos de la página */}
      <Head>
        <title>My Rhai Landing</title>
        <meta name="description" content="Mi plataforma con Tawk.to chat en vivo" />
        <link rel="icon" href="/favicon.ico" />
        {/* Puedes añadir más meta tags, enlaces a fuentes, etc. aquí */}
      </Head>

      {/* Integración del widget de chat de Tawk.to */}
      {/* El componente Script de Next.js se encarga de inyectar este JS en el HTML final. */}
      <Script
        id="tawkto-chat-widget" // Un ID único para este script
        strategy="lazyOnload" // Carga el script después de que la página ha cargado sus recursos principales
      >
        {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            // Esta es la URL de tu widget Tawk.to que proporcionaste.
            // ¡Asegúrate de que esta URL sea la CORRECTA de tu panel de Tawk.to!
            s1.src='https://embed.tawk.to/683ad95ead4d94190a34c1c0/1isiu262i';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `}
      </Script>

      {/* Renderiza el componente de la página actual (ej. pages/index.tsx, pages/about.tsx) */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;