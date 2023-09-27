const Repository = require('./database/repository.js');


const createRepository = async (req, res) => {
  const { name, description, owner } = req.body;

  try {
    const newRepository = new Repository({ name, description, owner });
    await newRepository.save();
    res.json(newRepository);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find();
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
