const express = require('express')
const app = express()
const port = 5000
const multer = require('multer')
const fs = require('fs')
const cors = require('cors')
const user = require('./public/user.json')

app.use(express.json())
app.use(cors())


app.get('/user', (req, res)=>{
    res.send(user)
})

app.post('/user', (req, res)=>{
    fs.writeFile('./public/user.json', JSON.stringify(req.body.post, null, 2), (err, data) => {
        if (err) console.log('Errorrr')
    })
    console.log(req.body)
})

app.listen(port, ()=>{
    console.log('Running on Port 5000')
})