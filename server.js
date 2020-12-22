const express = require('express');
const app = express();
const port = 5000;
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const allUsers = require('./public/AllUsers.json');
const currentUser = require('./public/CurrentUser.json')
const allPets = require('./public/AllPets.json')
const userCount = require('./public/UserCount.json')
const petCount = require('./public/PetCount.json')
const {checkUser, checkById} = require('./checking')
app.use(express.json());
app.use(cors());


app.post('/user_sign', (req, res) => {
    console.log(userCount)
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
    fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
        if (err) console.log('Error here');
    })
    fs.writeFile('./public/UserCount.json', JSON.stringify(userCount, null, 2), (err, data) => {
        if (err) console.log('Error in UserCount');
    })
    res.send('Updated');
})


app.post('/userlogin', (req, res) => {
    if (checkUser(req.body)) {
        fs.writeFile('./public/CurrentUser.json', JSON.stringify(allUsers[checkUser(req.body)], null, 2), (err, data) => {
            if (err) console.log('Error in POST/userlogin');
        })
    }
    res.send(currentUser);
})

app.get('/userlogin', (req, res) => {
    res.send(currentUser);
})

app.post('/userprofile', (req, res) => {
    if (checkUser(req.body)) {
        const userIndex = checkUser(req.body);
        allUsers[userIndex] = req.body.post;
        fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
            if (err) console.log('Error in POST /userprofile');
        });
        fs.writeFile('./public/CurrentUser.json', JSON.stringify(allUsers[userIndex], null, 2), (err, data) => {
            if (err) console.log('Error in POST /userprofile');
        });
    };
})

app.get('/all_users', (req, res) => {
    res.send(allUsers)
})

app.post('/pet_profile', (req, res) => {
    console.log(req.body)
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
        'petStatus' : petStatus,
        'hypoalergenic' : hypoalergenic

    })
    fs.writeFile('./public/AllPets.json', JSON.stringify(allPets, null, 2), (err, data) => {
        if (err) console.log('Error here');
    })
    fs.writeFile('./public/PetCount.json', JSON.stringify(petCount, null, 2), (err, data) => {
        if (err) console.log('Error in PetCount');
    })
    res.send('Updated');
})

app.get('/allpets', (req, res) => {
    res.send(allPets)
})

app.get('/users/:id', (req, res) => {
    const {id } = req.params
    res.send(allUsers[checkById(allUsers,id)]) 
})
app.get('/pets/:id', (req, res) => {
    const {id } = req.params
    res.send(allPets[checkById(allPets,id)]) 
})

app.listen(port, () => {
    console.log('Running on Port 5000');
})