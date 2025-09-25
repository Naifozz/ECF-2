import {
  login,
  register,
  logout,
  getCurrentUser,
} from "../backend/controllers/authController.js";
import { isAuthenticated } from "../backend/src/middlewares/authMiddleware.js";

export default function handler(req, res) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      if (!isAuthenticated(req)) {
        return res.status(401).json({ message: "Authentification requise" });
      }
      return getCurrentUser(req, res);

    case "POST":
      switch (query.action) {
        case "login":
          return login(req, res);
        case "register":
          return register(req, res);
        case "logout":
          if (!isAuthenticated(req)) {
            return res
              .status(401)
              .json({ message: "Authentification requise" });
          }
          return logout(req, res);
        default:
          return res.status(400).json({ error: "Action is required" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} is not allowed`);
  }
}
