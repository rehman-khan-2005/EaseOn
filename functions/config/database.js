module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ease_on_dev",
    host: process.env.DB_HOST || "localhost",
    port: 5432,
    dialect: "postgres",
  },
  production: {
    username: "neondb_owner",
    password: "npg_LViFjCW51bro",
    database: "neondb",
    host: "ep-delicate-bread-anw2pbw8-pooler.c-6.us-east-1.aws.neon.tech",
    port: 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
