var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//==============================================================
// Obtener todos los usuarios
//==============================================================


app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(

            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });
});

//==============================================================
// Actualizar un nuevo usuario
//==============================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        //datos que pueden cambiarse por aqui
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        //ahora la grabacion de estos datos recien ingresados
        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});

//==============================================================
// Crear un nuevo usuario
//==============================================================

//con el mdAutenticacion.verificaToken indico que se haga la autenticacion, 
//caso fuera necesario mas de 1 autenticacion pondria [mdAutenticacion.verificaToken,..] (1 arreglo con todas las aut necesarias)
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    //Definicion para crear un nuevo usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    //Definicion para guardar un nuevo usuario
    usuario.save((err, usuarioGuardado) => {

        //manejar los errores    
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        //si no hay errores
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,

            usuariotoken: req.usuario
                //me muestra que usuario hizo la accion, o sea cual estaba logueado cundo se hizo la operacion
        });

    });

});

//==============================================================
// Borrar un usuario por el ID
//==============================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        //manejar los errores    
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        //si no hay errores
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;