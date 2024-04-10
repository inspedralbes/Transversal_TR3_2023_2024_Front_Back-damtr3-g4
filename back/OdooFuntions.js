const xmlrpc = require('xmlrpc');

module.exports = {
    getOdooClients,
    createSaleOrderInOdoo,
    getProductInfo,
    insertUserToOdoo,
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


async function createSaleOrderInOdoo(productId, partnerId) {
    const clientOptions = {
        host: '141.147.16.21',
        port: 8069,
        path: '/xmlrpc/2/common'
    };

    const client = xmlrpc.createClient(clientOptions);

    const db = 'GameDataBase';
    const user = 'a22jonorevel@inspedralbes.cat';
    const password = 'Dam2023+++';

    return new Promise((resolve, reject) => {
        client.methodCall('authenticate', [db, user, password, {}], (error, uid) => {
            if (error) {
                console.error('Error en la autenticación:', error);
                reject(error);
            } else {
                if (uid > 0) {
                    const objectClientOptions = {
                        host: '141.147.16.21',
                        port: 8069,
                        path: '/xmlrpc/2/object'
                    };

                    const objectClient = xmlrpc.createClient(objectClientOptions);

                    const saleOrderData = {
                        partner_id: partnerId,
                        order_line: [
                            [0, 0, {
                                product_id: productId,
                                product_uom_qty: 1, // Cantidad del producto
                            }]
                        ]
                    };

                    objectClient.methodCall('execute_kw', [db, uid, password, 'sale.order', 'create', [saleOrderData]], (error, saleOrderId) => {
                        if (error) {
                            console.error('Error al crear la orden de venta:', error);
                            reject(error);
                        } else {
                            objectClient.methodCall('execute_kw', [db, uid, password, 'sale.order', 'action_confirm', [[saleOrderId]]], (error, result) => {
                                if (error) {
                                    console.error('Error al confirmar la orden de venta:', error);
                                    reject(error);
                                } else {
                                    resolve(saleOrderId);
                                }
                            });
                        }
                    });
                }
            }
        });
    });
}

async function getProductInfo() {
    const db = 'GameDataBase';
    const user = 'a22jonorevel@inspedralbes.cat';
    const password = 'Dam2023+++';

    const clientOptions = {
        host: '141.147.16.21',
        port: 8069,
        path: '/xmlrpc/2/common'
    };
    const client = xmlrpc.createClient(clientOptions);

    return new Promise((resolve, reject) => {
        client.methodCall('authenticate', [db, user, password, {}], (error, uid) => {
            if (error) {
                console.error('Error en la autenticación:', error);
                reject('Error en la autenticación');
            } else {
                if (uid > 0) {
                    const objectClientOptions = {
                        host: '141.147.16.21',
                        port: 8069,
                        path: '/xmlrpc/2/object'
                    };
                    const objectClient = xmlrpc.createClient(objectClientOptions);

                    objectClient.methodCall('execute_kw', [db, uid, password, 'product.product', 'search_read', [[]], {fields: ['id', 'name']}], (error, products) => {
                        if (error) {
                            console.error('Error al obtener la lista de productos:', error);
                            reject('Error al obtener la lista de productos');
                        } else {
                            console.log('Lista de productos:');
                            const productList = products.map(product => ({ id: product.id, name: product.name }));
                            console.log(productList);
                            resolve(productList);
                        }
                    });
                } else {
                    console.log('Autenticación fallida.');
                    reject('Autenticación fallida');
                }
            }
        });
    });
}

async function insertUserToOdoo(user) {
    const db = 'GameDataBase';
    const odooUser = 'a22jonorevel@inspedralbes.cat';
    const odooPassword = 'Dam2023+++';

    // Mapear los campos del nuevo usuario al modelo de datos de clientes de Odoo
    const odooClient = {
        name: user.name, // Nombre del cliente en Odoo
        email: user.mail, // Correo electrónico del cliente en Odoo
        // Puedes mapear otros campos según sea necesario
    };

    const clientOptions = {
        host: '141.147.16.21',
        port: 8069,
        path: '/xmlrpc/2/common'
    };
    const client = xmlrpc.createClient(clientOptions);

    return new Promise((resolve, reject) => {
        client.methodCall('authenticate', [db, odooUser, odooPassword, {}], (error, uid) => {
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

                    // Insertar el nuevo cliente en Odoo
                    objectClient.methodCall('execute_kw', [db, uid, odooPassword, 'res.partner', 'create', [odooClient]], (error, clientId) => {
                        if (error) {
                            console.error('Error al crear el cliente en Odoo:', error);
                            reject('Error al crear el cliente en Odoo');
                        } else {
                            console.log('ID del nuevo cliente en Odoo:', clientId);
                            resolve(clientId);
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