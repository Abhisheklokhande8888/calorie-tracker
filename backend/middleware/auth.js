import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Verifies JWT from Authorization header and attaches req.user (id, email).
 */
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = header.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = { id: user._id.toString(), email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
}
