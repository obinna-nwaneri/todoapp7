import { RegisterDoctorForm } from "@/components/forms/register-doctor-form";

export default function RegisterDoctorPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Doctor Registration</h1>
        <p className="text-sm text-slate-600">Create your account to manage appointments and availability.</p>
      </div>
      <RegisterDoctorForm />
    </div>
  );
}
