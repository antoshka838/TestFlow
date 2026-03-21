export function filterAndSort({ data, columns, search, sortKey, sortOrder }) {
  if (!data) return [];

  const filtered = data.filter((item) => {
    const value = search.toLowerCase();
    return columns.some((col) => {
      const itemValue = col.render ? col.render(item) : item[col.key];
      return String(itemValue || "").toLowerCase().includes(value);
    });
  });

  if (!sortKey) return filtered;

  const column = columns.find((c) => c.key === sortKey);

  return [...filtered].sort((a, b) => {
    let aValue = a[sortKey] !== undefined ? a[sortKey] : (column?.render ? column.render(a) : "");
    let bValue = b[sortKey] !== undefined ? b[sortKey] : (column?.render ? column.render(b) : "");

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue || "");
    const bStr = String(bValue || "");

    return sortOrder === "asc" 
      ? aStr.localeCompare(bStr) 
      : bStr.localeCompare(aStr);
  });
}
