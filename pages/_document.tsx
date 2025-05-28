// pages/_document.tsx
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="es">
        <Head>
          {/* Script del SDK de PayPal */}
          {/* REEMPLAZA 'YOUR_SANDBOX_CLIENT_ID' con tu ID de Cliente de Sandbox de PayPal */}
          {/* Asegúrate de cambiar 'USD' a la moneda que necesites si no es dólares. */}
          <script 
            src="https://www.paypal.com/sdk/js?client-id=YOUR_SANDBOX_CLIENT_ID&currency=USD" 
            data-sdk-integration-source="integrationbuilder"
            async 
            defer // 'async' y 'defer' son buenas prácticas para no bloquear el renderizado
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;