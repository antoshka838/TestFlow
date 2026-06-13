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
import { Checkbox } from "@mui/material";

import { $authHost } from "../../http";
import { useTable } from "../../utils/hooks/useTable";
import { useNavigate } from "react-router";
import Loader from "../../components/UI/loader/Loader";
import { useToast } from "../../context/ToastContext";
import Message from "../../components/tableMessage/Message";

export default function Respondents() {
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openTestModal, setOpenTestModal] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpan] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = useToast();
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);

  const [dbUsers, setDbUsers] = useState([]);
  const [dbTests, setDbTests] = useState([]);
  const [dbGroups, setDbGroups] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await $authHost.get("api/user");

      const formattedUsers = response.data.map((user) => ({
        ...user,
        groups: user.groups || [],
        openTests: user.openTests || [],
        completedTests: user.completedTests || [],
      }));
      setDbUsers(formattedUsers);
    } catch (error) {
      console.error("Ошибка при загрузке пользователей: ", error);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await $authHost.get("api/test");
      setDbTests(response.data);
    } catch (error) {
      console.error("Ошибка загрузки тестов", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await $authHost.get("api/group");
      setDbGroups(response.data);
    } catch (error) {
      console.error("Ошибка загрузки групп", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchGroups(), fetchTests()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getTestName = (id) => {
    return dbTests.find((t) => t.id === id)?.name;
  };

  const getGroupName = (id) => {
    return dbGroups.find((g) => g.id === id)?.name;
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
      showToast("Пользователь успешно удален", "success");
      fetchUsers();
    } catch (error) {
      console.error("Ошибка при удалении: ", error);
      showToast("Ошибка при удалении", "error");
    }
  };

  const handleAddGroup = (user) => {
    setSelectedUser(user);
    setOpenGroupModal(true);
  };

  const handleAddGroupsToUser = async (groupIds) => {
    try {
      await $authHost.post("api/user/add-groups", {
        userId: selectedUser.id,
        groupIds: groupIds,
      });
      setOpenGroupModal(false);
      showToast("Пользователь успешно добалвен в группу", "succes");
      fetchUsers();
    } catch (error) {
      console.error("Ошибка при добавлении в группы:", error);
      showToast("Ошибка при добавлении в группы", "error");
    }
  };

  const handleOpenTest = (user) => {
    setSelectedUser(user);
    setOpenTestModal(true);
  };

  const handleOpenTestsForUser = async (testIds) => {
    try {
      await $authHost.post("api/user/add-tests", {
        userId: selectedUser.id,
        testIds: testIds,
      });
      setOpenTestModal(false);
      showToast("Тест успешно назначен пользователю", "success");
      fetchUsers();
    } catch (error) {
      console.error("Ошибка при назначении тестов:", error);
      showToast("Ошибка при назначении тестов", "error");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsersIds(enrichedUsers.map((u) => u.id));
    } else {
      setSelectedUsersIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUsersIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    try {
      await $authHost.delete("api/user/bulk-delete", {
        data: { userIds: selectedUsersIds },
      });
      showToast(`Успешно удалено (${selectedUsersIds.length})`, "success");
      setSelectedUsersIds([]);
      fetchUsers();
    } catch (error) {
      console.error(error);
      showToast("Ошибка при удалении пользователей", "error");
    }
  };

  const enrichedUsers = useMemo(() => {
    return dbUsers.map((user) => {
      const personalTests = user.openTests || [];

      let groupTests = [];
      if (user.groups && user.groups.length > 0) {
        user.groups.forEach((groupId) => {
          const group = dbGroups.find((g) => g.id === groupId);
          if (group && group.tests) {
            groupTests = [...groupTests, ...group.tests];
          }
        });
      }

      const allAssignedTests = Array.from(
        new Set([...personalTests, ...groupTests]),
      );

      const completedTests = user.completedTests || [];
      const strictlyOpenTests = allAssignedTests.filter(
        (testId) => !completedTests.includes(testId),
      );

      return {
        ...user,
        allOpenTests: strictlyOpenTests,
      };
    });
  }, [dbUsers, dbGroups]);

  const availableGroups = useMemo(() => {
    if (!selectedUser) return [];
    const userGroups = selectedUser.groups || [];
    return dbGroups.filter((group) => !userGroups.includes(group.id));
  }, [selectedUser, dbGroups]);

  const availableTest = useMemo(() => {
    if (!selectedUser) return [];

    const userOpenTests = selectedUser.allOpenTests || [];
    const userCompletedTests = selectedUser.completedTests || [];

    return dbTests.filter(
      (test) =>
        !userOpenTests.includes(test.id) &&
        !userCompletedTests.includes(test.id),
    );
  }, [selectedUser, dbTests]);

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
        return row.groups.map(getGroupName).filter(Boolean).join(", ") || "-";
      },
      thStyle: { width: "150px", cursor: "pointer" },
    },
    {
      key: "openTests",
      title: "Открытые тесты",
      render: (row) => {
        if (!row.allOpenTests || row.allOpenTests.length === 0) return "-";
        return (
          row.allOpenTests.map(getTestName).filter(Boolean).join(", ") || "-"
        );
      },
      thStyle: { width: "300px", cursor: "pointer" },
    },
    {
      key: "completedTests",
      title: "Пройденные тесты",
      render: (row) => {
        if (!row.completedTests || row.completedTests.length === 0) return "-";
        return (
          row.completedTests.map(getTestName).filter(Boolean).join(", ") || "-"
        );
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
  } = useTable({ data: enrichedUsers, columns, searchKeys: ["fullName"] });

  const finalColumns = [
    {
      key: "checkbox",
      title: (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            size="small"
            checked={
              selectedUsersIds.length === enrichedUsers.length &&
              enrichedUsers.length > 0
            }
            onChange={handleSelectAll}
          />
        </div>
      ),
      render: (row) => (
        <Checkbox
          size="small"
          checked={selectedUsersIds.includes(row.id)}
          onChange={() => handleSelectOne(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      thStyle: { width: "40px", textAlign: "center" },
    },
    ...columns,
  ];

  if (isLoading) {
    return (
      <div>
        <Header title={"Респонденты"} />
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Header title={"Респонденты"} />
      <ToolBar>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        <div>
          {selectedUsersIds.length > 0 && (
            <Button
              className={classes.cancelBtn}
              onClick={handleBulkDelete}
              style={{ marginRight: "15px" }}
            >
              Удалить ({selectedUsersIds.length})
            </Button>
          )}
          <Button onClick={() => setOpenAddUser(true)}>
            Добавить респондента
          </Button>
        </div>
      </ToolBar>
      {paginatedData.length > 0 ? (
        <Table
        columns={finalColumns}
        data={paginatedData}
        onSort={handleSort}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onRowClick={handleRowClick}
        style={{tableLayout: "fixed"}}
      />
      ) : (
        <Message>
          {search
            ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска."
            : "У вас пока нет респондетов."}
        </Message>
      )}
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
