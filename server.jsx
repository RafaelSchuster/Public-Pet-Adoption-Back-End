require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt')
const app = express();
const jwt = require('jsonwebtoken')
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
const { addUser, addPet, checkLogin, updateUserProfile, updatePetProfile, getAllUsers, getAllPets,
    onUserById, onPetById, onSearchByType, onAdvSearch } = require('./mongoFuncs')
const { checkUser, checkById, getIdByParams, getPetsByType, getPetAdv } = require('./checking');
app.use(express.json());
app.use(cors());


const storage = multer.diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
        console.log(req.params)
        const { id } = req.params
        cb(null, `${parseInt(id)}-${file.originalname}`);
    }
});

const upload = multer({ storage });
app.use(express.static('images'));

app.post('/image_upload/:id', upload.single('file'), (req, res, next) => {
    const { id } = req.params
    const { originalname } = req.file
    const logObj = {
        'id': parseInt(id),
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

app.post('/user_sign', async (req, res) => {
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
    const hashedPassword = await bcrypt.hash(password, 10)

    allUsers.push({
        'id': userCount.length,
        'firstName': firstName,
        'lastName': lastName,
        'telephone': telephone,
        'email': email,
        'password': hashedPassword
    })
    const newUser = {
        id: userCount.length,
        firstName: firstName,
        lastName: lastName,
        telephone: telephone,
        email: email,
        password: hashedPassword
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

let user;

function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if(token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
      if(err)return res.sendStatus(403)
      console.log(user)
      req.user = user
      next()
  })
    
}

app.post('/userlogin', async (req, res) => {
    // if (checkUser(req.body)) {
    //     fs.writeFile('./public/CurrentUser.json', JSON.stringify(allUsers[checkUser(req.body)], null, 2), (err, data) => {
    //         if (err) console.log('Error in POST/userlogin');
    //     })
    // }
    user = allUsers.find(user => user.email == req.body.post.email)
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.post.password, user.password)) {
            const userEmail = req.body.post.email
            const thisUser = { name : userEmail}
            const accessToken = jwt.sign(thisUser, process.env.ACCESS_TOKEN_SECRET)
            res.json({accessToken : accessToken})
            // res.send(JSON.stringify(user));
        }
        else {
            res.send('Not Allowed')
        }
    } catch (error) {
        res.status(500).send()
    }

})

app.get('/userlogin',authenticateToken, async (req, res) => {
    res.send(user)
})

app.post('/userprofile', authenticateToken, (req, res) => {
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

app.get('/images/:id', async (req, res) => {
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
