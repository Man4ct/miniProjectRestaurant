const {gql } = require('apollo-server');

const recipeTypeDefs = gql`

    type ingredientId{
    ingredient_id: Ingredient
    stock_used: Int
    }
    input ingredientInput{
    ingredient_id: ID
    stock_used: Int
    }
    type recipePage{
    count: Int
    page: Int
    max_page: Int
    data: [Recipe]
    }
    enum enumCategory {
        food
        drink
    }
    enum enumRecipe {
    active
    deleted
    unpublished
    }
    enum Publish {
        unpublished
        published
    }

    type recipeSort{
        recipe_name: enumSorting
        price: enumSorting
        sold: enumSorting
    }
    input recipeSorting{
        recipe_name: enumSorting
        price: enumSorting
        sold: enumSorting
        
    }
   
    type Recipe {
    id: ID
    recipe_name: String
    ingredients:[ingredientId]
    price: Int
    status: enumRecipe
    available: Int
    img: String
    description: String
    category: enumCategory
    finalPrice: Int
    highlight: Boolean
    isDiscount: Boolean
    discountAmount: Int
    sold: Int
    # sort: recipeSort
    # publish_status: Publish
    }
    type respondDelRecipe{
    message: String
    data: Recipe
    }
    input recipeInput {
    recipe_name: String
    ingredients:[ingredientInput]
    price: Int
    status: enumRecipe
    img: String
    description: String
    category: enumCategory
    highlight: Boolean
    # sort: recipeSort
    # publish_status: Publish
  }
type Query {
    getActiveMenu(recipe_name: String,page: Int,limit: Int  sorting: recipeSorting highlight: Boolean): recipePage!
    getAllRecipes(recipe_name: String page: Int,limit: Int sorting: recipeSorting highlight: Boolean): recipePage!

    getOneRecipe(id:ID!): Recipe
} 
type Mutation {
    createRecipe(inputRecipe:recipeInput) : Recipe!
    updateRecipe(id: ID,inputRecipe:recipeInput): Recipe!
    deleteRecipe(id: ID!): respondDelRecipe!
}`

module.exports = {recipeTypeDefs}