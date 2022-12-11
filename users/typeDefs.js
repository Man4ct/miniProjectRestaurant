const {gql } = require('apollo-server');

const userTypeDefs = gql`#graphql
type User {
    id: ID
    img: String
    password: String
    email: String
    last_name: String
    first_name: String
    status: Enum
    userType: userType
    role: Role
    balance: Int
    token: String
    verify: String
    sort: userSort
    fullName: String
    isUsed: Boolean
    security_question: String
    security_answer: String
    }
    type userSort {
        email: enumSorting
        last_name: enumSorting
        first_name: enumSorting
    }

    input userSorting {
        email: enumSorting
        last_name: enumSorting
        first_name: enumSorting
    }
    type userType {
        userType_permission: [userType_permit]
    }
    type userType_permit{
        name: String
        view: Boolean
    }
type usersPage {
    count: Int
    page: Int
    data: [User]
    max_page: Int
    }
type respondDelUser {
    message: String
    data: User
    }
    enum Role{
        admin
        user
    }
enum Enum {
    active
    deleted
    }
enum enumSorting {
    asc
    desc
}
type userLogin {
    email: String
    fullName: String
    first_name: String
    last_name: String
    userType: userType
    role: Role
    isUsed: Boolean
    img: String
    
}
type respondAddCart {
    message: String
}
type login {
    message: String
    user: userLogin
    }
type Mutation {
    reqTokenByEmail(
        email: String
        fromRegister: Boolean
    ): User
    changePassword(
        old_password: String
        new_password: String
    ): User
    forgotPassword(
        email: String
        token: String
        new_password: String
    ) : User
    register(
    img: String
    password: String
    email: String
    last_name: String
    first_name: String
    security_question: String
    security_answer: String
    ) : User!
    updateUser(
    email: String
    last_name: String
    first_name: String
    fullName: String
    img: String
    ): User

    logout(
    email: String
    isUsed: Boolean
    ): User
    deleteUser(id: ID!): respondDelUser!
    getToken(email: String!, password:String!) : login!
}
type Query {
    getAllUsers(email:String,last_name: String,first_name:String,page: Int,limit: Int sort:userSorting ) : usersPage!
    getOneUser(email:String,id:ID): User
}`

    module.exports = {userTypeDefs}