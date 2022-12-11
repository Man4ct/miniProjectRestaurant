
const jwt = require('jsonwebtoken');
const { ApolloError} = require('apollo-errors');
const { users } = require('./schema');

async function authMiddleware(resolve,parent,args,context,info) {
    const token = context.req.headers.authorization || ''
    if(!token){
        throw new ApolloError('FooError', {
            message: 'Not Authorized!'
    })}

    const decoded = jwt.verify(token,'zetta')
    const user = await users.findOne({
        email: decoded.email
    })
    context.req.payload = user.id
    return resolve(parent,args,context,info)
}

module.exports = {
    Query: {
        getOneUser: authMiddleware,
        getAllUsers: authMiddleware,
        getOneIngredient: authMiddleware,
        getAllIngredient: authMiddleware,
        getOneRecipe: authMiddleware,
        getAllRecipes: authMiddleware,
        getOneTransaction: authMiddleware,
        getAllTransactions: authMiddleware,
    },
    Mutation: {
        checkoutTransaction: authMiddleware,
        changePassword: authMiddleware,
        updateUser: authMiddleware,
        deleteUser: authMiddleware,
        addIngredient: authMiddleware,
        updateIngredient: authMiddleware,
        deleteIngredient: authMiddleware,
        deleteRecipe: authMiddleware,
        updateRecipe: authMiddleware,
        createRecipe: authMiddleware,
        createTransaction: authMiddleware,
        updateTransaction: authMiddleware,
        createSpecialOffer: authMiddleware,
        updateSpecialOffer: authMiddleware,
    }
}

