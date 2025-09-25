import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../backend/src/controllers/itemsController.js";

export default function handler(req, res) {
  const { method, query } = req;

  if (query.id) {
    req.parmas = { id: query.id };
  }

  switch (method) {
    case "GET":
      if (query.id) {
        return getItemById(req, res);
      }
      return getItems(req, res);

    case "POST":
      return createItem(req, res);

    case "PUT":
      if (!query.id) {
        return res.status(400).json({ error: "ID is required" });
      }
      return updateItem(req, res);

    case "DELETE":
      if (!query.id) {
        return res.status(400).json({ error: "ID is required" });
      }
      return deleteItem(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} is not allowed`);
  }
}
