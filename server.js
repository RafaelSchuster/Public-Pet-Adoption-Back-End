const express = require('express');
const app = express();
const port = 5000;
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const allUsers = require('./public/AllUsers.json');
const checkUser = require('./checking')
const currentUser = require('./public/CurrentUser.json')
app.use(express.json());
app.use(cors());


app.post('/user', (req, res) => {
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
        'firstName': firstName,
        'lastName': lastName,
        'telephone': telephone,
        'email': email,
        'password': password
    })
    fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2), (err, data) => {
        if (err) console.log('Error here');
    })
    res.send('Updated');
})


app.post('/userlogin', (req, res) => {
    if (checkUser(req.body)) {
        fs.writeFile('./public/CurrentUser.json', JSON.stringify(allUsers[checkLogin(req.body)], null, 2), (err, data) => {
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

app.listen(port, () => {
    console.log('Running on Port 5000');
})