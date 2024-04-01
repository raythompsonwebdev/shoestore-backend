import bcrypt from "bcrypt";

export async function hashPassword(plaintextPassword) {
  const hash = await bcrypt.hash(plaintextPassword, 12);
  // Store hash in the database
  return hash;
}
// compare password
export async function comparePassword(plaintextPassword, hash) {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
}
