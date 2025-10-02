import { z } from "zod";
import { AppointmentStatus, Role } from "@prisma/client";
import { isAfter, startOfDay } from "date-fns";

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

export const registerDoctorSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(2),
  specialization: z.string().min(2),
  yearsOfExperience: z.coerce.number().int().min(0),
  availabilitySchedule: z.any().optional()
});

export const registerPatientSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(2),
  age: z.coerce.number().int().min(0),
  gender: z.string().min(1),
  contactInfo: z.any().optional()
});

export const appointmentFiltersSchema = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional()
});

const dateValidator = z.string().refine((val) => {
  const parsed = new Date(val);
  return !Number.isNaN(parsed.valueOf()) && !isAfter(startOfDay(new Date()), startOfDay(parsed));
}, "Date must be today or later");

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  date: dateValidator,
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format"),
  symptoms: z.string().min(3)
});

export const adminCreateAppointmentSchema = bookAppointmentSchema.extend({
  patientId: z.string().min(1),
  status: z.nativeEnum(AppointmentStatus).optional()
});

export const updateAppointmentSchema = bookAppointmentSchema.partial().extend({
  status: z.nativeEnum(AppointmentStatus).optional(),
  patientId: z.string().optional()
});

export const updateDoctorSchema = z.object({
  name: z.string().min(2).optional(),
  specialization: z.string().min(2).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).optional(),
  availabilitySchedule: z.any().optional()
});

export const updatePatientSchema = z.object({
  name: z.string().min(2).optional(),
  age: z.coerce.number().int().min(0).optional(),
  gender: z.string().min(1).optional(),
  contactInfo: z.any().optional()
});

export const roleGuard = z.nativeEnum(Role);
