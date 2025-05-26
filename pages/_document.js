// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="es"> {/* Puedes cambiar "es" por el idioma principal de tu sitio */}
        <Head>
          {/* Aquí puedes agregar otras etiquetas <meta>, <link> para fuentes, etc. */}
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* ¡Aquí va tu script de Tidio! Justo antes del cierre de </body> */}
          <script src="//code.tidio.co/vu0pvgjdicdalke7yekuopjryki2vzfe.js" async></script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;