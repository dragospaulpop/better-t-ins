import { execSync } from "node:child_process";
import Bun from "bun";

async function waitForDatabase(maxAttempts = 30, delayMs = 1000) {
  console.log("Waiting for database to be ready...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Check if container exists and is running
      const containerStatus = execSync(
        "docker inspect better-t-ins-mysql --format='{{.State.Status}}' 2>/dev/null || echo 'not-found'",
        { encoding: "utf-8", stdio: "pipe", shell: "/bin/sh" }
      ).trim();

      if (containerStatus === "running") {
        // Check health status if available
        try {
          const health = execSync(
            "docker inspect better-t-ins-mysql --format='{{.State.Health.Status}}' 2>/dev/null || echo 'none'",
            { encoding: "utf-8", stdio: "pipe", shell: "/bin/sh" }
          ).trim();

          if (health === "healthy" || health === "none") {
            // Try to connect to MySQL
            execSync(
              "docker exec better-t-ins-mysql mysqladmin ping -h localhost --silent 2>/dev/null",
              { encoding: "utf-8", stdio: "pipe", shell: "/bin/sh" }
            );
            console.log("✓ Database is ready!");
            return;
          }
        } catch {
          // Health check not available, try direct connection
          execSync(
            "docker exec better-t-ins-mysql mysqladmin ping -h localhost --silent 2>/dev/null",
            { encoding: "utf-8", stdio: "pipe", shell: "/bin/sh" }
          );
          console.log("✓ Database is ready!");
          return;
        }
      }
    } catch (error) {
      // Container not ready yet
      console.error(error);
    }

    if (attempt < maxAttempts) {
      process.stdout.write(`Attempt ${attempt}/${maxAttempts}...\r`);
      await Bun.sleep(delayMs);
    }
  }

  console.error("✗ Database failed to become ready in time");
  process.exit(1);
}

waitForDatabase();
