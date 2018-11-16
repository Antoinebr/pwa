const Post = require('../models/Post');
const multer = require('multer');
const uuid = require('uuid');
const jimp = require('jimp'); // to make the filename 


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({
                message: 'That filetype isn\'t allowed!'
            }, false)
        }
    }
};

exports.upload = multer(multerOptions).single('file');


// resize Middleware
exports.resize = async (req, res, next) => {

    // check if there is no new file to resize 
    if (!req.file) {
        return next(); // skip to the next middleware
    }

    const extension = req.file.mimetype.split('/')[1];

    req.body.photo = `${uuid.v4()}.${extension}`;

    // let's resize
    const photo = await jimp.read(req.file.buffer);

    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    // once we have writter the photo on tehe filesystem let's continue
    next();
}



exports.createPost = async (req, res) => {

    if ( req.body.title === null || req.body.location  === null || req.body.file === null) {
        return res.status(400).send('400 : Missformed request you sent : ' + JSON.parse(req.body));
    }

    const data = {
        title: req.body.title,
        location: req.body.location,
        image: req.body.photo,
    };

    await Post.create(data)

    
    res.json(data);

}


exports.getPosts = async (req, res) => {

    const posts = await Post.findAll();

    res.json(posts);
};


exports.deletePostById = async (req, res) => {

    if (!req.body.id) {
        return res.status(400).send('400 : Missformed request');
    }

    await Post.destroy({
        where: {
            id: req.body.id,
        }
    });

    res.sendStatus(200);

};