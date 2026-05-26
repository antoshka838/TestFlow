import React from "react";
import { useState, useEffect, useMemo } from "react";
import Header from "../../components/UI/header/Header";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import classes from "./style.module.css";
import TestCard from "../../components/testCard/TestCard";
import MyPagination from "../../components/UI/pagination/MyPagination";
import UserResultModal from "../../components/modals/userResultModal/userResultModal";
import { $authHost } from "../../http";
import { useTable } from "../../utils/hooks/useTable";
import { MenuItem, Select } from "@mui/material";
import Loader from "../../components/UI/loader/Loader";

export default function MainPage() {
  const [myTests, setMyTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const fetchMyTests = async () => {
    try {
      setIsLoading(true);
      const response = await $authHost.get("api/user/my-tests");

      const enrichedTests = response.data.map((test) => {
        const isWaitingForEvaluation = !!localStorage.getItem(
          `finishedTest_${test.id}`,
        );

        return {
          ...test,
          needsEvaluation: !test.isCompleted && isWaitingForEvaluation,
        };
      });
      setMyTests(enrichedTests);
    } catch (error) {
      console.error("Ошибка при загрузке тестов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTests();
  }, []);

  const filteredTests = useMemo(() => {
    return myTests.filter((test) => {
      if (filter === "COMPLETED") return test.isCompleted === true;
      if (filter === "PENDING") return test.isCompleted === false;
      return true;
    });
  }, [myTests, filter]);

  const cardColumns = [{ key: "name" }];

  const { search, setSearch, page, setPage, totalPages, paginatedData } =
    useTable({
      data: filteredTests,
      columns: cardColumns,
      pageSize: 6,
    });

  const handleOpenResult = (testId) => {
    setSelectedTestId(testId);
    setIsResultModalOpen(true);
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Загрузка тестов..." />
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Header title="Тесты" />
      <ToolBar>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          defaultValue="ALL"
          size="small"
          sx={{
            width: "180px",
            borderRadius: "10px",
            fontFamily: "inherit",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#FFDA53",
              borderWidth: "1px",
            },
          }}
        >
          <MenuItem value="ALL">Все тесты</MenuItem>
          <MenuItem value="PENDING">Не пройденные</MenuItem>
          <MenuItem value="COMPLETED">Пройденные</MenuItem>
        </Select>
      </ToolBar>

      <div className={classes.contentWrapper}>
        <div className={classes.cards}>
          {paginatedData.length > 0 ? (
            paginatedData.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onViewResult={() => handleOpenResult(test.id)}
              />
            ))
          ) : (
            <p style={{ padding: "20px", color: "#555" }}>
              {search
                ? "По вашему запросу ничего не найдено."
                : "У вас пока нет доступных тестов. Отдохните!"}
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <MyPagination totalPages={totalPages} page={page} setPage={setPage} />
        )}
      </div>

      <UserResultModal
        open={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        testId={selectedTestId}
      />
    </div>
  );
}
