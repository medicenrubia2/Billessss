const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupSupabaseResources() {
    console.log('🔧 Setting up Supabase resources...');
    
    try {
        // Create contactos table
        console.log('Creating contactos table...');
        const { error: contactosError } = await supabase.rpc('exec', {
            sql: `
                CREATE TABLE IF NOT EXISTS contactos (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    telefono VARCHAR(20),
                    mensaje TEXT NOT NULL,
                    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        });
        
        if (contactosError) {
            console.log('❌ Error creating contactos table:', contactosError.message);
        } else {
            console.log('✅ contactos table created successfully');
        }
        
        // Create facturas table
        console.log('Creating facturas table...');
        const { error: facturasError } = await supabase.rpc('exec', {
            sql: `
                CREATE TABLE IF NOT EXISTS facturas (
                    id SERIAL PRIMARY KEY,
                    nombre_archivo VARCHAR(255) NOT NULL,
                    tipo_archivo VARCHAR(100) NOT NULL,
                    tamano_archivo INTEGER NOT NULL,
                    ruta_storage VARCHAR(500) NOT NULL,
                    subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        });
        
        if (facturasError) {
            console.log('❌ Error creating facturas table:', facturasError.message);
        } else {
            console.log('✅ facturas table created successfully');
        }
        
        // Create storage bucket
        console.log('Creating facturas storage bucket...');
        const { error: bucketError } = await supabase.storage.createBucket('facturas', {
            public: false,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });
        
        if (bucketError) {
            if (bucketError.message.includes('already exists')) {
                console.log('✅ facturas bucket already exists');
            } else {
                console.log('❌ Error creating facturas bucket:', bucketError.message);
            }
        } else {
            console.log('✅ facturas storage bucket created successfully');
        }
        
        console.log('🎉 Supabase setup completed!');
        
    } catch (error) {
        console.error('❌ General error:', error.message);
    }
}

setupSupabaseResources();