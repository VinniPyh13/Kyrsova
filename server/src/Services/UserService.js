import User from '../Models/User.js';
import BaseService from './BaseService.js';

class UserService extends BaseService {
    constructor() {
        super(User); 
    }
}
export default new UserService();
