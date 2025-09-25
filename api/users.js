import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../backend/src/controllers/usersController.js";

export default function handler(req, res) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      if (query.id) {
        return getUserById(req, res);
      }
      return getUsers(req, res);

    case "POST":
      return createUser(req, res);

    case "PUT":
      if (!query.id) {
        return res.status(400).json({ error: "ID is required" });
      }
      return updateUser(req, res);

    case "DELETE":
      if (!query.id) {
        return res.status(400).json({ error: "ID is required" });
      }
      return deleteUser(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} is not allowed`);
  }
}
