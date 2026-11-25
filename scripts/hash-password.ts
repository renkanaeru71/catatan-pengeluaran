import bcrypt from "bcryptjs";
import readline from "node:readline/promises";

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const password = await rl.question("Masukkan password login (min. 12 karakter): ");
  rl.close();

  if (password.length < 12) {
    console.error("Password minimal 12 karakter.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log("\nSalin baris berikut ke .env dan environment variable Netlify:\n");
  console.log(`APP_PASSWORD_HASH="${hash}"`);
  console.log("\nJangan bagikan hash ini ke siapa pun.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
