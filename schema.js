const { Enum } = require('@apollo/protobufjs')
const express = require('express')
const mongoose = require('mongoose')
const moment = require('moment')
const { Timestamp } = require('bson')

const userSchema = new mongoose.Schema({
    token : {
        type: String,
    },
    password : {
        type: String,
        required: true,
        trim:true
    },
    balance : {
        type: Number,
        default: 500000,
    },
    img: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/168/168719.png",
    },
    email : {
        type: String,
        unique: true,
        required: true,
        trim:true
    },
    last_name: {
        type: String,
        required: true,
        trim:true
    },
    first_name: {
        type: String,
        required: true,
        trim:true
    },
    fullName: {
        type: String,
        required: true,
        trim:true
    },
    userType:{
        userType_permission:[
            {name:{
                type: String,
                trim:true,
                required: true
            },
        view:{
            type: Boolean,
            trim:true,
            required: true
        }
        }
        ]
        
    }
    ,
    
    status: {
        type: String,
        enum: ['active','deleted'],
        default: 'active'
    },
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    security_question: {
        type: String,
        required: true
    },
    security_answer: {
        type: String,
        required: true
    }
})
const ingredientsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "deleted"],
        default: 'active'
    },
    is_used: {
        type: Boolean
    }
})
const recipesSchema = new mongoose.Schema({
    recipe_name:{
        type: String,
        required: true,
        trim: true,
        unique: true
    } ,
    ingredients: [
        {
            ingredient_id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ingredients",
                required: true,
                unique: true
            },
            stock_used: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    price : {
        type: Number,
        required: true,
        trim: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["active", "deleted","unpublished"],
        default: 'unpublished'
    },
    category: {
        type: String,
        enum: ["food", "drink"]
    },
    img: {
        type: String,
        required: true
    },
    description: {
        type: String,
        // trim: true,
        required: true
    },
    sold: {
        type: Number,
        default: 0
    },
    available: {
        type: Number
    },
    highlight: {
        type: Boolean,
        default: false
    },
    isDiscount: {
        type: Boolean,
        default: false
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    }
    
})
const specialOffersSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        required: true,
    },
    description:{
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "deleted","unpublished"],
        default: 'unpublished'
    },
    menuDiscount: [
        {
            recipe_id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipes",
                required: true
            },
            discount: {
                type: Number,
                min: 0,
            }
        }
    ],
    specialOfferDiscount: {
        type: Number,
        min: 0,
    }
})
const transactionsSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    menu: [
        {
            recipe_id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipes",
                required: true
            },
            amount: {
                type: Number,
                required: true,
                min: 0,
                default:1
            },
            note: {
                type: String,
                default: ""
            }
        }
    ],
    order_status: {
        type: String,
        enum: ["success","pending", "failed"],
        // default: "pending"
    },
    order_date: {
        type : String,
        default : moment(new Date()).format("LLL")
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },

    onePrice: {
        type: Number,
        min: 0
    },
    recipeStatus:{
        type: String,
        enum: ["active", "deleted","unpublished"],
    },

    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    ingredientMap: [
        {
            _id: false,
            ingredient_id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ingredients",

            },
            stock: {
                type: Number,
                min: 0
            }
        }
    ],
},{timestamps: true})
const specialOffers = mongoose.model("specialOffers", specialOffersSchema)
const users = mongoose.model("Users", userSchema)
const ingredients = mongoose.model("Ingredients", ingredientsSchema)
const recipes = mongoose.model("Recipes", recipesSchema)
const transactions = mongoose.model("Transactions", transactionsSchema)



module.exports = {
    users,
    ingredients,
    recipes,
    transactions,
    specialOffers
}