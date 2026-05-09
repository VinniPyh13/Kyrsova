import ReviewService from '../Services/ReviewService.js';

class ReviewController {
    async getReviews(req, res) {
        try {
            const reviews = await ReviewService.getAll();
            return res.json(reviews);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getReview(req, res) {
        try {
            const { reviewID } = req.params;
            if (!reviewID) {
                return res.status(400).json({ message: 'Review ID is required' });
            }
            const review = await ReviewService.getOne(reviewID);
            return res.json(review);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    async createReview(req, res) {
        try {
            const { userId, bookId, comment } = req.body;
            if (!userId || !bookId || !comment) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const newReview = await ReviewService.create(req.body);

            
            return res.status(201).json(newReview);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async updateReview(req, res) {
        try {
            const { reviewID } = req.params;
            const { userId } = req.body;  // Assuming the user's ID is sent with the request body for validation
            
            if (!reviewID || !userId) {
                return res.status(400).json({ message: 'Review ID and User ID are required' });
            }

            // Перевірка, чи користувач є власником відгуку
            const review = await ReviewService.getOne(reviewID);
            if (review.userId.toString() !== userId) {
                return res.status(403).json({ message: 'You are not the owner of this review' });
            }

            const updatedReview = await ReviewService.update(reviewID, req.body);
            return res.json(updatedReview);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async deleteReview(req, res) {
        try {
            const { reviewID } = req.params;
            const { userId } = req.body;  // Assuming the user's ID is sent with the request body for validation
            
            if (!reviewID || !userId) {
                return res.status(400).json({ message: 'Review ID and User ID are required' });
            }

            // Перевірка, чи користувач є власником відгуку
            const review = await ReviewService.getOne(reviewID);
            if (review.userId.toString() !== userId) {
                return res.status(403).json({ message: 'You are not the owner of this review' });
            }

            await ReviewService.delete(reviewID);
            return res.json({ message: 'Review deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    async deleteReviewByAdmin(req, res) {
        try {
            const { reviewID } = req.params;

            if (!reviewID) {
            return res.status(400).json({ message: 'Review ID is required' });
            }

            const review = await ReviewService.getOne(reviewID);
            if (!review) {
            return res.status(404).json({ message: 'Review not found' });
            }

            await ReviewService.delete(reviewID);
            return res.json({ message: 'Review deleted by admin successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

 /*   async getReviews(req, res) {
        try {
            const reviews = await ReviewService.getAll();
            return res.json(reviews);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getReview(req, res) {
        try {
            const review = await ReviewService.getOne(req.params.reviewID);
            return res.json(review);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    async createReview(req, res) {
        try {
            // Перевірка наявності необхідних полів
            const { userId, book, content } = req.body;
            if (!userId || !book || !content) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const newReview = await ReviewService.create(req.body);
            return res.status(201).json(newReview);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async updateReview(req, res) {
        try {
            const updatedReview = await ReviewService.update(req.params.reviewID, req.body);
            return res.json(updatedReview);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async deleteReview(req, res) {
        try {
            await ReviewService.delete(req.params.reviewID);
            return res.json({ message: 'Review deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }*/
}

export default new ReviewController();
