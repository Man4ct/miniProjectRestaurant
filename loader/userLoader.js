const DataLoader = require('dataloader');
const {users} = require('../schema');

const loadUser = async function(checkId){
    let userList = await users.find({
        _id:{
            $in: checkId
        }
    })
    let userMap = {}
    userList.forEach((user) => userMap[user._id] = user)
    return checkId.map(id => userMap[id])
}

const userLoader = new DataLoader(loadUser)

module.exports = userLoader;

