const xmlrpc = require('xmlrpc');

module.exports = {
    getOdooClients,
};

function getOdooClients() {
    return new Promise((resolve, reject) => {
        // Conectar con Odoo
        const odooCredentials = {
            db: 'GameDataBase',
            user: 'a22jonorevel@inspedralbes.cat',
            password: 'Dam2023+++'
        };

        const clientOptions = {
            host: '141.147.16.21',
            port: 8069,
            path: '/xmlrpc/2/common'
        };
        const client = xmlrpc.createClient(clientOptions);

        // Autenticar en Odoo
        client.methodCall('authenticate', [odooCredentials.db, odooCredentials.user, odooCredentials.password, {}], (error, uid) => {
            if (error) {
                console.error('Error en la autenticación con Odoo:', error);
                reject('Error en la autenticación con Odoo');
            } else {
                if (uid > 0) {
                    const objectClientOptions = {
                        host: '141.147.16.21',
                        port: 8069,
                        path: '/xmlrpc/2/object'
                    };
                    const objectClient = xmlrpc.createClient(objectClientOptions);

                    // Consultar los clientes en Odoo
                    objectClient.methodCall('execute_kw', [odooCredentials.db, uid, odooCredentials.password, 'res.partner', 'search_read', [[]], {fields: ['name', 'email']}], (error, clients) => {
                        if (error) {
                            console.error('Error al consultar los clientes en Odoo:', error);
                            reject('Error al consultar los clientes en Odoo');
                        } else {
                            console.log('Clientes en Odoo:', clients);
                            resolve(clients);
                        }
                    });
                } else {
                    console.log('Autenticación fallida con Odoo.');
                    reject('Autenticación fallida con Odoo');
                }
            }
        });
    });
}
