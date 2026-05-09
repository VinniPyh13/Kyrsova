class BaseService {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        return await this.model.create(data);
    }

    async getAll() {
        return await this.model.find();
    }

    async getOne(id) {
        if (!id) {
            throw new Error("ID is empty");
        }
        const item = await this.model.findById(id);
        if (!item) {
            throw new Error("Item not found");
        }
        return item;
    }

    async update(id, data) {
        if (!id) {
            throw new Error("ID is empty");
        }
        const updatedItem = await this.model.findByIdAndUpdate(id, data, { new: true });
        if (!updatedItem) {
            throw new Error("Item not found");
        }
        return updatedItem;
    }

    async delete(id) {
        if (!id) {
            throw new Error("ID is empty");
        }
        const item = await this.model.findByIdAndDelete(id);
        if (!item) {
            throw new Error("Item not found");
        }
        return item;
    }
}

export default BaseService;
