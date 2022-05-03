const { pool } = require('../config/dataBase');

module.exports = {
    name: "vehiculos",
    version: "1.0.0",
    register: async (server) => {
        server.route([
            {
                method: "GET",
                path: "/api/vehiculo",
                handler: (request, h) => {
                    return 'Estas en la sección de Vehículos!'
                }
            },
            {
                method: "GET",                                  // Peticion de los Vehículos
                path: "/api/vehiculos",
                handler: async(request, h) => {
                    let cliente = await pool.connect();
                    try {
                        const result = await cliente.query(`SELECT * FROM vehiculos;`);
                        return result.rows
                        
                    } catch (err) {
                        console.log({ err })
                        return h.code(508).response({ error: 'No se pudieron consultar los vehículos de la base de datos' })
                    } finally {
                        cliente.release(true)
                    }
                }
            },
            {
                method: "POST",                                 // Agregar un Vehículo
                path: "/api/vehiculos",
                handler: async(request, h) => {
                    let cliente = await pool.connect();
                        const vehiculo = {
                            "placa": request.payload.placa,
                            "modelo": request.payload.modelo,
                            "venc_seguro": request.payload.venc_seguro,
                            "venc_tecnicomecanica": request.payload.venc_tecnicomecanica,
                            "color": request.payload.color,
                            "foto": request.payload.foto,
                            "id_linea": request.payload.id_linea
                        }
                    try {
                        await cliente.query(`
                        INSERT INTO vehiculos
                        VALUES ('${request.payload.placa}', ${request.payload.modelo}, '${request.payload.venc_seguro}', 
                            '${request.payload.venc_tecnicomecanica}', '${request.payload.color}', '${request.payload.foto}', ${request.payload.id_linea});
                            `)
                        const result = await cliente.query(`SELECT * FROM vehiculos WHERE placa='${ request.payload.placa }';`);
                        return result.rows;
                        
                    } catch (error) {
                        console.log(error);
                        return h.response({ error: 'No se pudo agregar un vehículo a la base de datos' }).code(508);
                    }
                }
            },
            {
                method: "PATCH",                                 // Editar un Vehículo
                path: "/api/vehiculos/{placa}",
                handler: async(request, h) => {
                    let cliente = await pool.connect();
                    
                    try {
                        const { placa } = request.params

                        const fields = Object.keys(request.payload);
                        const fieldsQuery = fields.map(field => {
                            if(typeof request.payload[`${field}`] === 'string'){
                                return `${field} = '${request.payload[`${field}`]}'`
                            }else{
                                return `${field} = ${request.payload[`${field}`]}`
                            }
                        })

                        await cliente.query(`UPDATE vehiculos SET ${fieldsQuery.join()} WHERE placa = '${placa}'`);
                        const vehiculo = await cliente.query(`SELECT * FROM vehiculos WHERE placa = '${placa}';`);
                        
                        return vehiculo.rows
                        
                    } catch (error) {
                        console.log(error);
                        return h.response({ error: 'No se puede editar el vehículo' }).code(508);
                    }
                }
            },
            {
                method: 'DELETE',                                   // Eliminar un vehiculo
                path: '/api/vehiculos/{placa}',
                handler: async( request, h ) =>{
                    let cliente = await pool.connect();
                    const { placa } = request.params;

                    try {
                        await cliente.query(`DELETE FROM vehiculos WHERE placa = '${placa}';`)
                        return `vehiculo con placa: ${placa} eliminado satisfactoriamente`
                    } catch (error) {
                        console.log(error);
                        return h.response({ error: 'No se pudó eliminar el vehículo' }).code(508);
                    }
                }
            }
        ]);

    },
};