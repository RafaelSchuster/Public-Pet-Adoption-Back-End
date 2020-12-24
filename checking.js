const allUsers = require('./public/AllUsers.json');

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


module.exports = {
    checkUser,
    checkById,
    getIdByParams
};