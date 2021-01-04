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
    try {
        const db = client.db(dbName);
        const col = db.collection('allUsers');
        newUsers = await col.insertOne(newUser);
    } catch (error) {
        console.log(error);
    }
}

const addAdmin = async (newAdmin) => {
    console.log(newAdmin)
    try {
        const db = client.db(dbName);
        const col = db.collection('allAdmin');
        newAdmins = await col.insertOne(newAdmin);
    } catch (error) {
        console.log(error);
    }
}
const addPet = async (newPet) => {
    try {
        const db = client.db(dbName);
        const col = db.collection('allPets');
        newPets = await col.insertOne(newPet);
    } catch (error) {
        console.log(error);
    }
}

const updateUserProfile = async (userData) => {
    try {
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
    } catch (error) {
        console.log(error);
    }
}

const updatePetProfile = async (petData) => {
    try {
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
    } catch (error) {
        console.log(error);
    }
}

const checkDupes = async (email) => {
    try {
        let arrDupes = [];
        const db = client.db(dbName);
        const col = db.collection('allUsers');
        dupes = await col.find({
            email: email
        }).toArray();
        dupes.forEach(dupe => arrDupes.push(dupe));
        return arrDupes;
    } catch (error) {
        console.log(error);
    }
}
const checkAdminDupes = async (email) => {
    try {
        let arrDupes = [];
        const db = client.db(dbName);
        const col = db.collection('allAdmin');
        dupes = await col.find({
            email: email
        }).toArray();
        dupes.forEach(dupe => arrDupes.push(dupe));
        return arrDupes;
    } catch (error) {
        console.log(error);
    }
}

const getAllUsers = async () => {
    try {
        const usersArr = [];
        const db = client.db(dbName);
        const col = db.collection('allUsers');
        onGetAllUsers = await col.find({}).toArray();
        onGetAllUsers.forEach(el => usersArr.push(el));
        for (let i = 0; i < usersArr.length; i++) {
            usersArr[i].password = '';
        }
        return usersArr;
    } catch (error) {
        console.log('Get All Users Error');
    }
}

const getAllPets = async () => {
    try {
        const petsArr = [];
        const db = client.db(dbName);
        const col = db.collection('allPets');
        onGetAllPets = await col.find({}).toArray();
        onGetAllPets.forEach(el => petsArr.push(el));
        return petsArr;
    } catch (error) {
        console.log(error);
    }
}

const onUserById = async (id) => {
    try {
        const db = client.db(dbName);
        const col = db.collection('allUsers');
        userById = await col.findOne({
            id: parseInt(id)
        });
        if (userById) userById.password = ''
        return userById;
    } catch (error) {
        console.log(error);
    }
}
const getUserByEmail = async (email) => {
    try {
        const db = client.db(dbName);
        const col = db.collection('allUsers');
        userByEmail = await col.findOne({
            email: email
        });
        if (userByEmail) userByEmail.password = ''
        return userByEmail;
    } catch (error) {
        console.log(error);
    }
}

const getAdminByEmail = async (email) => {
    try {
        const db = client.db(dbName);
        const col = db.collection('allAdmin');
        adminByEmail = await col.findOne({
            email: email
        });
        if (adminByEmail) adminByEmail.password = ''
        return adminByEmail;
    } catch (error) {
        console.log(error);
    }
}

const onPetById = async (id) => {
    try {
        const db = client.db(dbName);
        const col = db.collection('allPets');
        petById = await col.findOne({
            id: parseInt(id)
        });
        return petById;
    } catch (error) {
        console.log(error);
    }
}

const onSearchByType = async (type) => {
    try {
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
    } catch (error) {
        console.log(error);
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
    try {
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
    } catch (error) {
        console.log(error);
    }
}

const updateOwnerStatus = async (userEmail, petId, status) => {
    try {
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
    } catch (error) {
        console.log(error);
    }
}

const savePet = async (userId, petId) => {
    try {
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
    } catch (error) {
        console.log(error);
    }
}

const unSavePet = async (userId, petId) => {
    try {
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
    } catch (error) {
        console.log(error);
    }
}

exports.checkAdminDupes = checkAdminDupes;
exports.addAdmin = addAdmin;
exports.getAdminByEmail = getAdminByEmail;
exports.checkDupes = checkDupes;
exports.unSavePet = unSavePet;
exports.savePet = savePet;
exports.addUser = addUser;
exports.addPet = addPet;
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