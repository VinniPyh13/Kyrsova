import BookService from '../Services/BookService.js';

class BookController {
    async createBook(req, res) {
        try {
            const book = await BookService.create(req.body);
            return res.status(201).json(book);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async getBook(req, res) {
        try {
            const book = await BookService.getOne(req.params.id);
            return res.json(book);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getBooks(req, res) {
        try {
            const books = await BookService.getAll();
            return res.json(books);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async updateBook(req, res) {
        try {
            const updatedBook = await BookService.update(req.params.id, req.body);
            return res.json(updatedBook);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async deleteBook(req, res) {
        try {
            await BookService.delete(req.params.id);
            return res.json({ message: 'Книга успішно видалена' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

export default new BookController();
