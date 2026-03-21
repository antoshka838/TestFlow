import React from "react";
import { Pagination } from "@mui/material";
import classes from "./pagination.module.css"

export default function MyPagination({totalPages, page, setPage}) {
  return (
    <div className={classes.paginationWrapper}>
      <Pagination
        count={totalPages}
        variant="outlined"
        page={page}
        onChange={(event, value) => setPage(value)}
      />
    </div>
  );
}
