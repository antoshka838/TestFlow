import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router";
import Header from "../../components/UI/header/Header";
import { useTable } from "../../utils/hooks/useTable";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import Table from "../../components/tables/table/Table";
import MyPagination from "../../components/UI/pagination/MyPagination";
import * as XLSX from "xlsx";
import Button from "../../components/UI/button/Button";
import { $authHost } from "../../http";
import Loader from "../../components/UI/loader/Loader";
import Message from "../../components/tableMessage/Message";

const formatFullName = (fullName) => {
  if (!fullName) return "—";
  const words = fullName.trim().split(" ").filter(Boolean);
  if (words.length === 1) return words[0];
  if (words.length === 2) return `${words[0]} ${words[1][0]}.`;
  return `${words[0]} ${words[1][0]}.${words[2][0]}.`;
};

const formatTimeMs = (ms) => {
  if (!ms || ms === 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins} мин. ${secs} сек.`;
};

export default function DetailedStatistics() {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [testName, setTestName] = useState("Загрузка...");

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    $authHost
      .get(`api/statistics/tests/${id}`)
      .then((res) => {
        setTestName(res.data.testName);
        setData(res.data.results);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uniqueGroups = useMemo(() => {
    const groups = data
      .map((item) => item.groupName)
      .filter((name) => name && name !== "—");
    return [...new Set(groups)];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const groupMatch =
        selectedGroups.length === 0 || selectedGroups.includes(item.groupName);
      const statusMatch =
        selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
      return groupMatch && statusMatch;
    });
  }, [data, selectedGroups, selectedStatuses]);

  const toggleGroup = (group) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
    setPage(1);
  };

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
    setPage(1);
  };

  const handleExportToExcel = () => {
    const dataForExcel = filteredData.map((row) => ({
      Респондент: row.userName,
      Группа: row.groupName,
      Статус: row.status,
      "Дата прохождения": row.date
        ? new Date(row.date).toLocaleDateString("ru-RU")
        : "—",
      "Оценка (качество)": row.score,
      Время: formatTimeMs(row.timeMs),
      "Внутр. нагрузка": row.intLoad,
      "Внешн. нагрузка": row.extLoad,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    worksheet["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Результаты");

    const fileName =
      selectedGroups.length > 0
        ? `Test_${id}_Filtered.xlsx`
        : `Test_${id}_All_Results.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const columns = [
    {
      key: "userName",
      title: "ФИО",
      render: (row) => formatFullName(row.userName),
      thStyle: { width: "120px" },
    },
    { key: "groupName", title: "Группа", thStyle: { width: "120px" } },
    {
      key: "status",
      title: "Статус",
      render: (row) => (
        <span
          style={{
            color: row.status === "Пройден" ? "#34C924" : "#E52327",
            fontWeight: "bold",
          }}
        >
          {row.status}
        </span>
      ),
      thStyle: { width: "120px" },
    },
    {
      key: "date",
      title: "Дата",
      render: (row) =>
        row.date ? new Date(row.date).toLocaleDateString("ru-RU") : "—",
      thStyle: { width: "100px" },
    },
    { key: "score", title: "Оценка", thStyle: { width: "90px" } },
    {
      key: "timeMs",
      title: "Время",
      render: (row) => formatTimeMs(row.timeMs),
      thStyle: { width: "140px" },
    },
    { key: "intLoad", title: "Внутр. нагр.", thStyle: { width: "120px" } },
    { key: "extLoad", title: "Внешн. нагр.", thStyle: { width: "120px" } },
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
    data: filteredData,
    columns: columns,
    pageSize: 10,
    searchKeys: ["userName"],
  });

  const activeFiltersCount = selectedGroups.length + selectedStatuses.length;

  if (isLoading) {
    return (
      <div>
        <Header title="Загрузка..." />
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`${testName}`}
        crumbs={[
          { label: "Статистика", to: "/statistics" },
          { label: testName },
        ]}
      />
      <ToolBar>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <Search value={search} onChange={(e) => setSearch(e.target.value)} />

          <div style={{ position: "relative" }} ref={filterRef}>
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                backgroundColor: activeFiltersCount > 0 ? "#FFDA53" : "#fff",
                color: "#333",
                border: "1px solid #ccc",
              }}
            >
              Фильтры {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>

            {isFilterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  left: 0,
                  backgroundColor: "#fff",
                  border: "1px solid #eaeaea",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  borderRadius: "12px",
                  padding: "20px",
                  zIndex: 100,
                  display: "flex",
                  gap: "40px",
                  minWidth: "300px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: "#666",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                    }}
                  >
                    Группы
                  </h4>
                  {uniqueGroups.length === 0 && (
                    <span style={{ fontSize: "13px", color: "#999" }}>
                      Нет групп
                    </span>
                  )}
                  {uniqueGroups.map((group) => (
                    <label
                      key={group}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group)}
                        onChange={() => toggleGroup(group)}
                      />
                      {group}
                    </label>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: "#666",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                    }}
                  >
                    Статус
                  </h4>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes("Пройден")}
                      onChange={() => toggleStatus("Пройден")}
                    />
                    Пройден
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes("Не пройден")}
                      onChange={() => toggleStatus("Не пройден")}
                    />
                    Не пройден
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleExportToExcel}>Скачать Excel</Button>
      </ToolBar>

      {paginatedData.length > 0 ? (
        <Table
        data={paginatedData}
        columns={columns}
        onSort={handleSort}
        sortKey={sortKey}
        sortOrder={sortOrder}
      />
      ) : (
        <Message>
          {search
            ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска."
            : "Статистика отсутствует."}
        </Message>
      )}

      {totalPages > 1 && (
        <MyPagination totalPages={totalPages} page={page} setPage={setPage} />
      )}
    </div>
  );
}
