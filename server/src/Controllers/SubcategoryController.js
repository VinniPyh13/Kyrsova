import Subcategory from '../Models/Subcategory.js';
import Category from '../Models/Category.js';

export const createSubcategory = async (req, res) => {
    try {
      const { name, categoryId } = req.body;
  
      if (!name || !categoryId) {
        return res.status(400).json({ 
          message: 'Ім\'я та категорія обов\'язкові'
        });
      }
  
      // Create new subcategory
      const newSubcategory = await Subcategory.create({ 
        name, 
        categoryId // Now accepts UUID string
      });
  
      // Update category (assuming your Category model also uses String for subcategories)
      await Category.findOneAndUpdate(
        { _id: categoryId },
        { $push: { subcategories: newSubcategory._id } },
        { new: true }
      );
  
      res.status(201).json({
        message: 'Субкатегорія створена успішно',
        subcategory: newSubcategory
      });
  
    } catch (err) {
      res.status(500).json({ 
        message: 'Помилка сервера',
        error: err.message 
      });
    }
  };

export const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find();
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId).populate('subcategories');
    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    res.json(category.subcategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// updateSubcategory
export const updateSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({ message: 'Підкатегорію не знайдено' });
    }

    // Якщо categoryId змінилось — оновлюємо зв’язок
    if (categoryId && subcategory.categoryId !== categoryId) {
      await Category.findByIdAndUpdate(subcategory.categoryId, {
        $pull: { subcategories: subcategory._id }
      });
      await Category.findByIdAndUpdate(categoryId, {
        $addToSet: { subcategories: subcategory._id }
      });
    }

    subcategory.name = name || subcategory.name;
    subcategory.categoryId = categoryId || subcategory.categoryId;
    const updated = await subcategory.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Помилка оновлення підкатегорії', error: err.message });
  }
};


export const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Підкатегорію не знайдено' });
    }

    // Видаляємо підкатегорію з відповідної категорії
    await Category.findByIdAndUpdate(
      subcategory.categoryId,
      { $pull: { subcategories: subcategory._id } }
    );

    // Видаляємо саму підкатегорію
    await Subcategory.findByIdAndDelete(req.params.id);

    res.json({ message: 'Підкатегорію успішно видалено' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка видалення підкатегорії', error: err.message });
  }
};


