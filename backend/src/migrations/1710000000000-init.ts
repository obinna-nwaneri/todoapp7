import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1710000000000 implements MigrationInterface {
  name = 'Init1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'DOCTOR', 'PATIENT')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "PK_users" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "doctors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "specialization" character varying NOT NULL, "yearsOfExperience" integer NOT NULL, "availabilitySchedule" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_doctors_user" UNIQUE ("user_id"), CONSTRAINT "PK_doctors" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "age" integer NOT NULL, "gender" character varying NOT NULL, "contactInfo" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_patients_user" UNIQUE ("user_id"), CONSTRAINT "PK_patients" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appointments_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')`
    );
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "time" time without time zone NOT NULL, "symptoms" text NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "patient_id" uuid, "doctor_id" uuid, CONSTRAINT "PK_appointments" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD CONSTRAINT "FK_doctors_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "FK_patients_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_doctor"`);
    await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_patient"`);
    await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_patients_user"`);
    await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "FK_doctors_user"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(`DROP TABLE "doctors"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
