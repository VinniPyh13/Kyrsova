import Order from '../Models/Order.js';
import BaseService from './BaseService.js';

class OrderService extends BaseService {
    constructor() {
        super(Order); 
    }
}
export default new OrderService();
