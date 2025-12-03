import { eq } from "drizzle-orm";
import { db } from ".";
import { allowedHosts } from "./schema/settings";

async function seedAllowedHosts() {
  const [tudconsultHost] = await db
    .select()
    .from(allowedHosts)
    .where(eq(allowedHosts.host, "tudconsult.ro"));
  if (tudconsultHost) {
    // biome-ignore lint/suspicious/noConsole: grrr...
    console.log("Tudconsult host already exists");
  } else {
    await db.insert(allowedHosts).values({
      host: "tudconsult.ro",
      description: "Tudconsult",
      enabled: true,
    });
    // biome-ignore lint/suspicious/noConsole: grrr...
    console.log("Tudconsult host seeded");
  }
}

async function seed() {
  try {
    await seedAllowedHosts();
  } finally {
    db.$client.end();
  }
}

seed();
