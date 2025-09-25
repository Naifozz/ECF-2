import { getProfile } from "../backend/controllers/usersController.js";
import { isAuthenticated } from "../backend/middlewares/authMiddleware.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const authError = await isAuthenticated(req, res);
      if (authError) {
        return;
      }

      return getProfile(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} is not allowed`);
  }
}
