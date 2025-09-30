import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { listDoctors, listSpecialties } from "../api/doctors.js";

const Doctors = () => {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [ordering, setOrdering] = useState("");
  const [page, setPage] = useState(1);

  const doctorsQuery = useQuery({
    queryKey: ["doctors", { search, specialty, ordering, page }],
    queryFn: () => listDoctors({ search, specialty, ordering, page }),
  });

  const specialtiesQuery = useQuery({
    queryKey: ["specialties"],
    queryFn: listSpecialties,
  });

  const doctors = doctorsQuery.data?.results ?? [];
  const totalPages = Math.ceil((doctorsQuery.data?.count ?? 0) / (doctorsQuery.data?.results?.length || 20)) || 1;

  return (
    <div>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>Find a doctor</h2>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div>
            <label htmlFor="search">Search</label>
            <input id="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or clinic" />
          </div>
          <div>
            <label htmlFor="specialty">Specialty</label>
            <select id="specialty" value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
              <option value="">All specialties</option>
              {specialtiesQuery.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ordering">Ordering</label>
            <select id="ordering" value={ordering} onChange={(event) => setOrdering(event.target.value)}>
              <option value="">Default</option>
              <option value="clinic_name">Clinic name</option>
              <option value="user__last_name">Doctor name</option>
            </select>
          </div>
        </div>
      </div>

      {doctorsQuery.isLoading ? (
        <p>Loading doctors...</p>
      ) : (
        <div className="card-grid">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="card">
              <h3>
                Dr. {doctor.user.first_name} {doctor.user.last_name}
              </h3>
              <p>{doctor.specialty.name}</p>
              <p>{doctor.clinic_name}</p>
              <p>₦{Number(doctor.consultation_fee).toLocaleString()}</p>
              <Link className="primary" to={`/doctors/${doctor.id}`}>
                View profile
              </Link>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <button type="button" className="secondary" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button type="button" className="secondary" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Doctors;
