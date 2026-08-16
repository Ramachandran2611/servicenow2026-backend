import bcrypt from "bcryptjs";
import * as usersRepository from "../repositories/users.repository";
import { ConflictError, UnauthorizedError } from "../errors";

export async function registerUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    return await usersRepository.insertUser(email, passwordHash);
  } catch (err: any) {
    if (err.code === "23505") {
      throw new ConflictError("An account with that email already exists");
    }
    throw err;
  }
}

export async function verifyCredentials(email: string, password: string) {
  const user = await usersRepository.findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return { id: user.id, email: user.email };
}
