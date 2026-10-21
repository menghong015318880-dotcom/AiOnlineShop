interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

// Page number buttons below the product grid.
export default function Pagination({ page, lastPage, onChange }: PaginationProps) {
  if (lastPage <= 1) return null; // nothing to paginate

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex justify-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="rounded border px-3 py-1 disabled:opacity-40"
      >
        &lt;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded border px-3 py-1 ${p === page ? "bg-blue-600 text-white" : "bg-white"}`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page === lastPage}
        onClick={() => onChange(page + 1)}
        className="rounded border px-3 py-1 disabled:opacity-40"
      >
        &gt;
      </button>
    </div>
  );
}