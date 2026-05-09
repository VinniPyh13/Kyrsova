import 'dotenv/config';
import jwt from 'jsonwebtoken'

class JwtCreator{
    createToken(data){
        return jwt.sign(data, process.env.JWT_SECRET_KEY, {expiresIn: '24h'});
    }

}

export default new JwtCreator();