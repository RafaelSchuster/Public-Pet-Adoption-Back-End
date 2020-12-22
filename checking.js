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

module.exports = checkUser;