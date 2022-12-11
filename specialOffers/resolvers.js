const mongoose = require('mongoose');
const {recipes, specialOffers } = require('../schema');
const { ApolloError } = require('apollo-errors');
async function createSpecialOffer(parent, { title, description, menuDiscount, status }, context, info) {
    try {
        if (!menuDiscount || !menuDiscount.length) {
            throw new ApolloError('FooError', {
                message: "Menu cannot be empty!"
            })
        }
        
        const specialOffer = {}
        specialOffer.title = title.trim()
        if(specialOffer.title === ""){
            throw new ApolloError('FooError', {
                message: "Title Required!"
            })
        }
        specialOffer.description = description
        specialOffer.menuDiscount = menuDiscount
        specialOffer.status = status
        let checkMenu = await recipes.find()
        checkMenu = checkMenu.map((el) => el.id)
        let discount = menuDiscount.map((el) => el.discount)
        for(menu of menuDiscount){
            if(menu.discount < 0 || menu.discount > 100) {
                throw new ApolloError('FooError', {
                    message: "Discount is out of range!"
                })
            }
            if (checkMenu.indexOf(menu.recipe_id) === -1) {
                throw new ApolloError("FooError", {
                    message: "Menu Not Found in Database!"
                })
            }
            const findMenu = await recipes.findById(menu.recipe_id)
            if(findMenu.status === 'unpublished' || findMenu.status === 'deleted') {
                throw new ApolloError("FooError",{
                    message: "Menu You Insert is Unpublished!"
                })
            }
            if(findMenu.isDiscount === true){
                throw new ApolloError("FooError",{
                    message: "Menu You Insert is already in Discount!"
                })
            }
            if(status === 'unpublished') {
                await recipes.findByIdAndUpdate(menu.recipe_id,{
                    isDiscount: false,
                    discountAmount: menu.discount
                },{new:true})
            }
            if(status === 'active'){
                await recipes.findByIdAndUpdate(menu.recipe_id,{
                    isDiscount: true,
                    discountAmount: menu.discount
                },{new:true})
            }
        }
        specialOffer.specialOfferDiscount = Math.max(...discount)

        const newSpecialOffer = await specialOffers.create(specialOffer)
        return newSpecialOffer
    }
    catch (err) {
        throw new ApolloError('FooError', err)
    }
}
async function getAllSpecialOffers(parent, args, context) {
    let count = await specialOffers.count({ status: { $ne: 'deleted' } });
    let aggregateQuery = [
        {
            $match: {
                status: { $ne: 'deleted' },
            }
        },
        { $sort: { specialOfferDiscount: -1 } }
    ]
    if (args.title) {
        aggregateQuery.push({
            $match: { title: new RegExp(args.title, "i") }
        })
        count = await specialOffers.count({ title: new RegExp(args.title, "i") });
    }
    if (args.page) {
        aggregateQuery.push({
            $skip: (args.page - 1) * args.limit
        },
            { $limit: args.limit })
    }
    let result = await specialOffers.aggregate(aggregateQuery);
    result.forEach((el) => {
        el.id = mongoose.Types.ObjectId(el._id)
    })

    const max_page = Math.ceil(count / args.limit) || 1
    if (max_page < args.page) {
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
async function getOneSpecialOffer(parent,args,context){
    const getOne = await specialOffers.findById(args.id)
    if(!getOne){
        return new ApolloError("FooError",{
            message: "Wrong ID!"
        })
    }
    return getOne
}

async function updateSpecialOffer(parent,args,context){
    const specialOffer = await specialOffers.findByIdAndUpdate(args.id,{
        title: args.title,
        description: args.description,
        menuDiscount: args.menuDiscount,
        status: args.status
    },{
        new: true
    })
    if(!specialOffer){
        throw new ApolloError('FooError', {
            message: 'Wrong ID!'
            });
    }
    let checkMenu = await recipes.find()
        checkMenu = checkMenu.map((el) => el.id)

    if(args.menuDiscount){
    let discount = args.menuDiscount.map((el) => el.discount)
        for(menu of args.menuDiscount){
            if(menu.recipe_id){
            if (checkMenu.indexOf(menu.recipe_id) === -1) {
                throw new ApolloError("FooError", {
                    message: "Menu Not Found in Database!"
                })
            }
            if(menu.discount){

                if(menu.discount < 0 || menu.discount > 100) {
                    throw new ApolloError('FooError', {
                        message: "Discount is out of range!"
                    })
                }
            }
            const findMenu = await recipes.findById(menu.recipe_id)
            if(findMenu.status === 'unpublished' || findMenu.status === 'deleted') {
                throw new ApolloError("FooError",{
                    message: "Menu You Insert is Unpublished!"
                })
            }
        }
            if(args.status === 'deleted') {
                await specialOffers.findByIdAndUpdate(args.id,{
                    specialOfferDiscount : 0
                },{
                    new: true
                })
                await recipes.findByIdAndUpdate(menu.recipe_id,{
                    isDiscount: false,
                    discountAmount: 0
                },{new:true})
            }else{
                await specialOffers.findByIdAndUpdate(args.id,{
                    specialOfferDiscount : Math.max(...discount)
                },{
                    new: true
                })
            }
            if(args.status === 'unpublished') {
                await recipes.findByIdAndUpdate(menu.recipe_id,{
                    isDiscount: false,
                    discountAmount: menu.discount
                },{new:true})
            }
            if(args.status === 'active'){
                await recipes.findByIdAndUpdate(menu.recipe_id,{
                    isDiscount: true,
                    discountAmount: menu.discount
                },{new:true})
            }
        }
    }
    if(specialOffer){
        return specialOffer
        }
    
    }
const resolverSpecialOffer = {
    Query: {
        getAllSpecialOffers,
        getOneSpecialOffer
    },
    Mutation: {
        createSpecialOffer,
        updateSpecialOffer
    },
}
module.exports = resolverSpecialOffer