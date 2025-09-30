import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { listDoctors, listSpecialties } from "../api/doctors.js";

const Doctors = () => {
  const [filters, setFilters] = useState({ search: "", specialty: "", ordering: "" });
  const { data: specialties } = useQuery({ queryKey: ["specialties"], queryFn: listSpecialties });
  const { data, isLoading } = useQuery({
    queryKey: ["doctors", filters],
    queryFn: () => listDoctors(filters)
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="card">
        <h2>Find a doctor</h2>
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input id="search" name="search" value={filters.search} onChange={handleChange} placeholder="Name, clinic, specialty" />
        </div>
        <div className="form-group">
          <label htmlFor="specialty">Specialty</label>
          <select id="specialty" name="specialty" value={filters.specialty} onChange={handleChange}>
            <option value="">All specialties</option>
            {specialties?.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="ordering">Sort by</label>
          <select id="ordering" name="ordering" value={filters.ordering} onChange={handleChange}>
            <option value="">Default</option>
            <option value="clinic_name">Clinic Name (A-Z)</option>
            <option value="-clinic_name">Clinic Name (Z-A)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p>Loading doctors...</p>
      ) : (
        <div className="card-grid">
          {data?.results?.map((doctor) => (
            <div className="card" key={doctor.id}>
              <h3>
                Dr. {doctor.user.first_name} {doctor.user.last_name}
              </h3>
              <p>{doctor.specialty.name}</p>
              <p>{doctor.clinic_name}</p>
              <p>₦{Number(doctor.consultation_fee).toLocaleString()}</p>
              <Link className="button" to={`/doctors/${doctor.id}`}>
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
