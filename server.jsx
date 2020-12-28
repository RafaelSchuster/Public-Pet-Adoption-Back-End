require('dotenv').config();
const express = require('express');
const app = express();
const port = 5000;
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const allUsers = require('./public/AllUsers.json');
const currentUser = require('./public/CurrentUser.json');
const allPets = require('./public/AllPets.json');
const userCount = require('./public/UserCount.json');
const petCount = require('./public/PetCount.json');
const images = require('./public/ImagesLog.json');
const { checkUser, checkById, getIdByParams, getPetsByType, getPetAdv } = require('./checking');
app.use(express.json());
app.use(cors());


const { MongoClient, ObjectID } = require('mongodb');

const url = process.env.DB_URL;
const client = new MongoClient(url, { useUnifiedTopology: true });

client.connect().then(res => {
    if (res.topology.s.state) {
        console.log('State:' + '' + res.topology.s.state);
    }
})

const dbName = 'pets';

const addUser = async (newUser) => {
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    newUsers = await col.insertOne(newUser);
}

const addPet = async (newPet) => {
    const db = client.db(dbName);
    const col = db.collection('allPets');
    newPets = await col.insertOne(newPet);
}

const checkLogin = async (userData) => {
    const { email, password } = userData.post;
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    handleLogin = await col.findOne({ email: email, password: password });
    return handleLogin;
}

const updateUserProfile = async (userData) => {
    const { id, firstName, lastName, telephone, email, petsOwned, bio } = userData;
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    updatingUser = await col.updateOne({
        id: id
    }, {
        $set: {
            id: id, firstName: firstName, lastName: lastName,
            email: email, telephone: telephone, petsOwned: petsOwned, bio: bio
        }
    });
}

const updatePetProfile = async (petData) => {
    const { id, type, name, breed, color, height, weight, petStatus, hypoalergenic, dietRestrictions, petBio } = petData;
    const db = client.db(dbName);
    const col = db.collection('allPets');
    updatingPet = await col.updateOne({
        id: parseInt(id)
    }, {
        $set: {
            name: name, type: type, breed: breed, color: color, height: height,
            weight: weight, petStatus: petStatus, hypoalergenic: hypoalergenic,
            dietRestrictions: dietRestrictions, petBio: petBio
        }
    });
}

const getAllUsers = async () => {
    const usersArr = [];
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    onGetAllUsers = await col.find({}).toArray();
    onGetAllUsers.forEach(el => usersArr.push(el));
    return usersArr;
}

const getAllPets = async () => {
    const petsArr = [];
    const db = client.db(dbName);
    const col = db.collection('allPets');
    onGetAllPets = await col.find({}).toArray();
    onGetAllPets.forEach(el => petsArr.push(el));
    return petsArr;
}

const onUserById = async (id) => {
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    userById = await col.findOne({ id: parseInt(id) });
    return userById;
}

const onPetById = async (id) => {
    const db = client.db(dbName);
    const col = db.collection('allPets');
    petById = await col.findOne({ id: parseInt(id) });
    return petById;
}

const onSearchByType = async (type) => {
    const petByTypeArr = [];
    const db = client.db(dbName);
    const col = db.collection('allPets');
    petByType = await col.find({ type: type }).toArray();
    petByType.forEach(pet => petByTypeArr.push(pet));
    return petByTypeArr;
}

const onAdvSearch = async (status, height, weight, type, name) => {
    const db = client.db(dbName);
    const col = db.collection('allPets');
    petAdvSearch = await col.findOne({ type: type, height: height, petStatus: status, weight: weight, name: name });
    return petAdvSearch;
}

const storage = multer.diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
        const { id } = req.params
        cb(null, `${id}-${file.originalname}`);
    }
});


const upload = multer({ storage });
app.use(express.static('images'));

app.post('/image_upload/:id', upload.single('file'), (req, res, next) => {
    const { id } = req.params
    const { originalname } = req.file
    const logObj = {
        'id': id,
        "FileName": `${id}-${originalname}`,
        "FilePath": req.file.path,
    }
    if (checkById(images, id) === false) {
        images.push(logObj);
        fs.writeFile('./public/ImagesLog.json', JSON.stringify(images, null, 2), (err, data) => {
            if (err) console.log('Error in Image Upload');
        })
    }
    else if (checkById(images, id) >= 0) {
        images[checkById(images, id)] = logObj;
        fs.writeFile('./public/ImagesLog.json', JSON.stringify(images, null, 2), (err, data) => {
            if (err) console.log('Error in Image Upload');
        })
    }
});

app.post('/user_sign', (req, res) => {
    userCount.push({
        'a': 'a'
    })
    const {
        firstName,
        lastName,
        telephone,
        email,
        password
    } = req.body.post
    fs.writeFile('./public/CurrentUser.json', JSON.stringify(req.body.post, null, 2), (err, data) => {
        if (err) console.log('Error here');
    })
    allUsers.push({
        'id': userCount.length,
        'firstName': firstName,
        'lastName': lastName,
        'telephone': telephone,
        'email': email,
        'password': password
    })
    const newUser = {
        id: userCount.length,
        firstName: firstName,
        lastName: lastName,
        telephone: telephone,
        email: email,
        password: password
    }
    fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
        if (err) console.log('Error here');
    })
    fs.writeFile('./public/UserCount.json', JSON.stringify(userCount, null, 2), (err, data) => {
        if (err) console.log('Error in UserCount');
    })
    addUser(newUser).catch(console.dir);

    res.send('Updated');
})


app.post('/userlogin', (req, res) => {
    // if (checkUser(req.body)) {
    //     fs.writeFile('./public/CurrentUser.json', JSON.stringify(allUsers[checkUser(req.body)], null, 2), (err, data) => {
    //         if (err) console.log('Error in POST/userlogin');
    //     })
    // }
    res.send(checkLogin(req.body));
})

app.get('/userlogin', (req, res) => {
    res.send(currentUser);
})

app.post('/userprofile', (req, res) => {
    // if (checkUser(req.body)) {
    //     const userIndex = checkUser(req.body);
    //     allUsers[userIndex] = { ...allUsers[userIndex], ...req.body.post }
    //     fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
    //         if (err) console.log('Error in POST /userprofile');
    //     });
    //     fs.writeFile('./public/CurrentUser.json', JSON.stringify(allUsers[userIndex], null, 2), (err, data) => {
    //         if (err) console.log('Error in POST /userprofile');
    //     });
    // };
    updateUserProfile(req.body);
})

app.get('/all_users', async (req, res) => {
    res.send(await getAllUsers());
})

app.post('/pet_profile', (req, res) => {
    petCount.push({
        'b': 'b'
    })
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
    } = req.body.post

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

    })
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
    }
    fs.writeFile('./public/AllPets.json', JSON.stringify(allPets, null, 2), (err, data) => {
        if (err) console.log('Error here');
    })
    fs.writeFile('./public/PetCount.json', JSON.stringify(petCount, null, 2), (err, data) => {
        if (err) console.log('Error in PetCount');
    })
    addPet(newPetProfile);
    res.send('Updated');
})

app.get('/allpets', async (req, res) => {
    res.send(await getAllPets());
})

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    res.send(await onUserById(id));
})
app.get('/pets/:id', async (req, res) => {
    const { id } = req.params;
    res.send(await onPetById(id));
})

app.post('/user_admin_edit', (req, res) => {
    const { id } = req.body.post;
    allUsers[checkById(allUsers, id)] = { ...allUsers[checkById(allUsers, req.id)], ...req.body.post }
    fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
        if (err) console.log('Error in POST /userprofile');
    });
    fs.writeFile('./public/CurrentUser.json', JSON.stringify(req.body.post, null, 2), (err, data) => {
        if (err) console.log('Error here');
    });
    updateUserProfile(req.body.post);
    res.send('yes');
})

app.post('/pet_admin_edit', (req, res) => {
    const { id } = req.body.post;
    allPets[checkById(allPets, id)] = { ...allPets[checkById(allPets, req.id)], ...req.body.post }
    fs.writeFile('./public/AllPets.json', JSON.stringify(allPets, null, 2), (err, data) => {
        if (err) console.log('Error in POST /petprofile');
    });
    updatePetProfile(req.body.post);
    res.send('yes');
})

app.get('/images/:id', (req, res) => {
    const { id } = req.params;
    res.send(images[checkById(images, id)]);
})
app.get('/pet_id/:name/type/:type', (req, res) => {
    const { name, type } = req.params;
    res.send(`${allPets[getIdByParams(allPets, name, type)].id}`);
})

app.get('/search_type/:type', async (req, res) => {
    const { type } = req.params;
    res.send(await onSearchByType(type));
})

app.get('/adv_search', async (req, res) => {
    const { status, height, weight, type, name } = req.query;
    res.send(await onAdvSearch(status, height, weight, type, name));
})

app.listen(port, () => {
    console.log('Running on Port 5000');
})