import Post from '../Models/Post.js';
import BaseService from './BaseService.js';

class PostService extends BaseService {
    constructor() {
        super(Post); // Передаємо модель в базовий сервіс
    }

    // Тут можна дописати специфічні методи тільки для Post, якщо треба
}
export default new PostService();
