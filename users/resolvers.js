const mongoose = require('mongoose');
const {users} = require('../schema');
const { ApolloError} = require('apollo-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const userType = {
	"userType_permission" : [
		{
			"name" : "homepage",
			"view" : true
		},
		{
			"name" : "about",
			"view" : true
		},
		{
			"name" : "login",
			"view" : true
		},
		{
			"name" : "menu",
			"view" : true
		},
		{
			"name" : "cart",
			"view" : true
		},
		{
			"name" : "menuManagement",
			"view" : false
		},
		{
			"name" : "stockManagement",
			"view" : false
		}
	]
}
let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: "fahmiiireza@gmail.com",
        pass: "qdpsrevldqgntani"
    }
});
async function register(parent,{newUser}, context, info){

    if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newUser.email))throw new Error("Email not valid!")
    if(!new RegExp(`@gmail.com$`).test(newUser.email)){
        throw new ApolloError('FooError', {
            message: "Email has to have a domain of '@gmail.com'!"
        });
    }
    userCheck = await users.findOne({ email: newUser.email})
    if(userCheck){
        throw new ApolloError('FooError', {
            message: 'Email already exist!'
        });
    }

    newUser.password = await bcrypt.hash(newUser.password, 5)
    const registerUser = new users(newUser)
    registerUser.fullName = newUser.last_name + ', ' + newUser.first_name
    registerUser.userType = userType
    // newUser.security_question = args.security_question.toLowerCase()
    // newUser.security_answer = args.security_answer.toLowerCase()
    await registerUser.save()
    return registerUser;
}

async function reqTokenByEmail(parent,args,context){
    const findUser = await users.findOne({email: args.email})
    if(!findUser){
        throw new ApolloError('FooError', {
            message: 'Email has not been register!'
        });
    }
    let token = Math.floor(100000 + Math. random() * 900000).toString()
    let mailOptions = {
        from: '"Warmindo Bosque - One Time PIN" <' + process.env.EMAIL +'>', 
        to: args.email, 
        subject: "email confirmation PIN",  
        html: '<p>Copy and paste this PIN to the website</p> <div style= "width:fit-content;background-color: rgba(0,125,0,0.4);font-size:25px; font-weight:700;">'+token+"</div>"
    };  
    let info = await transporter.sendMail(mailOptions);
    token = await bcrypt.hash(token,5)

        await users.updateOne({email: args.email},{
            token: token,
        })

    return {messageSent : info}
}

async function getAllUsers(parent,{email,last_name,first_name,page,limit,sort}, context){
    let count = await users.count({status: 'active'});
    let aggregateQuery = [
        {$match: {
            status: 'active'
        }},
        {$sort: {fullName:1}}
    ]
    if (page){
        aggregateQuery.push({
            $skip: (page - 1)*limit
        },
        {$limit: limit})
        
    }
    if(email){
        aggregateQuery.push({
            $match: {email: email}
        },
        )
        // count = await recipes.count({recipe_name: new RegExp(recipe_name, "i")});
    }
    if(sort){
        sort.email ? sort.email === 'asc' ? aggregateQuery.push({$sort: {email:-1}}) : aggregateQuery.push({$sort: {email:1}}): null
        sort.first_name ? sort.first_name === 'asc' ? aggregateQuery.push({$sort: {first_name:-1}}) : aggregateQuery.push({$sort: {first_name:1}}) : null
        sort.last_name ? sort.last_name === 'asc' ? aggregateQuery.push({$sort: {last_name:-1}}) : aggregateQuery.push({$sort: {last_name:1}}) : null
    }
    if(last_name){
        aggregateQuery.push({
            $match: {last_name: new RegExp(last_name, "i") }
        },
        )
    }
    if(first_name){
        aggregateQuery.push({
            $match: {first_name:  new RegExp(first_name, "i") }
        },
        )
    }
            let result = await users.aggregate(aggregateQuery);
            count = result.length
            result.forEach((el)=>{
                        el.id = mongoose.Types.ObjectId(el._id)
                    })
                    
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
async function getOneUser(parent,args, context){
    if(context.req.payload){
        const getUser = await users.findById(context.req.payload)
        return getUser
    }else if(args.email){
        const getUser = await users.findOne({
            email: args.email
        })
        return getUser
    }else{
        return new ApolloError('FooError', {
            message: 'Put at least one parameter!'
          });
    }
}
async function logout(parent,args,context){
    const logout = await users.findOneAndUpdate({email:args.email}, {$set:{"isUsed": args.isUsed}},{
        new: true
    })
    if(logout){
        return logout
    }
    throw new ApolloError('FooError', {
        message: 'Wrong Email!'
      });
}
async function updateUser(parent, {updateUser},context){
    if(updateUser.password){
        throw new ApolloError('FooError', {
            message: 'Cannot change password from here'
        });
    }
    const checkUser = await users.findById(context.req.payload)
    if(updateUser.last_name && !updateUser.first_name){
        updateUser.fullName = updateUser.last_name + ', ' + checkUser.first_name
    }
    if(!updateUser.last_name && updateUser.first_name){
        updateUser.fullName = checkUser.last_name + ', ' + updateUser.first_name
    }
    if(updateUser.last_name && updateUser.first_name){
        updateUser.fullName = updateUser.last_name + ', ' + updateUser.first_name
    }
    if(updateUser.email){
        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(updateUser.email))throw new Error("Email not valid!")
        if(!new RegExp(`@gmail.com$`).test(updateUser.email)){
            throw new ApolloError('FooError', {
                message: "Email has to have a domain of '@gmail.com'!"
            });
        }
    }
    if(updateUser.img){
        if(updateUser.img.length < 7){
            throw new ApolloError('FooError', {
                message: 'Put appropriate image link!'
            });
        }
    }
    const updatedUser = await users.findByIdAndUpdate(context.req.payload,updateUser,{
        new: true
    })
    if(updatedUser){
        return updatedUser
    }
    throw new ApolloError('FooError', {
        message: 'Please insert something to update!'
      });
}
async function deleteUser(parent, args,context){
    const deleteUser = await users.findByIdAndUpdate(args.id,{
        status: 'deleted'
    }, {
        new : true
    })
    if(deleteUser){
        return {deleteUser, message: 'User Has been deleted!', data: deleteUser}
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
    
}
async function getToken(parent, args,context){
        if(!args.email){
            return new ApolloError('FooError', {
                message: 'Email Required !'
              });
        }
        if(!args.password){
            return new ApolloError('FooError', {
                message: 'Password Required !'
              });
        }
    const userCheck = await users.findOne({email: args.email})
    if(!userCheck){
        return new ApolloError('FooError', {
            message: 'Email Not Found !'
        });
    }
    if(userCheck.isUsed === true)return new ApolloError('FooError', {
        message: 'Your account has been used !'
    });
    if(userCheck.status === 'deleted'){
        throw new ApolloError('FooError', 
        {message: "Can't Login, User Status is Deleted!"
    })
    }
    const getPassword = await bcrypt.compare(args.password, userCheck.password )
    if(!getPassword){
        throw new ApolloError('FooError', 
        {message: "Wrong password!"
    })
    }
    await users.updateOne({
        email: args.email
    },{
        $set: {
            isUsed: true
        }
    })
    const token = jwt.sign({ email: args.email,},'zetta',{expiresIn: "6h"});
    return{message: token, user: { 
        email: userCheck.email, 
        fullName: userCheck.first_name + ' ' + userCheck.last_name, 
        first_name: userCheck.first_name, 
        last_name: userCheck.last_name,
        userType: userCheck.userType,
        role: userCheck.role,
        img: userCheck.img
    }}
}
async function changePassword(parent,args,context){
        const userCheck = await users.findById(context.req.payload)
    if(!userCheck){
        return new ApolloError('FooError', {
            message: 'User Not Found !'
          });
    }
    const getPassword = await bcrypt.compare(args.old_password, userCheck.password )
    if(!getPassword){
        throw new ApolloError('FooError', 
        {message: "Wrong password!"})
    }
    args.new_password = await bcrypt.hash(args.new_password, 5)
    const updatePass = await users.findOneAndUpdate({email:args.email},{
        $set:{
            password: args.new_password
        }
    },{
        new: true
    })
    return updatePass
}
async function forgotPassword(parent,args,context) {
    if(!args.email){
        throw new ApolloError('FooError', 
        {message: "Email required!"
        })
    }
    const checkUser = await users.findOne({email: args.email})
    if(!checkUser) throw new ApolloError('FooError',{message: "Email not found"})

    if(args.token){
        const checkToken = await bcrypt.compare(args.token, checkUser.token )
        if(!checkToken){
            throw new ApolloError('FooError', 
            {message: "PIN is Wrong, try again"
            })
        }
    }
    if(args.new_password){
        args.new_password = await bcrypt.hash(args.new_password, 5)
        await users.findOneAndUpdate({email:args.email},{
            $set:{
                password: args.new_password
            }
        },{
            new: true
        })
    }
    
    return checkUser
}


const resolverUser  = {
    Query: {
        getAllUsers,
        getOneUser,
    },
    Mutation: {
        reqTokenByEmail,
        register,
        updateUser,
        deleteUser,
        getToken,
        logout,
        forgotPassword,
        changePassword
    }
}
module.exports = resolverUser;