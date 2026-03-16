import React, { useState, useMemo } from "react";
import Header from "../../components/UI/header/Header";
import { useParams } from "react-router";
import { tests } from "../../utils/tests";
import { groups } from "../../utils/groups";
import { users } from "../../utils/users";
import { testResults } from "../../utils/testResults";
import Table from "../../components/tables/table/Table";
import DataCard from "../../components/dataCard/DataCard";
import Button from "../../components/UI/button/Button";
import classes from "./tests.module.css";
import EditTest from "../../components/modals/TestsModals/EditTest";
import H2 from "../../components/UI/h2/H2";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import { useTable } from "../../utils/hooks/useTable";
import MyPagination from "../../components/UI/pagination/MyPagination";
import OpenTestToGroupModal from "../../components/modals/TestsModals/openTestToGroupModal/OpenTestToGroupModal";
import OpenTestToUserModal from "../../components/modals/TestsModals/openTestToUserModal/OpenTestToUserModal";

export default function TestDetailedInfo() {
  const { testId } = useParams();
  const test = tests.find((t) => t.id === Number(testId));
  const [isEditTest, setEditTest] = useState(false);
  const [isOpenAddGroup, setOpenAddGroup] = useState(false);
  const [isOpenAddRespondent, setOpenAddRespondent] = useState(false);

  const assignedGroups = useMemo(() => {
    return groups
      .filter((group) => group.tests.includes(Number(testId)))
      .map((group) => {
        const groupUsers = users.filter((u) => u.groups.includes(group.id));
        const completedCount = groupUsers.filter((u) =>
          u.completedTests.includes(Number(testId)),
        ).length;

        return {
          ...group,
          completedCount,
          progress: `${completedCount} / ${groupUsers.length}`,
        };
      });
  }, [testId]);

  const availableGroups = useMemo(() => {
    return groups.filter((g) => !g.tests.includes(Number(testId)));
  }, [testId]);

  const availableUsers = useMemo(() => {
    return users.filter((u) => !u.openTests.includes(Number(testId)));
  }, [testId]);

  const assignedUsers = useMemo(() => {
    return users
      .filter((user) => user.openTests.includes(Number(testId)))
      .map((user) => {
        const result = testResults.find(
          (r) => r.userId === user.id && r.testId === Number(testId),
        );

        return {
          ...user,
          status: user.completedTests.includes(Number(testId))
            ? "Пройден"
            : "Не пройден",
          score: result ? result.score : -1,
          timeSpent: result ? result.timeSpent : 0,
        };
      });
  }, [testId]);

  const groupColumns = [
    { key: "name", title: "Название группы" },
    { key: "usersCount", title: "Участников", thStyle: { width: "250px" } },
    {
      key: "progress",
      title: "Прогресс (прошли)",
      thStyle: { width: "250px" },
    },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <Button
          onClick={() => console.log("Удалить", row.id)}
          className={classes.cancelBtn}
        >
          Удалить
        </Button>
      ),
      thStyle: { width: "60px" },
    },
  ];

  const userColumns = [
    { key: "fullName", title: "ФИО респондента" },
    {
      key: "status",
      title: "Статус",
      render: (row) => (
        <span style={{ color: row.status === "Пройден" ? "green" : "#e65100" }}>
          {row.status}
        </span>
      ),
      thStyle: { width: "150px" },
    },
    {
      key: "score",
      title: "Балл",
      render: (row) => (row.score === -1 ? "—" : row.score),
      thStyle: { width: "150px" },
    },
    {
      key: "timeSpent",
      title: "Время",
      render: (row) =>
        row.timeSpent > 0
          ? `${Math.floor(row.timeSpent / 60)} мин. ${row.timeSpent % 60} сек.`
          : "—",
      thStyle: { width: "200px" },
    },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <Button
          onClick={() => console.log("Удалить", row.id)}
          className={classes.cancelBtn}
        >
          Удалить
        </Button>
      ),
      thStyle: { width: "60px" },
    },
  ];

  const {
    search: groupSearch,
    setSearch: setGroupSearch,
    sortKey: groupSortKey,
    sortOrder: groupSortOrder,
    page: groupPage,
    setPage: setGroupPage,
    totalPages: groupTotalPages,
    paginatedData: paginatedGroups,
    handleSort: handleSortGroups,
  } = useTable({
    data: assignedGroups,
    columns: groupColumns,
    pageSize: 5,
  });

  const {
    search: userSearch,
    setSearch: setUserSearch,
    sortKey: userSortKey,
    sortOrder: userSortOrder,
    page: userPage,
    setPage: setUserPage,
    totalPages: userTotalPages,
    paginatedData: paginatedUsers,
    handleSort: handleSortUsers,
  } = useTable({
    data: assignedUsers,
    columns: userColumns,
    pageSize: 5,
  });

  return (
    <div>
      <Header
        title={test.name}
        crumbs={[{ label: "Тесты", to: "/tests" }, { label: test.name }]}
      />
      <DataCard
        actions={
          <>
            <Button onClick={() => setEditTest(true)}>Редактировать</Button>
            <Button className={classes.cancelBtn}>Удалить</Button>
          </>
        }
      >
        <p>
          <strong>Название теста: </strong>
          {test.name}
        </p>
        <p>
          <strong>Описание: </strong>
          Больша́я пятёрка — диспозициональная (от англ. disposition —
          предрасположенность) модель личности человека, отражающая восприятие
          людей друг другом. В её основе лежит лексический подход, использующий
          факторный анализ словесных описаний характеристик человека. Эта модель
          продолжает линию лексических исследований, начатую Г. Олпортом, Г.
          Айзенком и Р. Кеттелом, которые предполагали, что язык может отражать
          аспекты личности, характеризующие адаптацию человека к социальной
          среде с учётом биологических свойств индивида.
        </p>
        <p>
          <strong>Ссылка на тест: </strong>
          <a href="https://psytests.org/big5/ineoA-run.html">
            https://psytests.org/big5/ineoA-run.html
          </a>
        </p>
      </DataCard>
      <div>
        <H2>Группы</H2>
        <ToolBar>
          <Search
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
          />
          <Button onClick={() => setOpenAddGroup(true)}>Добавить группу</Button>
        </ToolBar>
        <Table
          data={paginatedGroups}
          columns={groupColumns}
          onSort={handleSortGroups}
          sortKey={groupSortKey}
          sortOrder={groupSortOrder}
        />
        {groupTotalPages > 1 && (
          <MyPagination
            totalPages={groupTotalPages}
            page={groupPage}
            setPage={setGroupPage}
          />
        )}
      </div>
      <div>
        <H2>Респонденты</H2>
        <ToolBar>
          <Search
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <Button onClick={() => setOpenAddRespondent(true)}>Добавить респондента</Button>
        </ToolBar>
        <Table
          data={paginatedUsers}
          columns={userColumns}
          onSort={handleSortUsers}
          sortKey={userSortKey}
          sortOrder={userSortOrder}
        />

        {userTotalPages > 1 && (
          <MyPagination
            totalPages={userTotalPages}
            page={userPage}
            setPage={setUserPage}
          />
        )}
      </div>

      <EditTest open={isEditTest} onClose={() => setEditTest(false)} />
      <OpenTestToGroupModal
        open={isOpenAddGroup}
        onClose={() => setOpenAddGroup(false)}
        groups={availableGroups}
        test={test}
        onAdd={(ids) => console.log("Добавляем группы с ID:", ids)}
      />
      <OpenTestToUserModal
        open={isOpenAddRespondent}
        onClose={() => setOpenAddRespondent(false)}
        users={availableUsers}
        test={test}
        onAdd={(ids) => console.log("Добавляем юзеров с ID:", ids)}
      />
    </div>
  );
}
