-- ======================================
-- SCRIPT DE CONFIGURACIÓN SUPABASE
-- Para ImpuestosRD
-- ======================================

-- Crear tabla de contactos
CREATE TABLE IF NOT EXISTS public.contactos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS public.facturas (
    id BIGSERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamano_archivo INTEGER NOT NULL,
    ruta_storage VARCHAR(500) NOT NULL,
    subido_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contactos_fecha ON public.contactos(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_contactos_email ON public.contactos(email);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON public.facturas(subido_en);

-- Configurar Row Level Security (RLS)
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

-- Crear políticas de RLS (permitir todas las operaciones para simplificar)
CREATE POLICY "Permitir todas las operaciones en contactos" ON public.contactos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todas las operaciones en facturas" ON public.facturas
    FOR ALL USING (true) WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE public.contactos IS 'Tabla para almacenar los mensajes de contacto del formulario';
COMMENT ON TABLE public.facturas IS 'Tabla para almacenar información de facturas subidas';
COMMENT ON COLUMN public.contactos.nombre IS 'Nombre completo del contacto';
COMMENT ON COLUMN public.contactos.email IS 'Email del contacto';
COMMENT ON COLUMN public.contactos.telefono IS 'Teléfono del contacto (opcional)';
COMMENT ON COLUMN public.contactos.mensaje IS 'Mensaje del contacto';
COMMENT ON COLUMN public.facturas.nombre_archivo IS 'Nombre original del archivo';
COMMENT ON COLUMN public.facturas.tipo_archivo IS 'Tipo MIME del archivo';
COMMENT ON COLUMN public.facturas.tamano_archivo IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN public.facturas.ruta_storage IS 'Ruta del archivo en el storage';

-- Verificar que las tablas se crearon correctamente
SELECT 'contactos' as tabla, COUNT(*) as registros FROM public.contactos
UNION ALL
SELECT 'facturas' as tabla, COUNT(*) as registros FROM public.facturas;