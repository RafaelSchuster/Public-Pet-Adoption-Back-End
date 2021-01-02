const {
    MongoClient,
    ObjectID
} = require('mongodb');

const url = process.env.DB_URL;
const client = new MongoClient(url, {
    useUnifiedTopology: true
});

const dbName = 'pets';

client.connect().then(res => {
    if (res.topology.s.state) {
        console.log('State:' + '' + res.topology.s.state);
    }
})

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
    const {
        email,
        password
    } = userData.post;
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    handleLogin = await col.findOne({
        email: email,
        password: password
    });
    return handleLogin;
}

const updateUserProfile = async (userData) => {
    const {
        id,
        firstName,
        lastName,
        telephone,
        email,
        petsOwned,
        bio
    } = userData;
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    updatingUser = await col.updateOne({
        id: parseInt(id)
    }, {
        $set: {
            id: parseInt(id),
            firstName: firstName,
            lastName: lastName,
            email: email,
            telephone: telephone,
            petsOwned: petsOwned,
            bio: bio
        }
    });
}

const updatePetProfile = async (petData) => {
    console.log(petData)
    const {
        id,
        type,
        name,
        breed,
        color,
        height,
        weight,
        petStatus,
        hypoalergenic,
        dietRestrictions,
        petBio
    } = petData;
    const db = client.db(dbName);
    const col = db.collection('allPets');
    updatingPet = await col.updateOne({
        id: parseInt(id)
    }, {
        $set: {
            name: name,
            type: type,
            breed: breed,
            color: color,
            height: height,
            weight: weight,
            petStatus: petStatus,
            hypoalergenic: hypoalergenic,
            dietRestrictions: dietRestrictions,
            petBio: petBio
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
    userById = await col.findOne({
        id: parseInt(id)
    });
    return userById;
}
const getUserByEmail = async (email) => {
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    userByEmail = await col.findOne({
        email: email
    });
    console.log(userByEmail)
    return userByEmail;
}

const onPetById = async (id) => {
    const db = client.db(dbName);
    const col = db.collection('allPets');
    petById = await col.findOne({
        id: parseInt(id)
    });
    return petById;
}

const onSearchByType = async (type) => {
    if (type != 'undefined') {
        const petByTypeArr = [];
        const db = client.db(dbName);
        const col = db.collection('allPets');
        petByType = await col.find({
            type: type
        }).toArray();
        petByType.forEach(pet => petByTypeArr.push(pet));
        return petByTypeArr;
    }
    if (type == 'undefined') {
        const petByTypeArr = [];
        const db = client.db(dbName);
        const col = db.collection('allPets');
        petByType = await col.find({}).toArray();
        petByType.forEach(pet => petByTypeArr.push(pet));
        return petByTypeArr;
    }
}

const onAdvSearch = async (status, height, weight, type, name) => {
    try {
        let resultsArr = [];
        let filterObj = {};
        const db = client.db(dbName);
        const col = db.collection('allPets');
        if (status != 'undefined' && status != '') filterObj.petStatus = status;
        if (height != 'undefined' && height != '') filterObj.height = height;
        if (weight != 'undefined' && weight != '') filterObj.weight = weight;
        if (type != 'undefined' && type != '') filterObj.type = type;
        if (name != 'undefined' && name != '') filterObj.name = name;
        petAdvSearch = await col.find(filterObj).toArray();
        petAdvSearch.forEach(entry => {
            resultsArr.push(entry);
        })
        return resultsArr;
    } catch (error) {
        console.log(error);
    }
}

const updatePetStatus = async (id, petStatus) => {
    const db = client.db(dbName);
    const col = db.collection('allPets');
    updatingPetStatus = await col.updateOne({
        id: parseInt(id)
    }, {
        $set: {
            petStatus: petStatus,
        }
    });
    return updatingPetStatus;
}

const updateOwnerStatus = async (userEmail, petId, status) => {
    if (status == 'adopted' || status == 'fostered') {
        const db = client.db(dbName);
        const col = db.collection('allUsers');
        findUser = await col.findOne({
            email: userEmail
        })
        let newPetsLog = [];
        if (findUser.petsOwned) newPetsLog = findUser.petsOwned;
        newPetsLog.push(petId);
        updatingUser = await col.updateOne({
            email: userEmail
        }, {
            $set: {
                petsOwned: newPetsLog
            }
        });
    } else if (status == 'available') {
        const db = client.db(dbName);
        const col = db.collection('allUsers');
        findUser = await col.findOne({
            email: userEmail
        })
        let newPetsLog = findUser.petsOwned
        if (newPetsLog) {
            newPetsLog = newPetsLog.filter(pet => pet != petId);
            updatingUser = await col.updateOne({
                email: userEmail
            }, {
                $set: {
                    petsOwned: newPetsLog
                }
            });
        };

    }
}

const savePet = async (userId, petId) => {
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    findUser = await col.findOne({
        id: parseInt(userId)
    })
    let newSavedPetsLog = [];
    if (findUser.petsSaved) newSavedPetsLog = findUser.petsSaved;
    if (!newSavedPetsLog.includes(petId)) newSavedPetsLog.push(petId);
    updatingUser = await col.updateOne({
        id: parseInt(userId)
    }, {
        $set: {
            petsSaved: newSavedPetsLog
        }
    });
    return newSavedPetsLog;
}

const unSavePet = async (userId, petId) => {
    const db = client.db(dbName);
    const col = db.collection('allUsers');
    findUser = await col.findOne({
        id: parseInt(userId)
    })
    let newSavedPetsLog = [];
    if (findUser.petsSaved) newSavedPetsLog = findUser.petsSaved;
    newSavedPetsLog = newSavedPetsLog.filter(pet => pet != petId);
    updatingUser = await col.updateOne({
        id: parseInt(userId)
    }, {
        $set: {
            petsSaved: newSavedPetsLog
        }
    });
    return newSavedPetsLog;
}

exports.unSavePet = unSavePet;
exports.savePet = savePet;
exports.addUser = addUser;
exports.addPet = addPet;
exports.checkLogin = checkLogin;
exports.updateUserProfile = updateUserProfile;
exports.updatePetProfile = updatePetProfile;
exports.getAllUsers = getAllUsers;
exports.getAllPets = getAllPets;
exports.onUserById = onUserById;
exports.onPetById = onPetById;
exports.onSearchByType = onSearchByType;
exports.onAdvSearch = onAdvSearch;
exports.getUserByEmail = getUserByEmail;
exports.updatePetStatus = updatePetStatus;
exports.updateOwnerStatus = updateOwnerStatus;