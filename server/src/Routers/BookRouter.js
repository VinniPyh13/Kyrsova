import express from 'express';
import BookController from '../Controllers/bookController.js';

const bookRouter = express.Router();

bookRouter.get('/', BookController.getBooks);
bookRouter.get('/:id', BookController.getBook);
bookRouter.post('/', BookController.createBook);
bookRouter.put('/:id', BookController.updateBook);
bookRouter.delete('/:id', BookController.deleteBook);

export default bookRouter;
