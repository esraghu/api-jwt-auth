const connectToDatabase = require("../db");
const User = require("../user/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs-then");

// functions
module.exports.register = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return connectToDatabase()
        .then(() =>
            register(JSON.parse(event.body))
        )
        .then(session => ({
            statusCode: 200,
            body: JSON.stringify(session)
        }))
        .catch(err => ({
            statusCode: 500,
            header: {"Content-Type": "text/plain"},
            body: err.message
        }));
};

module.exports.login = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return connectToDatabase()
        .then(() =>
            login(JSON.parse(event.body))
        )
        .then(session => ({
            statusCode: 200,
            body: JSON.stringify(session)
        }))
        .catch(err => ({
            statusCode: 500,
            header: {"Content-Type": "text/plain"},
            body: 
            { 
                stack: err.stack, 
                message: err.message 
            }
        }));
};

// helpers
function signToken(id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {expiresIn: 86400});
}

function checkIfInputIsValid(eventBody) {
    
    if ( !(eventBody.password) || (eventBody.password.length <8) ) {
        return Promise.reject(new Error("Password Error! Password must be longer than 8 characters"));
    }
    
    if ( !( eventBody.name &&
            eventBody.name.length > 5 &&
            typeof eventBody.name === 'string' 
            ) 
        ) {
            return Promise.reject(new Error("Username error! Username must be longer than 5 characters and no special characters allowed"));
        }
    
    if ( !( eventBody.email &&
            typeof eventBody.email === 'string' 
            ) 
        ) {
            return Promise.reject(new Error("Email ID error!"));
        }
        
    return Promise.resolve();
}

function register(eventBody) {
    return checkIfInputIsValid(eventBody)
        .then(() => User.findOne( {email: eventBody.email} ) )
        .then(user =>
            user
                ? Promise.reject(new Error('User with that email exists!'))
                : bcrypt.hash(eventBody.password, eventBody.password.length)
        )
        .then(hash => 
            User.create({
                name: eventBody.name,
                email: eventBody.email,
                password: hash
            })
        )
        .then(user => ({ 
            auth: true,
            token: signToken(user._id)
        }));
}

function comparePassword(eventPassword, userPassword, userId) {
    return bcrypt.compare(eventPassword, userPassword)
        .then(passwordIsValid => 
            !passwordIsValid
                ? Promise.reject(new Error("Invalid Username or Password"))
                : signToken(userId)
        );
}

function login(eventBody) {
    return User.findOne({ email: eventBody.email })
        .then(user =>
            !user
                ? Promise.reject(new Error("User with that email id not found, please register"))
                : comparePassword(eventBody.password, user.password, user._id)
        )
        .then(token => ({ auth: true, token: token }));
}