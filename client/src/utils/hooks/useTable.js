import { useMemo, useState, useEffect } from "react";

export function useTable({
  data,
  columns,
  search: initialSearch = "",
  searchKeys = [],
  pageSize = 10,
}) {
  const [search, setSearch] = useState(initialSearch);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const lowerSearch = search.trim().toLowerCase();
      result = result.filter((row) => {
        if (searchKeys.length > 0) {
          return searchKeys.some((key) =>
            String(row[key] || "").toLowerCase().includes(lowerSearch)
          );
        }
        return Object.values(row).some((val) =>
          String(val || "").toLowerCase().includes(lowerSearch)
        );
      });
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA == null) return sortOrder === "asc" ? 1 : -1;
        if (valB == null) return sortOrder === "asc" ? -1 : 1;

        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [data, search, searchKeys, sortKey, sortOrder]);

  useEffect(() => setPage(1), [search, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  return {
    search,
    setSearch,
    sortKey,
    sortOrder,
    page,
    setPage,
    totalPages,
    paginatedData,
    handleSort,
    pageSize,
  };
}