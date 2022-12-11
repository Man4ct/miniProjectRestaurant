const mongoose = require('mongoose');
const {users,transactions,recipes,ingredients} = require('../schema');
const { ApolloError} = require('apollo-errors');
const moment = require('moment');
async function getAllTransactions(parent,{page, limit, last_name_user,time_start,time_end ,recipe_name,order_status,filterDate, order_date,order_date_start,order_date_end, fullName_user,isCart,sort,userFind},context,info) {
    let count = null
    let isUser = await users.findById(context.req.payload)
    let aggregateQuery = []
    if(sort){
        sort.updatedAt === 'asc' ? aggregateQuery.push({$sort: {updatedAt:-1}}) : aggregateQuery.push({$sort: {updatedAt:1}})
    }
    if(isCart === true){
        aggregateQuery.push(
            {$match: {
                order_status: "pending",
                status: 'active',
                user_id: mongoose.Types.ObjectId(context.req.payload)
            }},
            {$sort: {_id:-1}}
        )
        // count = await transactions.count({status: 'active',order_status:"pending" ,user_id: mongoose.Types.ObjectId(context.req.payload)});
    }
    if(isCart === false){
        aggregateQuery.push(
            {$match: {
                order_status:"success",
                status: 'active',
            }},
            {$sort: {updatedAt:-1}}
        )
        // count = await transactions.count({status: 'active',order_status:"success" });
    }
    if(recipe_name){
        aggregateQuery.push({
                $lookup:
                {
                  from: "recipes",
                  localField: "menu.recipe_id",
                  foreignField: "_id",
                  as: "recipes"
                }
        },
        {
            $match: {"recipes.recipe_name" : new RegExp(recipe_name, "i")}
        }
        )
        // const findRecipes =await recipes.findOne({recipe_name:recipe_name})
        // count = await transactions.count({"menu.recipe_id": findRecipes._id})
    }
    if(order_date){
        aggregateQuery.push(
        {
            $match: {"order_date" :new RegExp( order_date, "i")}
            
        }
        )
        // count = await transactions.count({status: 'active',order_date : new RegExp(order_date, "i")})
    }

    if(isUser.role === 'user'){
        aggregateQuery.push({
            $match: {
                user_id: mongoose.Types.ObjectId(context.req.payload)
            }
        })
        // count = await transactions.count({status: 'active',order_status:"success",user_id: mongoose.Types.ObjectId(context.req.payload)});
        if(userFind || last_name_user){
            throw new ApolloError('FooError', {
                message: 'Not Authorized!'
            });
        }
    }
    if(isUser.role === 'admin'){
        if(userFind){
            aggregateQuery.push({
                $match: {
                    user_id: mongoose.Types.ObjectId(userFind)
                }
            })
            // count = await transactions.count({status: 'active' ,user_id: mongoose.Types.ObjectId(userFind)});
        }
    if(last_name_user){
        await users.findOne({last_name:last_name_user})
        aggregateQuery.push({
                $lookup:
                {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "users"
                },
        },
        {$match: {"users.last_name" :new RegExp(last_name_user, "i")}}
        )
        // count = await transactions.count({order_status:"success",status: 'active',user_id: last_name._id})
    }
    if(fullName_user){
        await users.findOne({fullName:fullName_user})
        aggregateQuery.push({
                $lookup:{
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "users"
                },
        },{
            $match: {"users.fullName" :new RegExp(fullName_user, "i")}
        }
        )
        // count = await transactions.count({order_status:"success",status: 'active',user_id: userFullName._id})
    }
    if(order_date_start && order_date_end){
        if(time_start && time_end){
            if(order_date_start === order_date_end){
                aggregateQuery.push(
                    {
                        $match: {"updatedAt" :{
                            $gte:new Date(`${order_date_start}T${time_start}`)
                        
                    }}
                    
                    }
                    )
                    // count = await transactions.count({status: 'active' ,"updatedAt" : {
                    //     $gte:new Date(`${order_date_start}T${time_start}`)
                    // }})
            }else{
                aggregateQuery.push(
                    {
                        $match: {"updatedAt" :{
                            $gte:new Date(`${order_date_start}T${time_start}`),
                            $lte: new Date(`${order_date_end}T${time_end}`)
                        
                    }}
                    }
                    )
                    // count = await transactions.count({status: 'active' ,"updatedAt" : {
                    //     $gte:new Date(`${order_date_start}T${time_start}`),
                    //     $lte: new Date(`${order_date_end}T${time_end}`)
                    // }})
            }
        }
            if(order_date_start === order_date_end){
                aggregateQuery.push(
                    {
                        $match: {"updatedAt" :{
                            $gte:new Date(order_date_start)
                        
                    }}
                    
                    }
                    )
                    // count = await transactions.count({status: 'active' ,"updatedAt" : {
                    //     $gte:new Date(order_date_start)
                    // }})
            }else{
                aggregateQuery.push(
                    {
                        $match: {"updatedAt" :{
                            $gte:new Date(order_date_start),
                            $lte: new Date(order_date_end)
                        
                    }}
                    }
                    )
                    // count = await transactions.count({status: 'active' ,"updatedAt" : {
                    //     $gte:new Date(order_date_start), $lte: new Date(order_date_end)
                    // }})
            }
        // if(order_date_start === order_date_end){
        //     aggregateQuery.push(
        //         {
        //             $match: {"updatedAt" :{$eq: new Date(order_date_start)
        //         }}
        //         })
        // }else{

        // }
    }
    
    if(order_date_start && !order_date_end){
        if(time_start && !time_end){
        aggregateQuery.push(
            {
                $match: {"updatedAt" :{
                    $gte:new Date(`${order_date_start}T${time_start}`)
                
            }}
            }
            )
            // count = await transactions.count({status: 'active' ,"updatedAt" : {
            //     $gte:new Date(`${order_date_start}T${time_start}`)
            // }})
        }
        aggregateQuery.push(
            {
                $match: {"updatedAt" :{
                    $gte:new Date(order_date_start)
                
            }}
            }
            )
            // count = await transactions.count({status: 'active' ,"updatedAt" : {
            //     $gte:new Date(order_date_start)
            // }})
    }
    if(order_date_end && !order_date_start){
        if(time_end && !time_start){
        aggregateQuery.push(
            {
                $match: {"updatedAt" :{
                    $lte:new Date(`${order_date_end}T${time_end}`)
                
            }}
            }
            )
            // count = await transactions.count({status: 'active' ,"updatedAt" : {
            //     $lte:new Date(`${order_date_end}T${time_end}`)
            // }})
        }
        aggregateQuery.push(
            {
                $match: {"updatedAt" :{
                    $lte:new Date(order_date_end)
                
            }}
            }
            )
            // count = await transactions.count({status: 'active' ,"updatedAt" : {
            //     $lte:new Date(order_date_end)
            // }})
    }
    }
    if(filterDate){
        if(filterDate.option === 'last7Days'){
            const last7Days = moment().subtract(7, 'days')

            aggregateQuery.push(
                {
                    $addFields: {
                        date: {
                            $dateFromString: {
                            dateString: '$order_date',
                            }
                        }
                    }
                },{
                    $match: {date :{
                        $gte:new Date(last7Days)
                            }       
                    }
                }
                )
                // count = await transactions.count({status: 'active' ,"order_date" : {
                //     $gte:last7Days
                // }})
        }
        if(filterDate.option === 'yesterday'){
            const yesterday = moment().subtract(1, 'days');
            aggregateQuery.push(
                {
                    $addFields: {
                        date: {
                            $dateFromString: {
                            dateString: '$order_date',
                            }
                        }
                    }
                },
                {
                    $match: {date :{
                        $gte:new Date(yesterday)
                }}
                }
                )
                // count = await transactions.count({status: 'active' ,"order_date" : {
                //     $gte:yesterday
                // }})
        }
    }
   
    
    if (page){
        aggregateQuery.push({
            $skip: (page - 1)*limit
        },
        {$limit: limit})
    }
     let result = await transactions.aggregate(aggregateQuery);
                count = result.length
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el._id)
                        })
                        // if(!page){
                        //     count = result.length
                        // }
                        const max_page = Math.ceil(count/limit) || 1
                        if(max_page < page){
                            throw new ApolloError('FooError', {
                                message: 'Page is Empty!'
                            });
                        }
                return {
                count: count,
                max_page: max_page,
                page: page,
                data: result
                };
}
async function getOneTransaction(parent,args,context){
    const getOne = await transactions.findById(args.id)
    if(!getOne){
        return new ApolloError("FooError",{
            message: "Wrong ID!"
        })
    }
    return getOne
}
async function getUserLoader(parent,args,context){
    if (parent.user_id){
        let check = await context.userLoader.load(parent.user_id)
        return check
    }
}
async function getRecipeLoader(parent,args,context){
    if (parent.recipe_id){
        let check = await context.recipeLoader.load(parent.recipe_id)
        return check
    }
}

async function reduceIngredientStock(arrIngredient){
    for(let ingredient of arrIngredient){
        await ingredients.findByIdAndUpdate(ingredient.ingredient_id,{
            stock: ingredient.stock
        },{
            new: true
        })
    }
}
async function validateOrder(user_id, menus,checkout){
try{
    let menuTransaction = new transactions({menu : menus })
    menuTransaction = await transactions.populate(menuTransaction, {
        path: 'menu.recipe_id',
        populate: {
            path : "ingredients.ingredient_id"
        }
    })
    if(!menuTransaction.menu || menuTransaction.menu.length === 0) {
        throw new ApolloError("FooError",{
            message: "Cart is Empty"
        })
    }
    const userCheck = await users.findById(user_id) 
    let available = 0
    let price = 0
    let totalPrice = 0
    let recipeStatus = null
    let message = [] 
    const stockIngredient = {};  
    const ingredientMap = []
    for ( let menu of menuTransaction.menu){
        if(menu.recipe_id.status === 'unpublished'){
            throw new ApolloError("FooError",{
                message: "Menu Cannot be ordered as it is Unpublished!"
            })
        }
        recipeStatus = menu.recipe_id.status
        available = menu.recipe_id.available
        if(menu.recipe_id.isDiscount === false){
            menu.recipe_id.discountAmount = 0
        }
        price = menu.recipe_id.price - (menu.recipe_id.price * menu.recipe_id.discountAmount/100)
        let sold = menu.recipe_id.sold
        const amount = menu.amount
        if(amount <= 0){
            throw new ApolloError('FooError',{
                message: 'Csnnot order if amount 0 or less'})
        }
        for( let ingredient of menu.recipe_id.ingredients){
                const ingredientRecipe = {ingredient_id: ingredient.ingredient_id._id,
                    stock: ingredient.ingredient_id.stock - (ingredient.stock_used * amount)}
                    if (ingredientRecipe.ingredient_id in stockIngredient) { } 
                    else { stockIngredient[ingredientRecipe.ingredient_id] = ingredient.ingredient_id.stock; }
                    
                if(checkout === true){ 
                    
                    if(stockIngredient[ingredientRecipe.ingredient_id] < (ingredient.stock_used * amount)){ 
                        message.push(menu.recipe_id.recipe_name) 
                    }
                    if(message.length === 0){ 
                       
                        await recipes.findByIdAndUpdate(menu.recipe_id._id,{
                            $set: {
                                sold: sold + menu.amount
                            },
                        },{new: true})
                    }
                }else{
                    if(ingredient.ingredient_id.stock < ingredient.stock_used * amount){
                        throw new ApolloError('FooError',{
                            message: 'stock ingredient not enough'
                        })
                    }
                }
            stockIngredient[ingredientRecipe.ingredient_id] -= (ingredient.stock_used * amount);
                ingredientMap.push({
                    ingredient_id: ingredient.ingredient_id._id,
                    stock: stockIngredient[ingredientRecipe.ingredient_id],
                })
        }
        totalPrice += price * amount;
    }
    

    if(message.length > 0 ){ 
         throw new ApolloError('FooError',{
                            message: `${message} has sufficient stock ingredient`
                        })
    }
    if(checkout === true){
        if (userCheck.balance < totalPrice){
            throw new ApolloError("FooError",{
                message: "It appears your balance is not enough for this transaction, Please Top Up!"
            })
        }
        await users.findByIdAndUpdate(user_id,{
            $set:{
                balance: userCheck.balance - totalPrice
            }
        })
    }

    // return true
    // ingredientMap.forEach((el) => {
    //     if(el.stock < 0){
    //         throw new ApolloError('FooError',{
    //             message: 'stock ingredient not enough'
    //         })
    //     }
    // })
    return new transactions({user_id: user_id, menu: menus,order_status: "pending",recipeStatus: recipeStatus,totalPrice: totalPrice,onePrice:price,available:available,order_date:moment(new Date()).format("LLL") ,ingredientMap: ingredientMap})
    }
    catch(err){
        throw new ApolloError('FooError',err)
    }
}

async function createTransaction(parent,args,context){
    const tick = Date.now()
    if(args.input.length == 0){
        throw new ApolloError('FooError', {
            message: "Input cannot be empty!"
        })
    }
    
    const transaction = {}
    transaction.user_id = context.req.payload
    transaction.menu = args.input
    const newTransaction = await validateOrder(context.req.payload, args.input,false)
    await newTransaction.save()
    console.log(`Total Time Create Transaction: ${Date.now()- tick} ms`)
    return newTransaction
}

async function checkoutTransaction(parent,args,context){
    const transaction = await transactions.find({
        status: 'active',
        order_status: 'pending',
        user_id: context.req.payload
    })
    let recipeStatus = null
    order_status = null
    let menu = []
    let newTransaction = null
    transaction.forEach((el) => {
        if(el.recipeStatus === "unpublished"){
            recipeStatus = el.recipeStatus
        }
        el.menu.forEach((menus) => {
            menu.push(menus)
        })
    })
    if(recipeStatus === "unpublished"){
        throw new ApolloError("FooError",{
            message: `Menu:
            Cannot be ordered as it is Unpublished!`
        })
    }
    newTransaction = await validateOrder(context.req.payload, menu,true)
    reduceIngredientStock(newTransaction.ingredientMap)
    transaction.forEach(async(el) => {
        el.order_status= 'success'
    })
    await transactions.create(transaction)
    return transaction
}
async function updateTransaction(parent,args,context){
    let amount = 0
    let recipeId = ""
    let note = ""
    let transaction = null
    if(args.id){
        transaction = await transactions.findById(args.id)
        transaction.menu.forEach((el) => {
            amount = el.amount
            recipeId = el.recipe_id
            note = el.note
        })
    }

    if(args.note === ""){
        transaction.menu.forEach((el) => {
            note = ""
            return( el.note= note)
        })
        await transaction.save()
    return transaction
    }
    if(args.note){
        transaction.menu.forEach((el) => {
        note = args.note
        return( el.note= note)
    })
    await transaction.save()
    return transaction
}
    if(args.amount){
        if(args.amount <= 0){
            throw new ApolloError('FooError',{
                message: 'Csnnot order if amount 0 or less'})
        }
        const updateTransaction = await transactions.findOneAndUpdate(
            {_id: args.id,},
            {$set: {  
                "totalPrice": (transaction.onePrice * args.amount),                  
                "menu":{
                    "amount": args.amount,
                    "recipe_id": recipeId,
                    "note": note
                },
            },
        },
        {new : true}
            )
const data = await transactions.findById(args.id)
        data.menu.forEach((amount) => {
            if(amount > data.available){
                throw new ApolloError('FooError',{
                    message: 'Insufficient Stock'})
            }
        })
if(updateTransaction)return data
    }
    if(args.option === 'emptyCart'){
        const deleteTransaction = await transactions.updateMany({
            user_id: mongoose.Types.ObjectId(context.req.payload),
            order_status: "pending"
        },{
            $set:{
                status: 'deleted'
            }
        },{new : true})
        return deleteTransaction
    }
    if(args.option === 'delete'){
        const updateTransaction = await transactions.findByIdAndUpdate(args.id,{
            status: 'deleted'
        }, {
            new : true
        })
        const data = await transactions.findById(args.id)
        if(updateTransaction)return data    }
    if(args.option === 'push'){
        const updateTransaction = await transactions.findOneAndUpdate(
                {_id: args.id,},
                {$set: {  
                    "totalPrice": transaction.totalPrice + transaction.onePrice,                  
                    "menu":{
                        "amount": amount + 1,
                        "recipe_id": recipeId,
                        "note": note
                    },
                },
            },
            {new : true}
                )
const data = await transactions.findById(args.id)
            data.menu.forEach((amount) => {
                if(amount > data.available){
                    throw new ApolloError('FooError',{
                        message: 'Insufficient Stock'})
                }
            })
    if(updateTransaction)return data
    }

    if(args.option === 'pull'){
        const updateTransaction = await transactions.findOneAndUpdate(
                {_id: args.id},
                {$set: {
                    "totalPrice": transaction.totalPrice - transaction.onePrice,                  
                    "menu":{
                        "amount": amount - 1,
                        "recipe_id": recipeId,
                        "note": note
                    }
                }
            },{new : true}
                )
            const data = await transactions.findById(args.id)
            if(updateTransaction)return data
            }
    
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
    });
}

async function availableLoader(parent, args, context, info) {
    const minStock = []
    for(let recipe of parent.menu){
        const recipeId = await recipes.findById(recipe.recipe_id)
         for (let ingredient of recipeId.ingredients) {
        const recipe_ingredient = await ingredients.findById(ingredient.ingredient_id);
        if (!recipe_ingredient) throw new ApolloError(`Ingredient with ID: ${ingredient.ingredient_id} not found`, "404");
        minStock.push(Math.floor(recipe_ingredient.stock / ingredient.stock_used));
    }
    return Math.min(...minStock);
        
    }
   
}

const resolverTransaction = {
    Mutation : {
        createTransaction,
        updateTransaction,
        checkoutTransaction
        
    },
    Query : {
        getOneTransaction,
        getAllTransactions
    },
    Transaction: {
        user_id : getUserLoader,
        available: availableLoader
    },
    Menu: {
        recipe_id: getRecipeLoader
    },
    menuDiscount: {
        recipe_id: getRecipeLoader
    }

}
module.exports = resolverTransaction