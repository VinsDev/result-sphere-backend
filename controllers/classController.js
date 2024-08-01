const Class = require('../models/Class'); // Import your Class model

// Get all classes
exports.getAllClasses = async (req, res, next) => {
    const classes = await Class.findAll();
    res.json(classes);
};

// Get all classes for a specific school
exports.getClassesBySchoolId = async (req, res) => {
    const school_id = req.user.school_id;

    const classes = await Class.findAll({ where: { school_id } });
    
    res.json(classes);
};

// Get a class by ID
exports.getClassById = async (req, res, next) => {
    const { id } = req.params;
    const classObj = await Class.findByPk(id);
    if (!classObj) {
        return next(new Error('Class not found'));
    }
    res.json(classObj);
};

// Create a new class
exports.createClass = async (req, res, next) => {
    const school_id = req.user.school_id;

    const { class_name } = req.body;
    const classObj = await Class.create({
        school_id, class_name
    });
    res.status(201).json(classObj);
};

// Update a class by ID
exports.updateClass = async (req, res, next) => {
    const { id } = req.params;
    const school_id = req.user.school_id;
    const { class_name } = req.body;
    
    const [affectedRows] = await Class.update(
        { school_id, class_name },
        { where: { class_id: id } }
    );
    if (affectedRows === 0) {
        return next(new Error('Class not found'));
    }
    const updatedClass = await Class.findByPk(id);
    res.json(updatedClass);
};

// Delete a class by ID
exports.deleteClass = async (req, res, next) => {
    const { id } = req.params;
    const affectedRows = await Class.destroy({ where: { class_id: id } });
    if (affectedRows === 0) {
        return next(new Error('Class not found'));
    }
    res.json({ message: 'Class deleted' });
};
