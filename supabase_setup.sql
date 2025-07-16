-- Crear tabla de contactos
CREATE TABLE IF NOT EXISTS contactos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamano_archivo INTEGER NOT NULL,
    ruta_storage VARCHAR(500) NOT NULL,
    subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contactos_fecha ON contactos(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(subido_en);

-- Configurar Row Level Security (RLS)
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Crear políticas de RLS (permitir todas las operaciones por ahora)
CREATE POLICY "Permitir inserción de contactos" ON contactos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura de contactos" ON contactos
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de facturas" ON facturas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura de facturas" ON facturas
    FOR SELECT USING (true);

-- Comentarios para documentación
COMMENT ON TABLE contactos IS 'Tabla para almacenar los mensajes de contacto del formulario';
COMMENT ON TABLE facturas IS 'Tabla para almacenar información de facturas subidas';