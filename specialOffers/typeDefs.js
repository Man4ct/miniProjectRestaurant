const {gql} = require('apollo-server');

const  specialOfferTypeDefs = gql`
type specialOffer {
    id: ID
    title: String
    description: String
    menuDiscount: [menuDiscount]
    status: enumRecipe
    specialOfferDiscount: Int
}
input specialOfferInput {
    title: String
    description: String
    menuDiscount: [menuDiscountInput]
    status:enumRecipe
}
type menuDiscount {
    id: ID
    recipe_id: Recipe
    discount: Int
}
input menuDiscountInput{
        recipe_id: ID
        discount: Int
    }
type specialOfferPage{
    count: Int
    page: Int
    data: [specialOffer]
    max_page: Int
    }
type Query {
    getOneSpecialOffer(id:ID!) : specialOffer
    getAllSpecialOffers(page: Int limit: Int title: String, status:enumRecipe) : specialOfferPage
}
type Mutation {
    createSpecialOffer(specialOffer: specialOfferInput): specialOffer
    updateSpecialOffer(id: ID!,specialOffer: specialOfferInput ): specialOffer
}
`
module.exports = {specialOfferTypeDefs}
