"use strict"

var User = require("../models/user.model");
var Curse = require("../models/curse.model")
var bcrypt = require("bcrypt-nodejs");
const { use } = require('../routes/user.route');

/*
function pruebaControlador(req,res){
    res.status(200).send({message: "ControladorUsuario"});
}

*/
function register(req,res){
    var params = req.body;
    var user = new User();


     if(params.name && params.username && params.password && params.email && params.phone){
             User.findOne({username: params.username},(err,findUser)=>{
                 if(err){
                      res.status(500).send({message: "Error al ejecutarse el servidor"});
                 }else if(findUser){
                       res.status(200).send({message: "El nombre de usuario ya existe, por favor ingrese uno diferente"});
                  }else{
                         bcrypt.hash(params.password, null, null, (err,passwordHash)=>{
                          if(err){
                               res.status(500).send({message: "Error en la encriptación de contraseña"});
                          }else if(passwordHash){
                              user.name = params.name;
                              user.lastname = params.lastname;
                             user.username = params.username;
                             user.password = passwordHash;
                             user.email = params.email;
                              user.phone = params.phone;
                              if(params.role){
                              user.role = "ROLE_MAESTRO";
                            }else{
                            user.role = "ROLE_ALUMNO";
                        }

                        user.save((err,userSaved)=>{
                            if(err){
                                res.status(500).send({message: "Error en el servidor"});
                            }else if(userSaved){
                                res.status(200).send({message: "Usuario creado exitosamente", userSaved});
                            }else{
                                res.status(404).send({message: "No se pudo guardar"});
                            }
                        })
                    }
                })
            }
        })
    }else{
        res.status(200).send({message: "Ingrese por favor: Nombre, usuario, contraseña, correo y teléfono"});
    }
}

function login(req,res){
    var params = req.body;

    if (params.username && params.password){
        User.findOne({username: params.username},(err,userFind)=>{
            if(err){
                res.status(500).send({message: "Error al ejecutarse el servidor"});
            }else if (userFind){
                bcrypt.compare(params.password,userFind.password,(err,checkPassword)=>{
                    if(err){
                        res.status(500).send({message: "La contraseña es incorrecta"});
                    }else if(checkPassword){
                        res.status(200).send({message: "Sus credenciales son correctas", userFind});
                    }else{
                        res.status(404).send({message: "Usuario y/o contraseña incorrecto"});
                    }
                })
            }else{
                res.status(200).send({message: "El usuario no existe"});
            }
        })
    }else{
        res.status(200).send({message: "Ingrese los datos mínimos"});
    }
}

function updateUser(req,res){
    let userId = req.params.id;
    let update = req.body;

    if(update.password || update.role){
        res.status(200).send({message: "No puedes cambiar de rol ni contrsaeña"});
    }else{
        User.findOne({username:update.username},(err,userFind)=>{
            if(err){
                res.status(500).send({message: "Error al ejecutarse el servidor"});
            }else if(userFind){
                res.status(200).send({message: "El nombre de usuario ya existe por favor elija otro"});
            }else{
                User.findByIdAndUpdate(userId,update,{new:true},(err,userUpdated)=>{
                    if(err){
                        res.status(500).send({message: "Error al intentar actualizar"});
                    }else if(userUpdated){
                        res.status(200).send({message: "Usuario actualizado", userUpdated});
                    }else{
                        res.status(200).send({message: "No existe el usuario"});
                    }
                })
            }
        })
    }
}

function removeUser(req,res){
    let userId = req.params.id;

    User.findByIdAndRemove(userId,(err,userRemoved)=>{
        if(err){
            res.status(500).send({message: "Error al intentar eliminar"});
        }else if(userRemoved){
            res.status(200).send({message: "El usuario fue eliminado", userRemoved});
        }else{
            res.status(200).send({message: "El usuario no existe o ya fue eliminado"});
        }
    })
}

// Documentos Embedidos.

function createCurse(req,res){
    let userId = req.params.id;
    let paramsCurse = req.body;
    let curse = new Curse();

    User.findById(userId,(err,userFind)=>{
        if(err){
            res.status(500).send({message: "Error al ejecutarse el servidor"});
        }else if(userFind){
            if(paramsCurse.name && userFind.role == "ROLE_MAESTRO"){
                curse.name = paramsCurse.name;

                User.findByIdAndUpdate(userId,{$push:{curses:curse}},{new:true},(err,curseCreated)=>{
                    if(err){
                        res.status(500).send({message: "Error al intentar crear el curso"});
                    }else if(curseCreated){
                        res.status(200).send({message: "Curso creado exitosamente", curseCreated});
                    }else{
                        res.status(404).send({message: "El curso no fue creado"});
                    }
                })
            }else{
                res.status(200).send({message:"No ha ingresado el nombre o no tiene permiso para crear cursos"});
            }
        }else{
            res.status(200).send({message: "EL Usuario no existente"});
        }
    })
}

function getCurses(req,res){
    let userId = req.params.id;

    User.findOne({_id: userId}).exec((err,userCurse)=>{
        if(err){
             res.status(500).send({message: "Error al ejecutarse el servidor"});
        }else if(userCurse){
              if(userCurse.role == "ROLE_MAESTRO"){
                   res.status(200).send({message: "Contactos: ",contactos: userCurse.curses});
            }else{
                res.status(200).send({message: "No puede visualizar los cursos con esta cuenta"});
            }
            }else{
                 res.status(200).send({message: "El usuario no existe"});
        }
    })
}

function updateCurse(req,res){
    let userId = req.params.idU;
    let curseId = req.params.idC;
    let update = req.body;

    if(update.name){
        User.findOne({_id:userId},(err,userFind)=>{
            if(err){
                res.status(500).send({message: "Error al ejecutarse el servidor"});
            }else if(userFind){
                if(userFind.role == "ROLE_MAESTRO"){
                    User.findOneAndUpdate({_id: userId,"curses._id":curseId},
                    {"curses.$.name":update.name}, {new:true},(err,curseUpdated)=>{
                        if(err){
                            res.status(500).send({message: "El curso no existe"});
                        }else if(curseUpdated){
                            res.status(200).send({message: "El curso se actualizo", curseUpdated});
                        }else{
                            res.status(404).send({message: "El curso no se ha acutalizado"});
                        }
                    })
                  }else{
                    res.status(200).send({message: "No puede actualizar los cursos con esta cuenta"});
                }
            }else{
                res.status(200).send({message: "El usuario no existe"});
            }
        })
    }
}

function removeCurse(req,res){
    let userId = req.params.idU;
    let curseId = req.params.idC;
    
    User.findOne({_id:userId},(err,userFind)=>{
        if(err){
            res.status(500).send({message: "Error al ejecutarse el servidor"});
        }else if(userFind){
                if(userFind.role == "ROLE_MAESTRO"){
                User.findOneAndUpdate({_id:userId,"curses._id":curseId},
                {$pull:{curses: {_id:curseId}}},{new:true},(err,curseRemoved)=>{
                if(err){
                     res.status(500).send({message: "Error en el servidor, por favor intentelo de nuevo"});
                }else if(curseRemoved){
                        res.status(200).send({message: "El curso se ha eliminado", curseRemoved});
                }else{
                    res.status(200).send({message: "El curso no existe"});
                }
            })
            }else{
                res.status(200).send({message: "No puede eliminar los cursos con esta cuenta"});
            }
        }else{
            res.status(200).send({message: "El usuario no existe"});
        }
    })
}

module.exports = {
   /* pruebaControlador,*/
    register,
    login,
    updateUser,
    removeUser,
    createCurse,
    getCurses,
    updateCurse,
    removeCurse
}