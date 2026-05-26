import React, { useState, useEffect } from "react";
import Header from "../../components/UI/header/Header";
import { useTable } from "../../utils/hooks/useTable";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import Table from "../../components/tables/table/Table";
import MyPagination from "../../components/UI/pagination/MyPagination";
import * as XLSX from "xlsx";
import Button from "../../components/UI/button/Button";
import { $authHost } from "../../http";
import { useNavigate } from "react-router";
import Loader from "../../components/UI/loader/Loader";

export default function Statistics() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    $authHost
      .get("api/statistics/tests")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRowClick = (row) => {
    navigate(`/statistics/${row.id}`);
  };

  const handleExportToExcel = () => {
    const dataForExcel = data.map((row) => {
      let timeStr = "—";
      if (row.avgTime !== "—") {
        timeStr = `${Math.floor(row.avgTime / 60)} мин. ${row.avgTime % 60} сек.`;
      }

      return {
        "Название теста": row.name,
        "Прошли / Всего": `${row.passedCount} / ${row.totalAssigned}`,
        "Ср. балл (из 10)": row.avgScore,
        "Ср. время": timeStr,
        "Ср. внутр. нагрузка": row.avgInternal,
        "Ср. внешн. нагрузка": row.avgExternal,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    worksheet["!cols"] = [
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Статистика по тестам");

    XLSX.writeFile(workbook, "Test_Statistics.xlsx");
  };

  const columns = [
    {
      key: "name",
      title: "Название теста",
    },
    {
      key: "progress",
      title: "Прошли / Всего",
      render: (row) => `${row.passedCount} / ${row.totalAssigned}`,
      thStyle: { width: "150px" },
    },
    {
      key: "avgScore",
      title: "Ср. балл (из 10)",
      thStyle: { width: "150px" },
    },
    {
      key: "avgTime",
      title: "Ср. время",
      render: (row) => {
        if (row.avgTime === "—") return "—";
        const mins = Math.floor(row.avgTime / 60);
        const secs = row.avgTime % 60;
        return `${mins} мин. ${secs} сек.`;
      },
      thStyle: { width: "160px" },
    },
    {
      key: "avgInternal",
      title: "Ср. внутр. нагрузка",
      thStyle: { width: "180px" },
    },
    {
      key: "avgExternal",
      title: "Ср. внешн. нагрузка",
      thStyle: { width: "180px" },
    },
  ];

  const {
    search,
    setSearch,
    sortKey,
    sortOrder,
    page,
    setPage,
    totalPages,
    paginatedData,
    handleSort,
  } = useTable({
    data,
    columns: columns,
    pageSize: 10,
  });

  if (isLoading) {
    return (
      <div>
        <Header title={"Статистика"} />
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Header title={"Статистика"} />
      <ToolBar>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={handleExportToExcel}>Скачать данные</Button>
      </ToolBar>
      <Table
        data={paginatedData}
        columns={columns}
        onSort={handleSort}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onRowClick={handleRowClick}
      />

      {totalPages > 1 && (
        <MyPagination totalPages={totalPages} page={page} setPage={setPage} />
      )}
    </div>
  );
}
