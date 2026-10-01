import jwt from 'jsonwebtoken';

let verifyToken = (req,res,next)=>{
    try{
        let token = req.headers.authorization.split(' ')[1];
        let decoded = jwt.verify(token,"54321");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

let generateToken = (user)=>{
    let token = jwt.sign(user,'54321');
    return token;
}

export {verifyToken,generateToken};