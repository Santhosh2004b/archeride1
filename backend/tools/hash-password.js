// backend/tools/hash-password.js
import { hashPassword } from "../utils/password.utils.js";

const run = async () => {
  const hash = await hashPassword("password");
  console.log("HASH:", hash);
};

run();
