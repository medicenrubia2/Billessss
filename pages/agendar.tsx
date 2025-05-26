// pages/agendar.tsx
import Layout from '../components/Layout'; // Asegúrate de que esta ruta sea correcta
import AppointmentForm from '../components/AppointmentForm'; // Asegúrate de que esta ruta sea correcta

export default function AgendarPage() {
  return (
    <Layout title="Agendar Consulta | RHAI" description="Agenda tu consulta migratoria gratuita con RHAI.">
      <div className="py-16 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AppointmentForm />
        </div>
      </div>
    </Layout>
  );
}