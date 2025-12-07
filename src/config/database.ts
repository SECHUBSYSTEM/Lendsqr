import knex, { Knex } from "knex";
import { config } from "./index";

const knexConfig: Knex.Config = {
  client: "mysql2",
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database:
      process.env.NODE_ENV === "test" ? config.db.testName : config.db.name,
  },
};

const db: Knex = knex(knexConfig);

export default db;
