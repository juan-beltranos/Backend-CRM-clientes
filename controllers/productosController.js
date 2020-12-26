const Productos = require('../models/Productos');

const multer = require('multer');
const shortid = require('shortid');
const { json } = require('express');


const configuracionMulter = {

    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../uploads');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no valido'))
        }
    },
}
//Pasar la configuracion y el campo
const upload = multer(configuracionMulter).single('imagen');

//sube un archivo
exports.subirArchivo = (req, res, next) => {

    upload(req, res, function (error) {
        if (error) {
            res, json({ mensaje: error })
        }
        return next();
    })

}

//Agrega nuevos productos
exports.nuevoProducto = async (req, res, next) => {
    const producto = new Productos(req.body);

    try {
        if (req.file.filename) {
            producto.imagen = req.file.filename
        }
        await producto.save();
        res.json({ mensaje: 'Se agrego nuevo producto' })

    } catch (error) {
        console.log(error);
        next();
    }
}

//Muestra todos los Productos
exports.mostrarProductos = async (req, res, next) => {
    try {
        const productos = await Productos.find({})
        res.json(productos);

    } catch (error) {
        console.log(error);
        next();
    }
}

//Muestra un producto en especifico por su ID
exports.mostrarProducto = async (req, res, next) => {

    const producto = await Productos.findById(req.params.idProducto);

    if (!producto) {
        res.json({ mensaje: 'Ese producto no existe' });
        return next();
    }

    // Mostrar el producto
    res.json(producto);
}

// Actualizar un producto por id
exports.actualizarProducto = async (req, res, next) => {
    try {
        const productoAnterior = await Productos.findById(req.params.idProducto);
        // Construir nuevo producto
        let nuevoProducto = req.body;

        if (req.file) {
            nuevoProducto.imagen = req.file.filename;
        } else {
            nuevoProducto.imagen = productoAnterior.imagen;
        }

        const producto = await Productos.findByIdAndUpdate({ _id: req.params.idProducto },
            nuevoProducto, {
            new: true,
        });
        res.json(producto);

    } catch (error) {
        console.log(error);
        next();
    }
}

// Eliminar producto
exports.eliminarProducto = async (req, res, next) => {

    try {
        await Productos.findOneAndDelete({ _id: req.params.idProducto });
        res.json({ mensaje: ' El producto se ha eliminado' })

    } catch (error) {
        console.log(error);
        next();
    }
}

//Buscar Prodcuto
exports.buscarProducto = async (req, res, next) => {
    // Obtener el query
    const { query } = req.params;
    const producto = await Productos.find({ nombre: new RegExp(query, 'i') });
    res.json(producto);

    try {

    } catch (error) {
        console.log(error);
        next();
    }
}