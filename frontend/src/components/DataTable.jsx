const DataTable = ({ columns, data, emptyLabel = "No records" }) => {
  return (
    <div className="overflow-x-auto rounded bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-500">
                {emptyLabel}
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr key={row.id ?? Math.random()} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.accessor} className="px-4 py-2 text-sm text-gray-700">
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
