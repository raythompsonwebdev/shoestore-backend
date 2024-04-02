import "dotenv/config";
import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign(userId, process.env.AUTH0_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    signed: true,
  });
};

const verifyJwt = (token) => {
  try {
    const secret_key = process.env.ACCESS_TOKEN_SECRET;
    const decoded = jwt.verify(token, secret_key);
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const DEFAULT_SIGN_OPTION = {
  expiresIn: "1h",
};

const signJwtAccessToken = (payload, options = DEFAULT_SIGN_OPTION) => {
  const secret_key = process.env.SECRET;
  const token = jwt.sign(payload, secret_key, options);
  return token;
};

//Generate an access token and a refresh token for this database user
function jwtTokens({ user_id, user_name, user_email }) {
  const user = { user_id, user_name, user_email };
  const accessToken = jwt.sign(user, process.env.AUTH0_SECRET, {
    expiresIn: "20s",
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_AUTH0_SECRET, {
    expiresIn: "30d",
  });
  return { accessToken, refreshToken };
}

export { generateToken, verifyJwt, signJwtAccessToken, jwtTokens };
