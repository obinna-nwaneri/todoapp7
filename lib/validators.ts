import { z } from "zod";

export const emailSchema = z.string().email();

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const registerDoctorSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1),
  specialization: z.string().min(1),
  yearsOfExperience: z.coerce.number().min(0),
});

export const registerPatientSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1),
  age: z.coerce.number().min(0),
  gender: z.string().min(1),
  contactInfo: z.string().optional(),
});

export const appointmentBookingSchema = z.object({
  doctorId: z.string().min(1),
  startAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), {
    message: "Appointment time must be in the future",
  }),
  symptoms: z.string().min(10, "Symptoms must be at least 10 characters"),
});

export const appointmentUpdateSchema = appointmentBookingSchema.partial({ doctorId: true }).extend({
  startAt: z.coerce.date().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
  q: z.string().optional(),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
