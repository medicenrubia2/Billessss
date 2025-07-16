-- Crear bucket para facturas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'facturas',
    'facturas',
    false,
    52428800, -- 50MB
    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Crear política para el bucket de facturas
CREATE POLICY "Permitir subida de facturas" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'facturas');

CREATE POLICY "Permitir lectura de facturas" ON storage.objects
    FOR SELECT USING (bucket_id = 'facturas');

-- Comentario para documentación
COMMENT ON POLICY "Permitir subida de facturas" ON storage.objects IS 'Permite subir archivos al bucket de facturas';
COMMENT ON POLICY "Permitir lectura de facturas" ON storage.objects IS 'Permite leer archivos del bucket de facturas';