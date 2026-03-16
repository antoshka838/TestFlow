import { useNavigate } from "react-router";
import classes from "./header.module.css";
import { Breadcrumbs, Link, Typography } from "@mui/material";

export default function Header({ title, crumbs, children }) {
  const navigate = useNavigate();
  return (
    <div className={classes.headerWrapper}>
      {crumbs && crumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 1 }}>
          {crumbs.map((crumb, idx) =>
            crumb.to ? (
              <Link
                key={idx}
                color="inherit"
                onClick={() => navigate(crumb.to)}
                style={{ cursor: "pointer" }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={idx} color="textPrimary">
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <div className={classes.headerRow}>
        <h1>{title}</h1>
        {children && <div className={classes.actions}>{children}</div>}
      </div>
    </div>
  );
}
