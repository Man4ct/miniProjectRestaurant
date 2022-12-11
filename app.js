const express = require('express');
const mongoose = require('mongoose');
const {users} = require('./schema');
const { ApolloServer,gql } = require('apollo-server');
const {makeExecutableSchema} = require('@graphql-tools/schema')
const {applyMiddleware} = require('graphql-middleware');
const authMiddleware = require('./auth')
const testMiddleware = require('./userLimit')
const DataLoader = require('dataloader');
const {merge} = require('lodash')
const ingredientLoader = require('./loader/ingredientLoader.js');
const userLoader = require ('./loader/userLoader')
const recipeLoader = require ('./loader/recipeLoader')
const resolverUser = require('./users/resolvers')
const resolverIngredient = require('./ingredients/resolvers')
const resolverRecipe = require('./recipes/resolvers')
const resolverTransaction = require('./transactions/resolvers')
const resolverSpecialOffer = require('./specialOffers/resolvers')
const {userTypeDefs} = require('./users/typeDefs')
const {ingredientTypeDefs} = require('./ingredients/typeDefs')
const {recipeTypeDefs} = require('./recipes/typeDefs')
const {transactionTypeDefs} = require('./transactions/typeDefs')
const {specialOfferTypeDefs} = require('./specialOffers/typeDefs')


const app = express();

connectDB().catch((err) => console.log(err));
async function connectDB() {
    await mongoose.connect("mongodb+srv://cisi:cisi123@cluster0.r5ynikk.mongodb.net/warmindo?retryWrites=true&w=majority");
}connectDB()
const typeDefs = [
    userTypeDefs,
    ingredientTypeDefs,
    recipeTypeDefs,
    transactionTypeDefs,
    specialOfferTypeDefs
]
const resolvers = merge(
    resolverUser,
    resolverIngredient,
    resolverRecipe,
    resolverTransaction,
    resolverSpecialOffer
)
    const schema =  makeExecutableSchema({
        typeDefs,
        resolvers
    })
    const schemaMiddleware = applyMiddleware(
        schema,authMiddleware,
        testMiddleware
    )
const server = new ApolloServer({
    schema: schemaMiddleware,
    context: function ({req}) {
      return {
        userLoader,
        ingredientLoader,
        recipeLoader,
        req 
      };}
  
  });



  server.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);