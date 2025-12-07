"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    development: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "demo_credit",
        },
        migrations: {
            directory: "./src/database/migrations",
            tableName: "knex_migrations",
        },
        seeds: {
            directory: "./src/database/seeds",
        },
    },
    test: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME_TEST || "demo_credit_test",
        },
        migrations: {
            directory: "./src/database/migrations",
            tableName: "knex_migrations",
        },
    },
    production: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        migrations: {
            directory: "./src/database/migrations",
            tableName: "knex_migrations",
        },
        pool: {
            min: 2,
            max: 10,
        },
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map