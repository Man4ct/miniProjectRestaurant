
const jwt = require('jsonwebtoken');
const {users} = require('./schema');
const { ApolloError} = require('apollo-errors');

async function userLimitMiddleware(resolve,parent,args,context,info) {
    const user_id= context.req.payload

    const user = await users.findById(user_id)
    if(user.role === "user"){
        throw new ApolloError('FooError',{
        message: "User Cannot Acces This Page"})
    }
    return resolve(parent,args,context,info)
}



module.exports = {
    Query: {
        getAllUsers: userLimitMiddleware,
        getOneIngredient: userLimitMiddleware,
        getAllIngredient: userLimitMiddleware,
        getOneRecipe: userLimitMiddleware,
        getAllRecipes: userLimitMiddleware,
        getOneTransaction: userLimitMiddleware,
    },
    Mutation: {
        deleteUser: userLimitMiddleware,
        addIngredient: userLimitMiddleware,
        updateIngredient: userLimitMiddleware,
        deleteIngredient: userLimitMiddleware,
        deleteRecipe: userLimitMiddleware,
        updateRecipe: userLimitMiddleware,
        createRecipe: userLimitMiddleware,
        createSpecialOffer: userLimitMiddleware,
        updateSpecialOffer: userLimitMiddleware,
    }
}

