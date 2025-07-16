const fs = require('fs');
const path = require('path');

// Directorios para almacenar datos localmente
const dataDir = path.join(__dirname, '../data');
const contactosFile = path.join(dataDir, 'contactos.json');
const facturasFile = path.join(dataDir, 'facturas.json');

// Crear directorio si no existe
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar archivos si no existen
if (!fs.existsSync(contactosFile)) {
    fs.writeFileSync(contactosFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(facturasFile)) {
    fs.writeFileSync(facturasFile, JSON.stringify([], null, 2));
}

// Simulador de Supabase para desarrollo local
const localSupabase = {
    from: (table) => {
        return {
            insert: async (data) => {
                try {
                    let file = table === 'contactos' ? contactosFile : facturasFile;
                    let records = JSON.parse(fs.readFileSync(file, 'utf8'));
                    
                    // Agregar ID y timestamp
                    const newRecord = {
                        id: records.length + 1,
                        ...data[0],
                        fecha_creacion: data[0].fecha_creacion || new Date().toISOString(),
                        subido_en: data[0].subido_en || new Date().toISOString()
                    };
                    
                    records.push(newRecord);
                    fs.writeFileSync(file, JSON.stringify(records, null, 2));
                    
                    return { data: [newRecord], error: null };
                } catch (error) {
                    return { data: null, error: { message: error.message } };
                }
            },
            
            select: (columns = '*') => {
                return {
                    eq: (column, value) => {
                        return {
                            single: async () => {
                                try {
                                    let file = table === 'contactos' ? contactosFile : facturasFile;
                                    let records = JSON.parse(fs.readFileSync(file, 'utf8'));
                                    let record = records.find(r => r[column] == value);
                                    
                                    if (record) {
                                        return { data: record, error: null };
                                    } else {
                                        return { data: null, error: { message: 'Record not found' } };
                                    }
                                } catch (error) {
                                    return { data: null, error: { message: error.message } };
                                }
                            }
                        };
                    },
                    order: (column, options = {}) => {
                        return {
                            then: async (callback) => {
                                try {
                                    let file = table === 'contactos' ? contactosFile : facturasFile;
                                    let records = JSON.parse(fs.readFileSync(file, 'utf8'));
                                    
                                    // Ordenar registros
                                    if (options.ascending === false) {
                                        records.sort((a, b) => new Date(b[column]) - new Date(a[column]));
                                    } else {
                                        records.sort((a, b) => new Date(a[column]) - new Date(b[column]));
                                    }
                                    
                                    return callback({ data: records, error: null });
                                } catch (error) {
                                    return callback({ data: null, error: { message: error.message } });
                                }
                            }
                        };
                    }
                };
            },
            
            eq: (column, value) => {
                return {
                    single: async () => {
                        try {
                            let file = table === 'contactos' ? contactosFile : facturasFile;
                            let records = JSON.parse(fs.readFileSync(file, 'utf8'));
                            let record = records.find(r => r[column] == value);
                            
                            if (record) {
                                return { data: record, error: null };
                            } else {
                                return { data: null, error: { message: 'Record not found' } };
                            }
                        } catch (error) {
                            return { data: null, error: { message: error.message } };
                        }
                    }
                };
            },
            
            order: (column, options = {}) => {
                return {
                    then: async (callback) => {
                        try {
                            let file = table === 'contactos' ? contactosFile : facturasFile;
                            let records = JSON.parse(fs.readFileSync(file, 'utf8'));
                            
                            // Ordenar registros
                            if (options.ascending === false) {
                                records.sort((a, b) => new Date(b[column]) - new Date(a[column]));
                            } else {
                                records.sort((a, b) => new Date(a[column]) - new Date(b[column]));
                            }
                            
                            return callback({ data: records, error: null });
                        } catch (error) {
                            return callback({ data: null, error: { message: error.message } });
                        }
                    },
                    select: (columns = '*') => {
                        return {
                            then: async (callback) => {
                                try {
                                    let file = table === 'contactos' ? contactosFile : facturasFile;
                                    let records = JSON.parse(fs.readFileSync(file, 'utf8'));
                                    
                                    // Ordenar registros
                                    if (options.ascending === false) {
                                        records.sort((a, b) => new Date(b[column]) - new Date(a[column]));
                                    } else {
                                        records.sort((a, b) => new Date(a[column]) - new Date(b[column]));
                                    }
                                    
                                    return callback({ data: records, error: null });
                                } catch (error) {
                                    return callback({ data: null, error: { message: error.message } });
                                }
                            }
                        };
                    }
                };
            }
        };
    },
    
    storage: {
        from: (bucket) => {
            return {
                upload: async (path, file, options = {}) => {
                    try {
                        // Simular subida de archivo
                        const uploadDir = path.join(__dirname, '../uploads');
                        if (!fs.existsSync(uploadDir)) {
                            fs.mkdirSync(uploadDir, { recursive: true });
                        }
                        
                        const filename = path.split('/').pop();
                        const filePath = path.join(uploadDir, filename);
                        
                        // Copiar archivo
                        fs.writeFileSync(filePath, file);
                        
                        return { data: { path: path }, error: null };
                    } catch (error) {
                        return { data: null, error: { message: error.message } };
                    }
                },
                
                createSignedUrl: async (path, expiresIn) => {
                    try {
                        // Simular URL firmada
                        const signedUrl = `http://localhost:4000/uploads/${path.split('/').pop()}`;
                        return { data: { signedUrl }, error: null };
                    } catch (error) {
                        return { data: null, error: { message: error.message } };
                    }
                }
            };
        }
    }
};

module.exports = localSupabase;