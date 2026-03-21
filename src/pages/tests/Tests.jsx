import React, { useState, useMemo } from "react";
import Header from "../../components/UI/header/Header";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import Button from "../../components/UI/button/Button";
import Table from "../../components/tables/table/Table";
import MyPagination from "../../components/UI/pagination/MyPagination";
import RowActionsTests from "../../components/tables/rowActions/RowActionsTests";
import { useTable } from "../../utils/hooks/useTable";
import { useNavigate } from "react-router";
import OpenTestToGroupModal from "../../components/modals/TestsModals/openTestToGroupModal/OpenTestToGroupModal";
import OpenTestToUserModal from "../../components/modals/TestsModals/openTestToUserModal/OpenTestToUserModal";

import { tests } from "../../utils/tests";
import { groups } from "../../utils/groups";
import { users } from "../../utils/users";
import CreateNewTest from "../../components/modals/TestsModals/createNewTest/CreateNewTest";

export default function Tests() {
  const enrichedTests = useMemo(() => {
    return tests.map((test) => ({
      ...test,
      individualCount: users.filter((u) => u.openTests.includes(test.id))
        .length,
      assignedGroupsText: groups
        .filter((g) => g.tests?.includes(test.id))
        .map((g) => g.name)
        .join(", "),
    }));
  }, []);

  const [selectedTest, setSelectedTest] = useState(null);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isCreateTestModalOpen, setCreateTestModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenForGroup = (test) => {
    setSelectedTest(test);
    setGroupModalOpen(true);
  };

  const handleOpenForUser = (test) => {
    setSelectedTest(test);
    setUserModalOpen(true);
  };

  const availableGroups = useMemo(() => {
    if (!selectedTest) return [];
    return groups.filter((g) => !g.tests?.includes(selectedTest.id));
  }, [selectedTest]);

  const availableUsers = useMemo(() => {
    if (!selectedTest) return [];
    return users.filter((u) => !u.openTests?.includes(selectedTest.id));
  }, [selectedTest]);

  const handleDeleteTest = (test) => {
    console.log("Удаляем тест:", test.id);
  };

  const getAssignedGroups = (testId) => {
    return groups
      .filter((group) => group.tests?.includes(testId))
      .map((group) => group.name)
      .join(", ");
  };

  const handleRowClick = (test) => {
    navigate(`/tests/${test.id}`);
  };

  const columns = [
    {
      key: "name",
      title: "Название теста",
      render: (row) => row.name,
    },
    {
      key: "assignedGroupsText",
      title: "Доступен группам",
      render: (row) => {
        const assigned = getAssignedGroups(row.id);
        return assigned ? (
          assigned
        ) : (
          <span style={{ color: "#ccc" }}>Не назначен</span>
        );
      },
    },
    {
      key: "individualCount",
      title: "Личный доступ",
      render: (row) =>
        row.individualCount > 0 ? `${row.individualCount} чел.` : "—",
      thStyle: { width: "150px" },
    },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <RowActionsTests
          test={row}
          onOpenGroup={handleOpenForGroup}
          onOpenUser={handleOpenForUser}
          onDelete={handleDeleteTest}
        />
      ),
      thStyle: { width: "80px" },
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
  } = useTable({ data: enrichedTests, columns });

  return (
    <div>
      <Header title={"Тесты"} />
      <ToolBar>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => setCreateTestModalOpen(true)}>
          Создать тест
        </Button>
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

      <OpenTestToGroupModal
        open={isGroupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        test={selectedTest}
        groups={availableGroups}
        onAdd={(groupIds) => {
          console.log(`Тест ${selectedTest.id} открыт группам:`, groupIds);
        }}
      />

      <OpenTestToUserModal
        open={isUserModalOpen}
        onClose={() => setUserModalOpen(false)}
        test={selectedTest}
        users={availableUsers}
        onAdd={(userIds) => {
          console.log(`Тест ${selectedTest.id} открыт пользователям:`, userIds);
        }}
      />

      <CreateNewTest
        open={isCreateTestModalOpen}
        onClose={() => setCreateTestModalOpen(false)}
      />
    </div>
  );
}
