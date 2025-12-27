import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",     // 🔐 token expiry
      algorithm: "HS256",  
    }
  );
};
