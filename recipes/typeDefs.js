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
    enum Category {
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
    category: Category
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

type Query {
    getActiveMenu(recipe_name: String,page: Int,limit: Int  sorting: recipeSorting highlight: Boolean): recipePage!
    getAllRecipes(recipe_name: String page: Int,limit: Int sorting: recipeSorting highlight: Boolean): recipePage!

    getOneRecipe(id:ID!): Recipe
}
type Mutation {
    createRecipe(recipe_name: String!  isDiscount: Boolean discountAmount: Int category: Category  img: String description: String price: Int! highlight: Boolean input:[ingredientInput]) : Recipe!
    updateRecipe(id:ID! recipe_name: String  isDiscount: Boolean discountAmount: Int img: String status: enumRecipe description: String price: Int highlight: Boolean input:[ingredientInput]): Recipe!
    deleteRecipe(id: ID!): respondDelRecipe!
}`

module.exports = {recipeTypeDefs}