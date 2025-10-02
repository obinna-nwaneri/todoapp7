const Pagination = ({ page, pageCount, onPageChange }) => {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <div className="mt-4 flex justify-end gap-2">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`rounded border px-3 py-1 text-sm ${
            p === page ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
