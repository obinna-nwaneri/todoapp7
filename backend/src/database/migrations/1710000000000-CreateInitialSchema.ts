import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1710000000000 implements MigrationInterface {
  name = 'CreateInitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER')`);
    await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "owner_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_projects_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "public"."todos_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
    await queryRunner.query(`CREATE TYPE "public"."todos_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
    await queryRunner.query(`CREATE TABLE "todos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "priority" "public"."todos_priority_enum" NOT NULL DEFAULT 'MEDIUM', "status" "public"."todos_status_enum" NOT NULL DEFAULT 'PENDING', "due_date" TIMESTAMP WITH TIME ZONE, "project_id" uuid, "assignee_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_todos_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_id" uuid, "entity" character varying NOT NULL, "entity_id" uuid NOT NULL, "action" character varying NOT NULL, "meta" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_activity_logs_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_todos_status_assignee" ON "todos" ("status", "assignee_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_todos_project" ON "todos" ("project_id")`);
    await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_owner" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "todos" ADD CONSTRAINT "FK_todos_project" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "todos" ADD CONSTRAINT "FK_todos_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_activity_logs_actor" FOREIGN KEY ("actor_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_activity_logs_actor"`);
    await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_todos_assignee"`);
    await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_todos_project"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_owner"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_todos_project"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_todos_status_assignee"`);
    await queryRunner.query(`DROP TABLE "activity_logs"`);
    await queryRunner.query(`DROP TABLE "todos"`);
    await queryRunner.query(`DROP TYPE "public"."todos_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."todos_priority_enum"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
