const express = require('express');
const app = express();
const port = 5000;
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const user = require('./public/user.json');
const allUsers = require('./public/AllUsers.json');

app.use(express.json());
app.use(cors());


app.get('/user', (req, res) => {
    res.send(user);
})

app.post('/user', (req, res) => {
    const {firstName, lastName, telephone} = req.body.post
    fs.writeFile('./public/user.json', JSON.stringify(req.body.post, null, 2), (err, data) => {
        if (err) console.log('Error here');
    })
    console.log(req.body.post)
    allUsers.push({'firstName' : firstName , 'lastName' : lastName, 'telephone' : telephone})
    fs.writeFile('./public/AllUsers.json', JSON.stringify(allUsers, null, 2) ,(err, data)=>{
        if(err)console.log('Error here')
    } )
    res.send('Updated');
})

app.listen(port, () => {
    console.log('Running on Port 5000');
})