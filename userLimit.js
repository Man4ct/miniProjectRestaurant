
const jwt = require('jsonwebtoken');
const {users} = require('./schema');
const { ApolloError} = require('apollo-errors');

async function testMiddleware(resolve,parent,args,context,info) {
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
        getAllUsers: testMiddleware,
        getOneIngredient: testMiddleware,
        getAllIngredient: testMiddleware,
        getOneRecipe: testMiddleware,
        getAllRecipes: testMiddleware,
        getOneTransaction: testMiddleware,
    },
    Mutation: {
        deleteUser: testMiddleware,
        addIngredient: testMiddleware,
        updateIngredient: testMiddleware,
        deleteIngredient: testMiddleware,
        deleteRecipe: testMiddleware,
        updateRecipe: testMiddleware,
        createRecipe: testMiddleware,
        createSpecialOffer: testMiddleware,
        updateSpecialOffer: testMiddleware,
    }
}

