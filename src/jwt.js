import jwt from "jsonwebtoken";

const DEFAULT_SIGN_OPTION = {
  expiresIn: "1h",
};

export function signJwtAccessToken(payload, options = DEFAULT_SIGN_OPTION) {
  const secret_key = process.env.NEXTAUTH_SECRET;
  const token = jwt.sign(payload, secret_key, options);

  return token;
}

export function verifyJwt(token) {
  const secret_key = process.env.NEXTAUTH_SECRET;

  try {
    const decoded = jwt.verify(token, secret_key);
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
}
