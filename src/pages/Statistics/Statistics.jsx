import React from "react";
import Header from "../../components/UI/header/Header";
import { useTable } from "../../utils/hooks/useTable";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import Table from "../../components/tables/table/Table";
import MyPagination from "../../components/UI/pagination/MyPagination";
import { mockStatisticsData } from "../../utils/mockStatisticsData";
import * as XLSX from "xlsx";
import Button from "../../components/UI/button/Button";

export default function Statistics() {
  const handleExportToExcel = () => {
    const dataForExcel = mockStatisticsData.map((row) => {
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
    data: mockStatisticsData,
    columns: columns,
    pageSize: 10,
  });

  return (
    <div>
      <Header title={"Статистика"} />
      <ToolBar>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button onClick={handleExportToExcel}>
            Скачать данные
          </Button>
      </ToolBar>
      <Table
        data={paginatedData}
        columns={columns}
        onSort={handleSort}
        sortKey={sortKey}
        sortOrder={sortOrder}
      />

      {totalPages > 1 && (
        <MyPagination totalPages={totalPages} page={page} setPage={setPage} />
      )}
    </div>
  );
}
