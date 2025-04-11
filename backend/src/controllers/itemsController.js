import * as itemsService from '../services/itemsService.js';

export const getItems = async (req, res) => {
  try {
    const items = await itemsService.getItems();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error getting items', error);
    res
      .status(500)
      .json({ message: 'Erreur lors de la récupération des items' });
  }
};

export const getItemById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await itemsService.getItemById(id);
    res.status(200).json(item);
  } catch (error) {
    console.error('Error getting item', error);
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération de l'item" });
    }
  }
};

export const createItem = async (req, res) => {
  try {
    const item = await itemsService.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item', error);
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erreur lors de la création de l'item" });
    }
  }
};

export const updateItem = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await itemsService.updateItem(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    console.error('Error updating item', error);
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    } else if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de l'item" });
    }
  }
};

export const deleteItem = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await itemsService.deleteItem(id);
    res.status(200).json({ message: 'Item supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting item', error);
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    } else if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'item" });
    }
  }
};
