import { getInventoryByUserId } from "../backend/src/controllers/inventoryController.js";
export default function handler(req, res) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      if (query.userId) {
        req.params = { userId: query.userId };
        return getInventoryByUserId(req, res);
      }
      return res.status(400).json({ error: "User ID is required" });

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} is not allowed`);
  }
}
