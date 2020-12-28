const allUsers = require('./public/AllUsers.json');
const allPets = require('./public/AllPets.json')

const checkUser = (userData) => {
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].email === userData.post.email &&
            allUsers[i].password === userData.post.password) {
            return i;
        }
    }
    return false;
}

const checkById = (log, id) => {
    for (let i = 0; i < log.length; i++) {
        if (log[i].id == id) {
            return i;
        }
    }
    return false;
}

const getIdByParams = (log, name, type) => {
    for (let i = 0; i < log.length; i++) {
        if (log[i].name == name && log[i].type == type) {
            return i;
        };
    }
    return false;
}

const getPetsByType = (type) => {
    let arrPets = [];
    for (let i = 0; i < allPets.length; i++) {
        if (allPets[i].type.toLowerCase() == type.toLowerCase()) {
            arrPets.push(allPets[i]);
        };
    }
    return arrPets;
}

const getPetAdv = (status, height, weight, type, name) => {
    for (let i = 0; i < allPets.length; i++) {
        if (allPets[i].petStatus == status && allPets[i].height == height &&
            allPets[i].weight == weight && allPets[i].type == type &&
            allPets[i].name == name) {
            return allPets[i];
        };
    }
    return false;
}


module.exports = {
    checkUser,
    checkById,
    getIdByParams,
    getPetsByType,
    getPetAdv,
};