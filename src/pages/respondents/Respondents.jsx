import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/UI/header/Header";
import Search from "../../components/UI/search/Search";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Button from "../../components/UI/button/Button";
import Table from "../../components/tables/table/Table";
import classes from "./respondents.module.css";
import RowActionsRespondents from "../../components/tables/rowActions/RowActionsRespondents";
import AddUserModal from "../../components/modals/ModalsForRespondents/addUserModal/AddUserModal";
import MyPagination from "../../components/UI/pagination/MyPagination";
import AddGroupModal from "../../components/modals/ModalsForRespondents/addGroupModal/AddGroupModal";
import OpenTestUserModal from "../../components/modals/openTests/OpenTests";
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";

import { $authHost } from "../../http";
import { tests } from "../../utils/tests";
import { groups } from "../../utils/groups";
import { useTable } from "../../utils/hooks/useTable";
import { useNavigate } from "react-router";

export default function Respondents() {
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openTestModal, setOpenTestModal] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpan] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  const [dbUsers, setDbUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await $authHost.get("api/user");

      const formattedUsers = response.data.map((user) => ({
        ...user,
        groups: user.groups,
        openTests: user.openTests,
        completedTests: user.completedTests,
      }));

      setDbUsers(formattedUsers);
    } catch (error) {
      console.error("Ошибка при загрузке пользователей: ", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getTestName = (id) => {
    return tests.find((t) => t.id === id)?.name;
  };

  const getGroupName = (id) => {
    return groups.find((g) => g.id === id)?.name;
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpan(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await $authHost.delete(`api/user/${userToDelete.id}`);

      setDeleteModalOpan(false);
      setUserToDelete(null);

      fetchUsers();
    } catch (error) {
      console.error("Ошибка при удалении: ", error);
    }
  };

  const handleAddGroup = (user) => {
    setSelectedUser(user);
    setOpenGroupModal(true);
  };
  const handleAddGroupsToUser = (groups) => {
    console.log("Добавить", selectedUser, "в", groups);

    // тут можно обновить users
  };

  const handleOpenTest = (user) => {
    setSelectedUser(user);
    setOpenTestModal(true);
  };
  const handleOpenTestsForUser = (tests) => {
    console.log("Открыть тесты", tests, "для", selectedUser);

    // здесь потом будет запрос на backend
  };

  const availableGroups = useMemo(() => {
    if (!selectedUser) return [];

    return groups.filter((group) => !selectedUser.groups.includes(group.id));
  }, [selectedUser]);

  const availableTest = useMemo(() => {
    if (!selectedUser) return [];

    return tests.filter(
      (test) =>
        !selectedUser.openTests.includes(test.id) &&
        !selectedUser.completedTests.includes(test.id),
    );
  }, [selectedUser]);

  const handleRowClick = (user) => {
    navigate(`/respondents/${user.id}`);
  };

  const columns = [
    {
      key: "fullName",
      title: "ФИО",
      render: (row) => {
        const parts = row.fullName.split(" ");
        if (parts.length < 2) return row.fullName;

        const lastName = parts[0];
        const firstName = parts[1];
        const middleName = parts[2] ? `${parts[2][0]}.` : "";

        return `${lastName} ${firstName[0]}.${middleName}`;
      },
      thStyle: { width: "125px", cursor: "pointer" },
    },
    {
      key: "groups",
      title: "Группы",
      render: (row) => {
        if (!row.groups || row.groups.length === 0) return "-";
        return row.groups.map(getGroupName).join(", ");
      },
      thStyle: { width: "125px", cursor: "pointer" },
    },
    {
      key: "openTests",
      title: "Открытые тесты",
      render: (row) => {
        if (!row.openTests || row.openTests.length === 0) return "-";
        return row.openTests.map(getTestName).join(", ");
      },
      thStyle: { width: "300px", cursor: "pointer" },
    },
    {
      key: "completedTests",
      title: "Пройденные тесты",
      render: (row) => {
        if (!row.completedTests || row.completedTests.length === 0) return "-";
        return row.completedTests.map(getTestName).join(", ");
      },
      thStyle: { width: "300px", cursor: "pointer" },
    },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <RowActionsRespondents
          user={row}
          onDelete={handleDelete}
          onAddGroup={handleAddGroup}
          onOpenTest={handleOpenTest}
        />
      ),
      thStyle: { width: "60px" },
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
  } = useTable({ data: dbUsers, columns });

  return (
    <div>
      <Header title={"Респонденты"} />
      <ToolBar>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => setOpenAddUser(true)}>
          Добавить респондента
        </Button>
      </ToolBar>
      <Table
        columns={columns}
        data={paginatedData}
        onSort={handleSort}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onRowClick={handleRowClick}
      />
      {totalPages > 1 && (
        <MyPagination totalPages={totalPages} page={page} setPage={setPage} />
      )}
      <AddUserModal
        open={openAddUser}
        onClose={() => setOpenAddUser(false)}
        onCreate={fetchUsers}
      />
      <AddGroupModal
        open={openGroupModal}
        onClose={() => setOpenGroupModal(false)}
        onAdd={handleAddGroupsToUser}
        groups={availableGroups}
      />
      <OpenTestUserModal
        open={openTestModal}
        onClose={() => setOpenTestModal(false)}
        user={selectedUser}
        onAdd={handleOpenTestsForUser}
        tests={availableTest}
      />
      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setDeleteModalOpan(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Удаление респондента"
      >
        <p>
          Вы уверены, что хотите удалить респондента{" "}
          <strong>{userToDelete?.fullName}</strong>? Это действие необратимо.
        </p>
      </ConfirmModal>
    </div>
  );
}
