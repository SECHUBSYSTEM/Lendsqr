import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary();
    table.integer("wallet_id").unsigned().notNullable();
    table.enum("type", ["fund", "transfer", "withdrawal"]).notNullable();
    table.decimal("amount", 15, 2).notNullable();
    table.string("reference", 100).unique().notNullable();
    table.integer("recipient_wallet_id").unsigned().nullable();
    table.string("description", 255).nullable();
    table
      .enum("status", ["pending", "completed", "failed"])
      .defaultTo("pending");
    table.timestamps(true, true);

    table.foreign("wallet_id").references("id").inTable("wallets");
    table.foreign("recipient_wallet_id").references("id").inTable("wallets");

    // Indexes for common queries
    table.index(["wallet_id", "type"]);
    table.index("reference");
    table.index("created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("transactions");
}
