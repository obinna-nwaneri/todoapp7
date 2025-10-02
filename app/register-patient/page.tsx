import { RegisterPatientForm } from "@/components/forms/register-patient-form";

export default function RegisterPatientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Patient Registration</h1>
        <p className="text-sm text-slate-600">Create your account to book and manage appointments.</p>
      </div>
      <RegisterPatientForm />
    </div>
  );
}
