import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { groups } from "../../utils/groups";
import { users } from "../../utils/users";
import { tests } from "../../utils/tests";
import Header from "../../components/UI/header/Header";
import Button from "../../components/UI/button/Button";
import EditGroup from "../../components/modals/ModalsForGroups/editGroup/EditGroup";
import Table from "../../components/tables/table/Table";
import MyPagination from "../../components/UI/pagination/MyPagination";
import Search from "../../components/UI/search/Search";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import { useTable } from "../../utils/hooks/useTable";
import OpenTests from "../../components/modals/openTests/OpenTests";
import AddUserToGroupModal from "../../components/modals/addUserToGroupModal/AddUserToGroupModal";
import H2 from "../../components/UI/h2/H2";
import classes from "./groups.module.css";

export default function GroupDetailedData() {
  const { id } = useParams();
  const groupId = Number(id);
  const [groupsData, setGroupsData] = useState(groups);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openTestModal, setOpenTestModal] = useState(false);
  const navigate = useNavigate()

  const group = groupsData.find((g) => g.id === groupId);
  const groupTests = tests.filter((t) => group.tests.includes(t.id));
  const groupUsers = users
    .filter((u) => u.groups.includes(groupId))
    .map((u) => ({
      ...u,
      completedTestsInGroup: u.completedTests.filter((testId) =>
        group.tests.includes(testId),
      ),
    }));

  const testColumns = [
    { key: "name", title: "Название теста", render: (row) => row.name },
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

  const userColumns = [
    { key: "fullName", title: "ФИО", render: (row) => row.fullName, thStyle: {width: "300px"}},
    {
      key: "completedTests",
      title: "Пройденные тесты",
      render: (row) =>
        row.completedTestsInGroup
          .map((id) => tests.find((t) => t.id === id)?.name)
          .join(", "),
    },
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
  } = useTable({ data: groupTests, columns: testColumns, pageSize: 5 });

  const {
    search: usersSearch,
    setSearch: setUsersSearch,
    sortKey: usersSortKey,
    sortOrder: usersSortOrder,
    page: usersPage,
    setPage: setUsersPage,
    totalPages: usersTotalPages,
    paginatedData: paginatedUsers,
    handleSort: handleSortUsers,
  } = useTable({ data: groupUsers, columns: userColumns, pageSize: 5 });

  const handleSave = (updatedGroup) => {
    setGroupsData((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
    );
  };

  const handleRowClickOnUser = (user) => {
    navigate(`/respondents/${user.id}`)
  }

  return (
    <div>
      <Header
        title={group.name}
        crumbs={[{ label: "Группы", to: "/groups" }, { label: group.name }]}
      >
        <Button onClick={() => setOpenEdit(true)}>Редактировать группу</Button>
      </Header>

      <div className={classes.cardWrapper}>
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

      <div className={classes.cardWrapper}>
        <H2>Респонденты</H2>
        <ToolBar>
        <Search
          value={usersSearch}
          onChange={(e) => setUsersSearch(e.target.value)}
        />
        <Button onClick={() => setOpenAddUser(true)}>
          Добавить респондента
        </Button>
      </ToolBar>
      <Table
        data={paginatedUsers}
        columns={userColumns}
        onSort={handleSortUsers}
        sortKey={usersSortKey}
        sortOrder={usersSortOrder}
        onRowClick={handleRowClickOnUser}
      />
      {usersTotalPages > 1 && (
        <MyPagination
          totalPages={usersTotalPages}
          page={usersPage}
          setPage={setUsersPage}
        />
      )}
      </div>

      <EditGroup
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        group={group}
        onSave={handleSave}
      />

      <OpenTests
        open={openTestModal}
        onClose={() => setOpenTestModal(false)}
        user={null}
        onAdd={() => console.log("логика добавления")}
        tests={tests}
      />

      <AddUserToGroupModal
        open={openAddUser}
        onClose={() => setOpenAddUser(false)}
        users={users.filter((u) => !u.groups.includes(groupId))}
        onAdd={(selectedUserIds) => {
          console.log("Добавляем пользователей с ID:", selectedUserIds);
        }}
      />
    </div>
  );
}
