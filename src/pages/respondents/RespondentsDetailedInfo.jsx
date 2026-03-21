import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { users } from "../../utils/users";
import Header from "../../components/UI/header/Header";
import Button from "../../components/UI/button/Button";
import DataCard from "../../components/dataCard/DataCard";
import classes from "./respondents.module.css";
import EditUserModal from "../../components/modals/ModalsForRespondents/editUserModal/EditUserModal";
import { groups } from "../../utils/groups";
import { testResults } from "../../utils/testResults";
import { tests } from "../../utils/tests";
import { useTable } from "../../utils/hooks/useTable";
import Table from "../../components/tables/table/Table";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import H2 from "../../components/UI/h2/H2";
import Search from "../../components/UI/search/Search";
import MyPagination from "../../components/UI/pagination/MyPagination";
import AddGroupModal from "../../components/modals/ModalsForRespondents/addGroupModal/AddGroupModal";
import OpenTests from "../../components/modals/openTests/OpenTests";

export default function RespondentsDetailedInfo() {
  const { id } = useParams();
  const userId = Number(id);
  const userData = users.find((u) => u.id === userId);
  const navigate = useNavigate();

  const userTests = userData.openTests.map((testId) => {
    const test = tests.find((t) => t.id === testId);

    const result = testResults.find(
      (r) => r.userId === userId && r.testId === testId,
    );

    const avgInternal = result
      ? Object.values(result.internalLoad).reduce((a, b) => a + b, 0) / 5
      : null;

    const avgExternal = result
      ? Object.values(result.externalLoad).reduce((a, b) => a + b, 0) / 5
      : null;

    return {
      id: testId,
      name: test.name,
      score: result?.score ?? "-",
      timeSpent: result ? `${Math.floor(result.timeSpent / 60)} мин.` : "-",
      avgInternal: result ? avgInternal.toFixed(2) : "-",
      avgExternal: result ? avgExternal.toFixed(2) : "-",
      status: result ? "Пройден" : "Не пройден",
      isCompleted: !!result,
    };
  });
  const [firstName, lastName, surname] = userData.fullName.split(" ");
  const title = `${firstName} ${lastName[0]}.${surname[0]}.`;

  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [openAddGroupModal, setOpenAddGroupModal] = useState(false);
  const [openTestModal, setOpenTestModal] = useState(false);
  
  const handleOpenTestResult = (test) =>{
    navigate(`/respondents/${id}/tests/${test.id}`)
  }

  const group = groups.filter((g) => userData.groups.includes(g.id));
  const groupColumns = [
    { key: "name", title: "Группа", render: (row) => row.name },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <Button style={{ color: "#FFFFFF", backgroundColor: "#E52327" }}>
          Удалить
        </Button>
      ),
      thStyle: { width: "80px" },
    },
  ];

  const testColumns = [
    {
      key: "name",
      title: "Тест",
      render: (row) => row.name,
    },
    {
      key: "score",
      title: "Оценка",
      render: (row) => row.score,
    },
    {
      key: "timeSpent",
      title: "Время",
      render: (row) => row.timeSpent,
    },
    {
      key: "avgInternal",
      title: "Ср. внутр. нагрузка",
      render: (row) => row.avgInternal,
    },
    {
      key: "avgExternal",
      title: "Ср. внешн. нагрузка",
      render: (row) => row.avgExternal,
    },
    {
      key: "status",
      title: "Статус",
      render: (row) => (
        <span
          style={{
            color: row.isCompleted ? "#2e7d32" : "#e65100",
            fontWeight: 600,
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      title: "",
      thStyle: { width: "200px" },
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button disabled={!row.isCompleted} onClick={() => handleOpenTestResult(row)}>Подробнее</Button>

          <Button
            style={{
              color: "#fff",
              backgroundColor: "#E52327",
            }}
            onClick={() => handleCloseTest(row.id)}
          >
            Закрыть
          </Button>
        </div>
      ),
    },
  ];

  const {
    search: groupsSearch,
    setSearch: setGroupsSearch,
    sortKey: groupsSortKey,
    sortOrder: groupsSortOrder,
    page: groupsPage,
    setPage: setGroupsPage,
    totalPages: groupsTotalPages,
    paginatedData: paginatedGroups,
    handleSort: handleSortGroups,
  } = useTable({ data: group, columns: groupColumns, pageSize: 5 });

  const {
    search: testsSearch,
    setSearch: setTestsSearch,
    sortKey: testsSortKey,
    sortOrder: testsSortOrder,
    page: testsPage,
    setPage: setTestsPage,
    totalPages: testsTotalPages,
    paginatedData: paginatedTests,
    handleSort: handleSortTests,
  } = useTable({ data: userTests, columns: testColumns, pageSize: 5 });

  return (
    <div>
      <Header
        title={title}
        crumbs={[
          { label: "Респонденты", to: "/respondents" },
          { label: title },
        ]}
      ></Header>
      <DataCard
        actions={
          <>
            <Button onClick={() => setOpenEditUserModal(true)}>
              Редактировать
            </Button>
            <Button className={classes.cancelBtn}>Удалить</Button>
          </>
        }
      >
        <p>
          <strong>ФИО: </strong>
          {userData.fullName}
        </p>
        <p>
          <strong>Почта: </strong>test@test
        </p>
        <p>
          <strong>Группы: </strong>
          {group.map((g) => g.name).join(", ")}
        </p>
        <p>
          <strong>Открыто тестов: </strong>5
        </p>
        <p>
          <strong>Пройдено тетсов: </strong>2
        </p>
      </DataCard>

      <div>
        <H2>Группы</H2>
        <ToolBar>
          <Search
            value={groupsSearch}
            onChange={(e) => setGroupsSearch(e.target.value)}
          />
          <Button onClick={() => setOpenAddGroupModal(true)}>
            Добавить в группу
          </Button>
        </ToolBar>
        <Table
          data={paginatedGroups}
          columns={groupColumns}
          onSort={handleSortGroups}
          sortKey={groupsSortKey}
          sortOrder={groupsSortOrder}
        />
        {groupsTotalPages > 1 && (
          <MyPagination
            totalPages={groupsTotalPages}
            page={groupsPage}
            setPage={setGroupsPage}
          />
        )}
      </div>

      <div>
        <H2>Тесты</H2>

        <ToolBar>
          <Search
            value={testsSearch}
            onChange={(e) => setTestsSearch(e.target.value)}
          />
          <Button onClick={() => setOpenTestModal(true)}>Открыть тест</Button>
        </ToolBar>

        <Table
          data={paginatedTests}
          columns={testColumns}
          onSort={handleSortTests}
          sortKey={testsSortKey}
          sortOrder={testsSortOrder}
        />

        {testsTotalPages > 1 && (
          <MyPagination
            totalPages={testsTotalPages}
            page={testsPage}
            setPage={setTestsPage}
          />
        )}
      </div>

      <EditUserModal
        open={openEditUserModal}
        onClose={() => setOpenEditUserModal(false)}
      />
      <AddGroupModal
        open={openAddGroupModal}
        onClose={() => setOpenAddGroupModal(false)}
        groups={groups}
      />
      <OpenTests
        open={openTestModal}
        onClose={() => setOpenTestModal(false)}
        tests={tests}
      />
    </div>
  );
}
