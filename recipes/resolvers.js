const mongoose = require('mongoose');
const {recipes,ingredients,transactions} = require('../schema');
const { ApolloError} = require('apollo-errors');

async function getActiveMenu(parent,args,context,info) {
    let count = await recipes.count({status:'active'});
    let aggregateQuery = [
            {$match: {
                status: 'active'
            }},
            {$sort: {_id:-1}}
    ]
    if(args.sorting){
        if(args.sorting.recipe_name){
            args.sorting.recipe_name === 'asc' ? aggregateQuery.push({$sort: {recipe_name:-1}}) : aggregateQuery.push({$sort: {recipe_name:1}})
        }
        if(args.sorting.price){
            args.sorting.price === 'asc' ? aggregateQuery.push({$sort: {price:-1}}) : aggregateQuery.push({$sort: {price:1}})
        }
        if(args.sorting.sold){
            args.sorting.sold === 'asc' ? aggregateQuery.push({$sort: {sold:-1}}) : aggregateQuery.push({$sort: {sold:1}})
        }
    }
    if(args.highlight) {
        aggregateQuery.push({
            $match: {
                highlight: args.highlight
            }
        })
    }
    if(args.recipe_name){
        aggregateQuery.push({
            $match: {recipe_name: new RegExp(args.recipe_name, "i")}
        })
        count = await recipes.count({recipe_name: new RegExp(args.recipe_name, "i")});
    }
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
    }

    let result = await recipes.aggregate(aggregateQuery);
    result.forEach((el)=>{
                el.id = mongoose.Types.ObjectId(el._id)
            })
            if(!args.page){
                count = result.length
            }
            const max_page = Math.ceil(count/args.limit) || 1
            if(max_page < args.page){
                throw new ApolloError('FooError', {
                    message: 'Page is Empty!'
                });
            }
    return {
    count: count,
    max_page: max_page,
    page: args.page,
    data: result
    };
}

async function getAllRecipes(parent,args,context,info) {
    let count = await recipes.count({status:{$ne:'deleted'} });
    let aggregateQuery = [
        {$match: {
            status:  {$ne: 'deleted'},
        }},            
        {$sort: {_id:-1}}
    ]
    if(args.highlight) {
        aggregateQuery.push({
            $match: {
                highlight: args.highlight
            }
        })
    }
    if(args.recipe_name){
        aggregateQuery.push({
            $match: {recipe_name: new RegExp(args.recipe_name, "i")}
        })
        count = await recipes.count({recipe_name: new RegExp(args.recipe_name, "i")});
    }
    if(args.sorting){
        if(args.sorting.recipe_name){
            args.sorting.recipe_name === 'asc' ? aggregateQuery.push({$sort: {recipe_name:-1}}) : aggregateQuery.push({$sort: {recipe_name:1}})
        }
        if(args.sorting.price){
            args.sorting.price === 'asc' ? aggregateQuery.push({$sort: {price:-1}}) : aggregateQuery.push({$sort: {price:1}})
        }
        if(args.sorting.sold){
            args.sorting.sold === 'asc' ? aggregateQuery.push({$sort: {sold:-1}}) : aggregateQuery.push({$sort: {sold:1}})
        }
    }
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
    }
    
    let result = await recipes.aggregate(aggregateQuery);
    result.forEach((el)=>{
                el.id = mongoose.Types.ObjectId(el._id)
            })
            const max_page = Math.ceil(count/args.limit) || 1
            if(max_page < args.page){
                throw new ApolloError('FooError', {
                    message: 'Page is Empty!'
                });
            }
    return {
    count: count,
    max_page: max_page,
    page: args.page,
    data: result
    };
}

async function createRecipe(parent,args,context,info){
    if(args.input.length == 0){
        throw new ApolloError('FooError', {
            message: "Ingredient cannot be empty!"
        })
    }
    if(!RegExp("^[0-9]").test(args.price)){
        throw new ApolloError('FooError', {
            message: "Price have to be INTEGER!"
        })
    }
    let checkIngredient = await ingredients.find()
    checkIngredient = checkIngredient.map((el) => el.id)
    let ingredientMap = args.input.map((el) => el.ingredient_id)
    ingredientMap.forEach((el) => {
        if(checkIngredient.indexOf(el) === -1){
            throw new ApolloError("FooError",{
                message: "Ingredient Not Found in Database!"
            })
        }
    })
    const recipe= {}
    recipe.description = args.description
    recipe.price = args.price
    recipe.img = args.img
    recipe.recipe_name = args.recipe_name
    recipe.ingredients = args.input
    recipe.isDiscount = args.isDiscount
    recipe.discountAmount = args.discountAmount
    recipe.highlight = args.highlight

    const newRecipe = await recipes.create(recipe)

    return newRecipe
}
async function updateRecipe(parent,args,context){
    if(args.price){
        if(!RegExp("^[0-9]").test(args.price)){
            throw new ApolloError('FooError', {
                message: "Price have to be INTEGER!"
            })
        }
    }   
    if(args.input){
        let checkIngredient = await ingredients.find()
    checkIngredient = checkIngredient.map((el) => el.id)
    let ingredientMap = args.input.map((el) => el.ingredient_id)
    ingredientMap.forEach((el) => {
        if(checkIngredient.indexOf(el) === -1){
            throw new ApolloError("FooError",{
                message: "Ingredient Not Found in Database!"
            })
        }
    })
    }
    
    const recipe = await recipes.findByIdAndUpdate(args.id,{
        recipe_name: args.recipe_name,
        description: args.description,
        price: args.price,
        img: args.img,
        status: args.status,
        ingredients: args.input,
        highlight: args.highlight
    },{
        new: true
    })
    if(args.status === "unpublished" || recipe.status === "unpublished"){
        await transactions.findOneAndUpdate(
            {"menu.recipe_id": mongoose.Types.ObjectId(args.id)}
            ,{
            $set: {
                recipeStatus: "unpublished"
            }
        },{new : true}
        )
        await transactions.findOne(
            {"menu.recipe_id": mongoose.Types.ObjectId(args.id)}
        )
    }

    if(args.status === "active" || recipe.status === "active"){
        await transactions.findOneAndUpdate(
            {"menu.recipe_id": mongoose.Types.ObjectId(args.id)}
            ,{
            $set: {
                recipeStatus: "active"
            }
        },{new : true}
        )
        await transactions.findOne(
            {"menu.recipe_id": mongoose.Types.ObjectId(args.id)}
        )
    }
    if(recipe){
        return recipe
        }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
        });
    }

async function deleteRecipe(parent,args,context){
    const deleteRecipe = await recipes.findByIdAndUpdate(args.id,{
        status: 'deleted'
    }, {
        new : true
    })
    if(deleteRecipe){
        return {deleteRecipe, message: 'Recipe Has been deleted!', data: deleteRecipe}
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
    });
}

async function getOneRecipe(parent,args,context){
    const getOne = await recipes.findById(args.id)
    if(!getOne){
        return new ApolloError("FooError",{
            message: "Wrong ID!"
        })
    }
    return getOne
}
async function getAvailable(parent, args, context, info) {
    const minStock = []
    for (let ingredient of parent.ingredients) {
        const recipe_ingredient = await ingredients.findById(ingredient.ingredient_id);
        if (!recipe_ingredient) throw new ApolloError(`Ingredient with ID: ${ingredient.ingredient_id} not found`, "404");
        minStock.push(Math.floor(recipe_ingredient.stock / ingredient.stock_used));
    }
    return Math.min(...minStock);
}
function getDiscountPrice(parent,args,context){
    let discountPrice = 0
    if(parent.isDiscount){
        discountPrice = parent.price - (parent.price * parent.discountAmount/100)
    }else(
        discountPrice = parent.price
    )
    return discountPrice
}

async function getIngredientLoader(parent, args, context){
    if (parent.ingredient_id){
        let check = await context.ingredientLoader.load(parent.ingredient_id)
        return check
    }
}


const resolverRecipe = {
    Query: {
        getOneRecipe,
        getActiveMenu,
        getAllRecipes
    },
    Mutation: {
        deleteRecipe,
        updateRecipe,
        createRecipe
    },
    ingredientId: {
        ingredient_id: getIngredientLoader
    },
    Recipe: {
        available: getAvailable,
        finalPrice: getDiscountPrice
    },

}
module.exports = resolverRecipe;