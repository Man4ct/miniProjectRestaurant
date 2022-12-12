const mongoose = require('mongoose');
const {recipes, specialOffers, users } = require('../schema');
const { ApolloError } = require('apollo-errors');
const { ifError } = require('assert');
const nodemailer = require('nodemailer');


// let transporter = nodemailer.createTransport({
//     service: 'gmail', 
//     auth: {
//         user: "fahmiiireza@gmail.com",
//         pass: "qdpsrevldqgntani"
//     }
// });
// async function sendPromoMail(subject,menu){
//     let user = await users.find()
//     user = user.map((el) => el.email)

//     let mailOptions = {
//         from: '"Warmindo Bosque - New Promo is here" <' + process.env.EMAIL +'>', 
//         to: user, 
//         subject: subject,  
//         html: '<p>Copy and paste this PIN to the website</p> <div style= "width:fit-content;background-color: rgba(0,125,0,0.4);font-size:25px; font-weight:700;">'+menu+"</div>"
//     }; 
//     return mailOptions
// }

async function createSpecialOffer(parent, { specialOffer }, context, info) {
    try {
        if (!specialOffer.menuDiscount || !specialOffer.menuDiscount.length) {
            throw new ApolloError('FooError', {
                message: "Menu cannot be empty!"
            })
        }
        
        const newSpecialOffer = {}
        newSpecialOffer.title = specialOffer.title.trim()
        if(newSpecialOffer.title === ""){
            throw new ApolloError('FooError', {
                message: "Title Required!"
            })
        }
        newSpecialOffer.description = specialOffer.description
        newSpecialOffer.menuDiscount = specialOffer.menuDiscount
        newSpecialOffer.status = specialOffer.status
        let checkMenu = await recipes.find()
        checkMenu = checkMenu.map((el) => el.id)
        let discount = specialOffer.menuDiscount.map((el) => el.discount)
        for(menu of specialOffer.menuDiscount){
            if(menu.discount < 0 || menu.discount > 100) {
                throw new ApolloError('FooError', {
                    message: "Discount is out of range!"
                })
            }
            
            console.log(menu.recipe_id)
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
            if(specialOffer.status === 'unpublished') {
                await recipes.findByIdAndUpdate(menu.recipe_id,{
                    isDiscount: false,
                    discountAmount: menu.discount
                },{new:true})
            }
            if(specialOffer.status === 'active'){
                await recipes.findByIdAndUpdate(menu.recipe_id,{
                    isDiscount: true,
                    discountAmount: menu.discount
                },{new:true})
            }
        }
        newSpecialOffer.specialOfferDiscount = Math.max(...discount)

        const createSpecialOffer = await specialOffers.create(newSpecialOffer)
        // let mail = sendPromoMail(specialOffer.title,)
        // await transporter.sendMail(mail);
        return createSpecialOffer
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
    if(args.status){
        aggregateQuery.push({
            $match: { status: args.status}
        })
        count = await specialOffers.count({ status: args.status });
    }
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

async function updateSpecialOffer(parent,{specialOffer, id},context){
    if(specialOffer.menuDiscount){
        let checkMenu = await recipes.find()
        checkMenu = checkMenu.map((el) => el.id)
        let discount = specialOffer.menuDiscount.map((el) => el.discount)
            for(menu of specialOffer.menuDiscount){
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
                if(specialOffer.status === 'deleted') {
                    await specialOffers.findByIdAndUpdate(id,{
                        specialOfferDiscount : 0
                    },{
                        new: true
                    })
                    await recipes.findByIdAndUpdate(menu.recipe_id,{
                        isDiscount: false,
                        discountAmount: 0
                    },{new:true})
                }else{
                    await specialOffers.findByIdAndUpdate(id,{
                        specialOfferDiscount : Math.max(...discount)
                    },{
                        new: true
                    })
                }
                if(specialOffer.status === 'unpublished') {
                    await recipes.findByIdAndUpdate(menu.recipe_id,{
                        isDiscount: false,
                        discountAmount: menu.discount
                    },{new:true})
                }
                if(specialOffer.status === 'active'){
                    await recipes.findByIdAndUpdate(menu.recipe_id,{
                        isDiscount: true,
                        discountAmount: menu.discount
                    },{new:true})
                }
            }
        }
    const updateSpecialOffer = await specialOffers.findByIdAndUpdate(id,specialOffer,{
        new: true
    })
    if(!updateSpecialOffer){
        throw new ApolloError('FooError', {
            message: 'Wrong ID!'
            });
    }
    return updateSpecialOffer
    
    
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