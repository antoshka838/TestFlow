import React, { useMemo, useState, useEffect } from "react";
import { filterAndSort } from "../filtredSort";

export function useTable({
  data,
  columns,
  search: initialSearch = "",
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

  const filteredData = useMemo(
    () => filterAndSort({ data, columns, search, sortKey, sortOrder }),
    [data, columns, search, sortKey, sortOrder],
  );

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
