import Order from '../Models/Order.js';
import BaseService from './BaseService.js';

class UserService extends BaseService {
    constructor() {
        super(Order); 
    }
}
export default new UserService();
