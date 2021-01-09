const functions = require('firebase-functions');

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt')
const app = express();
const jwt = require('jsonwebtoken')
const port = 5001;
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Joi = require('joi')
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const fileupload = require('express-fileupload');
const allUsers = require('./public/AllUsers.json');
const allAdmin = require('./public/AllAdmin.json');
const allPets = require('./public/AllPets.json');
const userCount = require('./public/UserCount.json');
const adminCount = require('./public/AdminCount.json');
const petCount = require('./public/PetCount.json');
const images = require('./public/ImagesLog.json');
const {
    addUser,
    addPet,
    updateUserProfile,
    updatePetProfile,
    getAllUsers,
    getAllPets,
    onUserById,
    getUserByEmail,
    onPetById,
    onSearchByType,
    onAdvSearch,
    updatePetStatus,
    updateOwnerStatus,
    savePet,
    unSavePet,
    checkDupes,
    getAdminByEmail,
    checkAdminDupes,
    addAdmin,
    addPetImg,
    getImgPathById,
    getIdByQuery,
    getAllAdmins,
    onAdminById,
    updateAdminProfile
} = require('./mongoFuncs');
const {
    checkUser,
    checkById,
    getIdByParams,
    getPetsByType,
    getPetAdv
} = require('./checking');
app.use(express.json());
app.use(cors());
app.use(fileupload({
    useTempFiles: true
}));

cloudinary.config({
    cloud_name: 'di2xmmv5e',
    api_key: '131112575212727',
    api_secret: 'zLLHjffan3B_wknRJTUb4Ox8FY8'
});

app.all('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/image_upload/:id', authenticateToken, (req, res, next) => {
    const {
        id
    } = req.params;
    const {
        file
    } = req.files;
    cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
        if (err) console.log(err);
        addPetImg(id, result.url);
        res.send('Image Uploaded Succesfully');
    })
});

app.post('/user_sign', async (req, res) => {
    const schema = Joi.object().keys({
        firstName: Joi.string().regex(/^([^0-9]*)$/).trim().required(),
        lastName: Joi.string().regex(/^([^0-9]*)$/).trim().required(),
        telephone: Joi.number().integer().required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(5).max(10).required()
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    });
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        userCount.push({
            'a': 'a'
        })
        const {
            firstName,
            lastName,
            telephone,
            email,
            password

        } = req.body.post;

        const hashedPassword = await bcrypt.hash(password, 10);

        allUsers.push({
            'id': userCount.length,
            'admin': false,
            'firstName': firstName,
            'lastName': lastName,
            'telephone': telephone,
            'email': email,
            'password': hashedPassword
        });
        const newUser = {
            id: userCount.length,
            admin: false,
            firstName: firstName,
            lastName: lastName,
            telephone: telephone,
            email: email,
            password: hashedPassword
        };
        fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
            if (err) console.log('Error here');
        })
        fs.writeFile('./public/UserCount.json', JSON.stringify(userCount, null, 2), (err, data) => {
            if (err) console.log('Error in UserCount');
        })
        try {
            const userEmail = req.body.post.email;
            const thisUser = {
                name: userEmail
            };
            const accessToken = jwt.sign(thisUser, process.env.ACCESS_TOKEN_SECRET);
            console.log(accessToken);
            res.send({
                accessToken: accessToken
            });
        } catch (error) {
            res.status(500).send('500 status error');
        }
        addUser(newUser);
    }
})

app.post('/admin_sign', async (req, res) => {
    const schema = Joi.object().keys({
        firstName: Joi.string().regex(/^([^0-9]*)$/).trim().required(),
        lastName: Joi.string().regex(/^([^0-9]*)$/).trim().required(),
        telephone: Joi.number().integer().required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(5).max(10).required()
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    });
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        adminCount.push({
            'a': 'a'
        })
        const {
            firstName,
            lastName,
            telephone,
            email,
            password

        } = req.body.post;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = {
            id: adminCount.length,
            admin: true,
            firstName: firstName,
            lastName: lastName,
            telephone: telephone,
            email: email,
            password: hashedPassword
        };
        allAdmin.push({
            'id': adminCount.length,
            'admin': true,
            'firstName': firstName,
            'lastName': lastName,
            'telephone': telephone,
            'email': email,
            'password': hashedPassword
        });

        fs.writeFile('./public/AllAdmin.json', JSON.stringify(allAdmin, null, 2), (err, data) => {
            if (err) console.log('Error Admin Sign');
        });
        fs.writeFile('./public/AdminCount.json', JSON.stringify(adminCount, null, 2), (err, data) => {
            if (err) console.log('Error Admin Sign');
        });
        try {
            const adminEmail = req.body.post.email;
            const thisAdmin = {
                name: adminEmail
            };
            const accessToken = jwt.sign(thisAdmin, process.env.ACCESS_TOKEN_SECRET);
            console.log(accessToken);
            res.send({
                accessToken: accessToken
            });
        } catch (error) {
            res.status(500).send('500 status error Admin Sign');
        }
        addAdmin(newAdmin);
    }
})

app.get('/checkdupes/:email', async (req, res) => {
    const {
        email
    } = req.params;
    res.send(await checkDupes(email));
})

app.get('/checkdupes/admin/:email', async (req, res) => {
    const {
        email
    } = req.params;
    res.send(await checkAdminDupes(email));
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

app.post('/userlogin', async (req, res) => {
    const schema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(5).max(10).required()
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    });
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        user = allUsers.find(user => user.email === req.body.post.email);
        if (user === null) {
            return res.status(400).send('Cannot find user');
        }
        try {
            if (await bcrypt.compare(req.body.post.password, user.password)) {
                const userEmail = req.body.post.email;
                const thisUser = {
                    name: userEmail
                };
                const accessToken = jwt.sign(thisUser, process.env.ACCESS_TOKEN_SECRET);
                res.send({
                    accessToken: accessToken
                });
            } else {
                res.send('Not Allowed');
            }
        } catch (error) {
            res.status(500).send();
        }
    }
})

app.post('/adminlogin', async (req, res) => {
    const schema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(5).max(10).required()
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    });
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        admin = allAdmin.find(admin => admin.email === req.body.post.email);
        if (admin === null) {
            return res.status(400).send('Cannot find user');
        }
        try {
            if (await bcrypt.compare(req.body.post.password, admin.password)) {
                const adminEmail = req.body.post.email;
                const thisAdmin = {
                    name: adminEmail
                };
                const accessToken = jwt.sign(thisAdmin, process.env.ACCESS_TOKEN_SECRET);
                res.send({
                    accessToken: accessToken
                });
            } else {
                res.send('Not Allowed');
            }
        } catch (error) {
            res.status(500).send();
        }
    }
})

app.get('/userlogin', authenticateToken, async (req, res) => {
    res.send(await getUserByEmail(req.user.name));
})

app.get('/adminlogin', authenticateToken, async (req, res) => {
    res.send(await getAdminByEmail(req.user.name));
})

app.post('/userprofile', authenticateToken, async (req, res) => {
    const schema = Joi.object().keys({
        id: Joi.string(),
        firstName: Joi.string().regex(/^([^0-9]*)$/).trim(),
        lastName: Joi.string().regex(/^([^0-9]*)$/).trim(),
        telephone: Joi.number().integer(),
        email: Joi.string().trim().email(),
        password: Joi.string().min(5).max(10),
        bio: Joi.string().max(140)
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    })
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        updateUserProfile(req.body);
        res.send(JSON.stringify('Succesfully Updated'));
    }
})

app.post('/adminprofile', authenticateToken, async (req, res) => {
    const schema = Joi.object().keys({
        id: Joi.string(),
        firstName: Joi.string().regex(/^([^0-9]*)$/).trim(),
        lastName: Joi.string().regex(/^([^0-9]*)$/).trim(),
        telephone: Joi.number().integer(),
        email: Joi.string().trim().email(),
        password: Joi.string().min(5).max(10),
        bio: Joi.string().max(140)
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    })
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        updateAdminProfile(req.body);
        res.send(JSON.stringify('Succesfully Updated'));
    }
})

app.get('/all_users', authenticateToken, async (req, res) => {
    res.send(await getAllUsers());
})

app.post('/pet_profile', authenticateToken, (req, res) => {
    const schema = Joi.object().keys({
        id: Joi.string(),
        type: Joi.string().regex(/^([^0-9]*)$/).trim(),
        name: Joi.string().regex(/^([^0-9]*)$/).trim(),
        breed: Joi.string().regex(/^([^0-9]*)$/).trim(),
        height: Joi.number().integer(),
        weight: Joi.number().integer(),
        color: Joi.string().regex(/^([^0-9]*)$/).trim(),
        dietRestrictions: Joi.string().trim(),
        hypoalergenic: Joi.string().regex(/^([^0-9]*)$/).trim(),
        petStatus: Joi.string().regex(/^([^0-9]*)$/).trim(),
        petBio: Joi.string().max(140)
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    });
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        petCount.push({
            'b': 'b'
        });
        const {
            name,
            type,
            breed,
            color,
            height,
            weight,
            dietRestrictions,
            petBio,
            petStatus,
            petsOwned,
            hypoalergenic
        } = req.body.post;

        allPets.push({
            'id': petCount.length,
            'name': name,
            'type': type,
            'breed': breed,
            'color': color,
            'height': height,
            'weight': weight,
            'dietRestrictions': dietRestrictions,
            'petBio': petBio,
            'petStatus': petStatus,
            'petsOwned': petsOwned,
            'hypoalergenic': hypoalergenic
        });
        const newPetProfile = {
            id: petCount.length,
            name: name,
            type: type,
            breed: breed,
            color: color,
            height: height,
            weight: weight,
            dietRestrictions: dietRestrictions,
            petBio: petBio,
            petStatus: petStatus,
            hypoalergenic: hypoalergenic
        };
        fs.writeFile('./public/AllPets.json', JSON.stringify(allPets, null, 2), (err, data) => {
            if (err) console.log('Error here');
        });
        fs.writeFile('./public/PetCount.json', JSON.stringify(petCount, null, 2), (err, data) => {
            if (err) console.log('Error in PetCount');
        });
        addPet(newPetProfile);
        res.send(JSON.stringify('Succesfully Uploaded'));
    }
})

app.get('/alladmins', authenticateToken, async (req, res) => {
    res.send(await getAllAdmins());
})

app.get('/allpets', authenticateToken, async (req, res) => {
    res.send(await getAllPets());
})

app.get('/users/:id', authenticateToken, async (req, res) => {
    const {
        id
    } = req.params;
    res.send(await onUserById(id));
})
app.get('/admins/:id', authenticateToken, async (req, res) => {
    const {
        id
    } = req.params;
    res.send(await onAdminById(id));
})
app.get('/pets/:id', async (req, res) => {
    const {
        id
    } = req.params;
    res.send(await onPetById(id));
})

app.post('/user_admin_edit', authenticateToken, (req, res) => {
    const schema = Joi.object().keys({
        id: Joi.string(),
        firstName: Joi.string().regex(/^([^0-9]*)$/).trim().required(),
        lastName: Joi.string().regex(/^([^0-9]*)$/).trim().required(),
        telephone: Joi.number().integer().required(),
        email: Joi.string().trim().email().required(),
        petsOwned: Joi.array().items(Joi.number()),
        bio: Joi.string().max(140)
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    });
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        const {
            id
        } = req.body.post;
        allUsers[checkById(allUsers, id)] = {
            ...allUsers[checkById(allUsers, req.id)],
            ...req.body.post
        };
        fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
            if (err) console.log('Error in POST /userprofile');
        });
        fs.writeFile('./public/CurrentUser.json', JSON.stringify(req.body.post, null, 2), (err, data) => {
            if (err) console.log('Error here');
        });
        updateUserProfile(req.body.post);
        res.send(JSON.stringify('Succesfully Updated'));
    }
})
app.post('/admin_profile_edit', authenticateToken, (req, res) => {
    const schema = Joi.object().keys({
        id: Joi.string(),
        firstName: Joi.string().regex(/^([^0-9]*)$/).trim().required(),
        lastName: Joi.string().regex(/^([^0-9]*)$/).trim().required(),
        telephone: Joi.number().integer().required(),
        email: Joi.string().trim().email().required(),
        petsOwned: Joi.array().items(Joi.number()),
        bio: Joi.string().max(140)
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    });
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        const {
            id
        } = req.body.post;
        allUsers[checkById(allUsers, id)] = {
            ...allUsers[checkById(allUsers, req.id)],
            ...req.body.post
        };
        fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
            if (err) console.log('Error in POST /userprofile');
        });
        fs.writeFile('./public/CurrentUser.json', JSON.stringify(req.body.post, null, 2), (err, data) => {
            if (err) console.log('Error here');
        });
        updateUserProfile(req.body.post);
        res.send(JSON.stringify('Succesfully Updated'));
    }
})

app.post('/pet_admin_edit', authenticateToken, (req, res) => {
    const schema = Joi.object().keys({
        id: Joi.string(),
        type: Joi.string().regex(/^([^0-9]*)$/).trim(),
        name: Joi.string().regex(/^([^0-9]*)$/).trim(),
        breed: Joi.string().regex(/^([^0-9]*)$/).trim(),
        height: Joi.number().integer(),
        weight: Joi.number().integer(),
        color: Joi.string().regex(/^([^0-9]*)$/).trim(),
        dietRestrictions: Joi.string().trim(),
        hypoalergenic: Joi.string().regex(/^([^0-9]*)$/).trim(),
        petStatus: Joi.string().regex(/^([^0-9]*)$/).trim(),
        petBio: Joi.string().max(140)
    });
    const validation = schema.validate(req.body.post, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err).end();
        }
    });
    if (validation.error && validation.error.details[0].message) {
        res.send(JSON.stringify(validation.error.details[0].message)).end();
    } else {
        const {
            id
        } = req.body.post;
        allPets[checkById(allPets, id)] = {
            ...allPets[checkById(allPets, req.id)],
            ...req.body.post
        };
        fs.writeFile('./public/AllPets.json', JSON.stringify(allPets, null, 2), (err, data) => {
            if (err) console.log('Error in POST /petprofile');
        });
        updatePetProfile(req.body.post);
        res.send(JSON.stringify('Succesfully Uploaded'));
    }
})

app.get('/images/:id', async (req, res) => {
    const {
        id
    } = req.params;
    res.send(await getImgPathById(id));
})
app.get('/pet_id/:name/type/:type', async (req, res) => {
    const {
        name,
        type
    } = req.params;
    res.send(await getIdByQuery(name, type));
})

app.get('/search_type/:type', async (req, res) => {
    const {
        type
    } = req.params;
    res.send(await onSearchByType(type));
})

app.get('/adv_search', async (req, res) => {
    const {
        status,
        height,
        weight,
        type,
        name
    } = req.query;
    res.send(await onAdvSearch(status, height, weight, type, name));
})

app.post('/pet_status/:id/update/:status', authenticateToken, async (req, res) => {
    const {
        id,
        status
    } = req.params;
    const {
        userEmail
    } = req.body;
    updateOwnerStatus(userEmail, id, status);
    res.send(updatePetStatus(id, status));
})

app.post(`/save_pet/user/:userId/pet/:petId`, authenticateToken, async (req, res) => {
    const {
        userId,
        petId
    } = req.params;
    res.send(await savePet(userId, petId));
})

app.delete(`/save_pet/user/:userId/pet/:petId`, authenticateToken, async (req, res) => {
    const {
        userId,
        petId
    } = req.params;
    res.send(await unSavePet(userId, petId));
})

app.listen(port, () => {
    console.log('Running on Port 5001');
})

exports.app = functions.https.onRequest(app);