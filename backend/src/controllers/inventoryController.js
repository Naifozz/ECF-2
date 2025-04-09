import * as inventoryService from '../services/inventoryService.js';
export const getInventoryByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const inventory = await inventoryService.getInventoryByUserId(userId);
    res.status(200).json(inventory);
  } catch (error) {
    console.error('Error getting inventory', error);
    res.status(error.status || 500).json({ message: error.message });
  }
};
