import { defineConfig } from "vitest/config";

// Same throwaway local credentials as docker-compose.yml / .env.example,
// just a different database name so integration tests don't touch dev data.
export default defineConfig({
  test: {
    env: {
      DATABASE_URL: "postgresql://admin:password123@localhost:5433/family_db_test",
    },
  },
});
