CREATE TYPE "user_positions" AS ENUM (
  'frontend',
  'backend',
  'fullstack',
  'designer',
  'PM',
  'PO',
  'devops',
  'other'
);

CREATE TYPE "technologies" AS ENUM (
  'javascript',
  'java',
  'c',
  'cpp',
  'csharp',
  'objective_c',
  'python',
  'kotlin',
  'html',
  'css',
  'solidity',
  'react',
  'react_native',
  'angular',
  'vue',
  'node',
  'spring',
  'dotnet',
  'django',
  'blockchain'
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" varchar(63) UNIQUE NOT NULL,
  "password" varchar(255),
  "email" varchar(127) UNIQUE NOT NULL,
  "position" user_positions,
  "created_at" timestamp DEFAULT (now()),
  "verified" bool DEFAULT false,
  "registered" bool DEFAULT true
);

CREATE TABLE "projects" (
  "id" SERIAL PRIMARY KEY,
  "owner_id" int NOT NULL,
  "name" varchar(255) NOT NULL DEFAULT 'My project',
  "description" varchar(2047) NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "project_users" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int NOT NULL,
  "project_id" int NOT NULL
);

CREATE TABLE "project_needed_positions" (
  "id" SERIAL PRIMARY KEY,
  "project_id" int,
  "user_position" user_positions NOT NULL,
  "count" int
);

CREATE TABLE "project_technologies" (
  "id" SERIAL PRIMARY KEY,
  "project_id" int NOT NULL,
  "technology" technologies NOT NULL
);

CREATE TABLE "message" (
  "bigint" SERIAL PRIMARY KEY,
  "sender_id" int NOT NULL,
  "recipent_id" int NOT NULL,
  "title" varchar(255) NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "verification_codes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int NOT NULL,
  "code" varchar(511) NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

ALTER TABLE "projects" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id");

ALTER TABLE "project_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "project_users" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "project_needed_positions" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "project_technologies" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "message" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id");

ALTER TABLE "message" ADD FOREIGN KEY ("recipent_id") REFERENCES "users" ("id");

ALTER TABLE "verification_codes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
