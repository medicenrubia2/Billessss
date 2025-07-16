const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
    console.log('🔧 Testing Supabase connection...');
    
    try {
        // Test 1: Basic connection
        const { data: testData, error: testError } = await supabase
            .from('contactos')
            .select('count')
            .limit(1);
        
        if (testError) {
            console.log('❌ contactos table not found, needs to be created');
        } else {
            console.log('✅ contactos table exists');
        }
        
        // Test 2: Test facturas table
        const { data: facturasData, error: facturasError } = await supabase
            .from('facturas')
            .select('count')
            .limit(1);
        
        if (facturasError) {
            console.log('❌ facturas table not found, needs to be created');
        } else {
            console.log('✅ facturas table exists');
        }
        
        // Test 3: Test storage bucket
        const { data: buckets, error: bucketError } = await supabase
            .storage
            .listBuckets();
        
        if (bucketError) {
            console.log('❌ Error accessing storage:', bucketError.message);
        } else {
            const facturasBucket = buckets.find(b => b.name === 'facturas');
            if (facturasBucket) {
                console.log('✅ facturas storage bucket exists');
            } else {
                console.log('❌ facturas storage bucket not found, needs to be created');
            }
        }
        
        // Test 4: Test insert to contactos
        try {
            const { data: insertData, error: insertError } = await supabase
                .from('contactos')
                .insert([{
                    nombre: 'Test Usuario',
                    email: 'test@example.com',
                    mensaje: 'Test de conexión',
                    fecha_creacion: new Date().toISOString()
                }])
                .select();
            
            if (insertError) {
                console.log('❌ Error inserting test contact:', insertError.message);
            } else {
                console.log('✅ Test contact inserted successfully');
                
                // Clean up - delete test contact
                await supabase
                    .from('contactos')
                    .delete()
                    .eq('id', insertData[0].id);
                console.log('✅ Test contact cleaned up');
            }
        } catch (e) {
            console.log('❌ Error testing contact insertion:', e.message);
        }
        
    } catch (error) {
        console.error('❌ General error:', error.message);
    }
}

testSupabaseConnection();