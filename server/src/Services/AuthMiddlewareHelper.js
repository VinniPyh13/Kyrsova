import 'dotenv/config';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

class AuthMiddlewareHelper{

    async authCheck(req, res, next){
        try{

            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: "Authorization token missing" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);    
            const user = await User.findOne({_id: decoded._id});

            if(!user){
                throw new Error('This user is unknown!');
            }
            if(user.token !== token){
                throw new Error('Token is fake!');
            }
            req.user = user;
            next();

        }
        catch(e){
            return res.status(400).json('Autorization failed!!');
        }
    }

    roleCheck(role){
        return function(req, res, next){
            try{
                const token = req.headers.authorization.split(' ')[1];
    
                const {roles: userRoles} = jwt.verify(token, process.env.JWT_SECRET_KEY);
                
                if(!userRoles.includes(role)){
                    return res.status(401).json('You haven`t this role!');
                }

                next();
            }
            catch(e){
                return res.status(403).json('You haven`t access to this function!');
            }
        }
    }

}

export default new AuthMiddlewareHelper();