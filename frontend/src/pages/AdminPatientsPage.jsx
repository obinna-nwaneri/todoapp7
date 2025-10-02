import { useEffect, useState } from "react";
import api from "../api/client";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const AdminPatientsPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      const params = { page, search };
      if (active !== "all") {
        params.active = active;
      }
      const { data } = await api.get("/admin/patients/", { params });
      const results = data.results ?? data;
      setItems(results);
      if (data.count) {
        setPages(Math.ceil(data.count / (data.results?.length || 10)) || 1);
      } else {
        setPages(1);
      }
      setLoading(false);
    };
    fetchPatients();
  }, [page, search, active]);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Patients</h2>
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Search patients">
        <select
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </FilterBar>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <DataTable
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Age", accessor: "age" },
              { header: "Gender", accessor: "gender" },
              { header: "Email", accessor: "email" },
            ]}
            data={items}
          />
          <Pagination page={page} pageCount={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminPatientsPage;
