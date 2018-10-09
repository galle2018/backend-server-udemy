//************************************************************************
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


//==============================================================
// Verificar token
//==============================================================
exports.verificaToken = function(req, res, next) { //para poder usar estas funciones afuera

    var token = req.query.token; //para recibir y verificar el token

    //para verificar la validez del token
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) { //si el token genera algun error, o sea que no se encuetra autorizado
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        //para que cualquier lugar que se use esta funcion de verificatoken tendremos la informacion del usuario en el req
        req.usuario = decoded.usuario;

        next(); //llamamos el next si no no recibe el dato y no sabe que hacer, queda trabado.
        //Esto indica que puede continuar con las siguientes funciones que se encuentran a continuacion

    });

};



//************************************************************************