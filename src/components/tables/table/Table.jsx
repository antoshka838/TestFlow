import classes from "./table.module.css";

export default function Table({
  columns,
  data,
  onSort,
  sortKey,
  sortOrder,
  onRowClick,
}) {
  return (
    <div className={classes.wrapper}>
      <table className={classes.table}>
        <thead className={classes.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort?.(col.key)}
                style={col.thStyle}
              >
                {col.title}

                {sortKey === col.key && (
                  <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={classes.tbody}>
          {data.map((row) => (
            <tr key={row.id} onClick={() => onRowClick?.(row)} className={onRowClick ? classes.clickableRow : ""}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
