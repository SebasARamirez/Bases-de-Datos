// =====================================================
// 1. VERIFICAR EDICIÓN Y VERSIÓN
// Ejecutar como admin
// =====================================================

db.adminCommand({ buildInfo: 1 });

db.adminCommand({ getCmdLineOpts: 1 });


// =====================================================
// 2. CONSULTAR USUARIOS Y PRIVILEGIOS
// Ejecutar como admin
// =====================================================

db.getUsers();

db.getUser("app_ventas");


// =====================================================
// 3. CONSULTAR CLIENTES
// Ejecutar en la base comercial
// =====================================================

db.getSiblingDB("comercial").clientes.find().toArray();


// =====================================================
// 4. MODIFICACIÓN DEL RFC
// Ejecutar como app_ventas
// =====================================================

db.clientes.updateOne(
    { _id: 3 },
    { $set: { rfc: "GAMA780912XXX" } }
);

db.clientes.findOne(
    { _id: 3 },
    { nombre: 1, rfc: 1 }
);


// =====================================================
// 5. CONFIGURAR EL PERFILADOR
// Ejecutar como admin, en comercial
// =====================================================

db.setProfilingLevel(2);

db.getProfilingStatus();


// Consultar clientes por ciudad
// Ejecutar como app_ventas

db.clientes.find(
    { ciudad: "Culiacán" },
    { nombre: 1, ciudad: 1 }
).toArray();


// Modificar RFC

db.clientes.updateOne(
    { _id: 3 },
    { $set: { rfc: "GAMA780912XYZ" } }
);


// Eliminar cliente de prueba original de la actividad

db.clientes.deleteOne({ _id: 2 });


// Consultar operaciones registradas

db.system.profile.find(
    { ns: "comercial.clientes" }
).sort({ ts: 1 }).toArray();


// =====================================================
// 6. CONFIGURAR FILTRO DEL PERFILADOR
// Ejecutar como admin
// =====================================================

db.setProfilingLevel(0);

// Limpieza realizada durante la práctica.
// No repetir si se desea conservar la evidencia.


// db.system.profile.drop();

db.setProfilingLevel(1, {
    filter: {
        op: { $in: ["insert", "update", "remove"] }
    }
});

db.getProfilingStatus();


// =====================================================
// 7. CONSULTAR MODIFICACIONES
// Ejecutar como app_ventas
// =====================================================

db.clientes.find({ _id: 1 }).toArray();

db.clientes.updateOne(
    { _id: 1 },
    { $set: { telefono: "6670000000" } }
);


// Consultar perfilador

db.system.profile.find(
    {},
    {
        op: 1,
        ns: 1,
        command: 1,
        user: 1,
        client: 1,
        appName: 1,
        ts: 1
    }
).sort({ ts: 1 }).toArray();


// =====================================================
// 8. CONSULTAR BITÁCORA DE MONGOD
// Ejecutar como admin
// =====================================================

function bitacora() {
    return db.adminCommand({
        getLog: "global"
    }).log.map(l => JSON.parse(l));
}


// Consultar accesos fallidos

bitacora()
    .filter(e =>
        e.c === "ACCESS" &&
        e.msg === "Failed to authenticate"
    );


// Consultar autenticaciones exitosas

bitacora()
    .filter(e =>
        e.msg === "Successfully authenticated"
    );


// Consultar cambios de configuración del perfilador

bitacora()
    .filter(e =>
        e.msg === "Profiler settings changed"
    );


// =====================================================
// 9. INSTANTÁNEAS DE PRIVILEGIOS
// Ejecutar como admin
// =====================================================

db.getSiblingDB("auditoria")
    .instantaneas_privilegios.insertOne({
        momento: new Date(),
        tomada_por: db.runCommand({
            connectionStatus: 1
        }).authInfo.authenticatedUsers,
        usuarios: db.getUsers().users.map(u => ({
            user: u.user,
            db: u.db,
            roles: u.roles
        }))
    });


// Consultar instantáneas

db.getSiblingDB("auditoria")
    .instantaneas_privilegios.find(
        {},
        { _id: 0 }
    ).sort({ momento: 1 });


// Agregar temporalmente privilegio dbAdmin

db.grantRolesToUser(
    "app_ventas",
    [{ role: "dbAdmin", db: "comercial" }]
);


// Revocar privilegio adicional

db.revokeRolesFromUser(
    "app_ventas",
    [{ role: "dbAdmin", db: "comercial" }]
);


// Verificar privilegios finales

db.getUser("app_ventas");


// =====================================================
// 10. PRUEBAS CONTROLADAS DE OPERACIONES CRUD
// Ejecutar como app_ventas
// =====================================================

// Insertar cliente temporal

db.clientes.insertOne({
    nombre: "Cliente de prueba",
    correo: "lab02-prueba@example.test",
    telefono: "6679999999",
    rfc: "TEST000000XXX",
    edad: 30,
    ciudad: "Culiacán",
    codigo_postal: "80000"
});


// Consultar cliente temporal

db.clientes.find({
    correo: "lab02-prueba@example.test"
}).toArray();


// Actualizar cliente temporal

db.clientes.updateOne(
    { correo: "lab02-prueba@example.test" },
    { $set: { telefono: "6678888888" } }
);


// Eliminar cliente temporal

db.clientes.deleteOne({
    correo: "lab02-prueba@example.test"
});


// =====================================================
// 11. VERIFICACIÓN FINAL
// Ejecutar como admin
// =====================================================

db.getProfilingStatus();

db.system.profile.countDocuments();

db.getUser("app_ventas");
