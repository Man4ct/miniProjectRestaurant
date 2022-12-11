const {gql} = require('apollo-server');

const ingredientTypeDefs = gql`#graphql
type Ingredient{
    id: ID
    name: String
    stock: Int
    status: Enum
    is_used: Boolean
    }
    type ingredientSort{
        name: enumSorting
        stock: enumSorting
    }
    input ingredientSorting{
        name: enumSorting
        stock: enumSorting
    }
type ingredientsPage{
    count: Int
    page: Int
    data: [Ingredient]
    max_page: Int
    }
type respondDelIngredient {
    message: String
    data: Ingredient
    }
type Mutation{
    addIngredient(name: String!,stock: Int!): Ingredient!
    updateIngredient(id: ID!,stock: Int name: String) : Ingredient!
    deleteIngredient(id: ID!) : respondDelIngredient
    }
type Query {
    getOneIngredient(id:ID!): Ingredient!
    getAllIngredient(name: String,stock: Int,page:Int, limit: Int, sort: ingredientSorting): ingredientsPage
    }`

module.exports = {ingredientTypeDefs}