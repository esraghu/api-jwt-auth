const jwt = require("jsonwebtoken");

// policy helper function
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = "26-06-2018";
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    return authResponse;
}

module.exports.auth = (event, context, callback) => {
    // check header or url parameters or post parameters for token
    const token = event.authozationToken;
    
    if (!token) {
        return callback(null, 'Unauthorized');
    }
    
    // verifies secret and checks expiry
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return callback(null, 'Unauthorized');
        }
        
        return callback(null, generatePolicy(decoded.id, 'Allow', event.methodArn));
    });
};