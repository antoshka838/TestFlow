import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import { $authHost } from "../../http";
import Loader from "../../components/UI/loader/Loader";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";
import { Checkbox } from "@mui/material";

export default function GroupDetailedData() {
  const { id } = useParams();
  const groupId = Number(id);
  const navigate = useNavigate();
  const showToast = useToast();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [dbGroups, setDbGroups] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [dbTests, setDbTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openEdit, setOpenEdit] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openTestModal, setOpenTestModal] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [groupsRes, usersRes, testsRes] = await Promise.all([
        $authHost.get("api/group"),
        $authHost.get("api/user"),
        $authHost.get("api/test"),
      ]);
      setDbGroups(groupsRes.data.map((g) => ({ ...g, tests: g.tests || [] })));
      setDbUsers(
        usersRes.data.map((u) => ({
          ...u,
          groups: u.groups || [],
          openTests: u.openTests || [],
          completedTests: u.completedTests || [],
        })),
      );
      setDbTests(testsRes.data);
    } catch (error) {
      console.error("Ошибка загрузки данных: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const group = dbGroups.find((g) => Number(g.id) === groupId);

  const groupTests = group
    ? dbTests.filter((t) => group.tests.includes(t.id))
    : [];

  const groupUsers = group
    ? dbUsers
        .filter((u) => u.groups.includes(groupId))
        .map((u) => ({
          ...u,
          completedTestsInGroup: u.completedTests.filter((testId) =>
            group.tests.includes(testId),
          ),
        }))
    : [];

  const availableTests = group
    ? dbTests.filter((t) => !group.tests.includes(t.id))
    : [];
  const availableUsers = group
    ? dbUsers.filter((u) => !u.groups.includes(groupId))
    : [];

  const handleAddTestsToGroup = async (selectedTestIds) => {
    try {
      const newTestList = Array.from(
        new Set([...group.tests, ...selectedTestIds]),
      );

      await $authHost.post("api/group/add-tests", {
        groupId: group.id,
        testIds: newTestList,
      });

      setDbGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, tests: newTestList } : g)),
      );
      showToast(`Тест успешно открыт!`, "success");
      setOpenTestModal(false);
    } catch (error) {
      console.error("Ошибка назначения тестов:", error);
      showToast(`Ошибка открытия теста ${error}`, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    try {
      if (deleteType === "test") {
        const filteredTests = group.tests.filter(
          (id) => id !== itemToDelete.id,
        );
        await $authHost.post("api/group/add-tests", {
          groupId: group.id,
          testIds: filteredTests,
        });

        setDbGroups((prev) =>
          prev.map((g) =>
            g.id === group.id ? { ...g, tests: filteredTests } : g,
          ),
        );
        showToast("Тест успешно отвязан от группы!", "success");
      } else if (deleteType === "user") {
        await $authHost.post("api/user/remove-group", {
          userId: itemToDelete.id,
          groupId: group.id,
        });

        setDbUsers((prev) =>
          prev.map((u) => {
            if (u.id === itemToDelete.id) {
              return {
                ...u,
                groups: u.groups.filter((gId) => gId !== group.id),
              };
            }
            return u;
          }),
        );
        showToast("Пользователь успешно исключен из группы!", "success");
      }

      setItemToDelete(null);
      setDeleteType(null);
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      showToast(
        error.response?.data?.message || "Ошибка при выполнении действия",
        "error",
      );
    }
  };

  const handleAddUsersToGroup = async (selectedUserIds) => {
    try {
      await Promise.all(
        selectedUserIds.map((userId) =>
          $authHost.post("api/user/add-groups", {
            userId: userId,
            groupIds: [group.id],
          }),
        ),
      );

      setDbUsers((prev) =>
        prev.map((u) => {
          if (selectedUserIds.includes(u.id)) {
            const updatedGroups = Array.from(new Set([...u.groups, group.id]));
            return { ...u, groups: updatedGroups };
          }
          return u;
        }),
      );

      setOpenAddUser(false);
      showToast("Пользователь успешно добавлен!", "success");
    } catch (error) {
      console.error("Ошибка добавления пользователей: ", error);
      showToast(`Ошибка добавления пользователей: ${error}`, "error");
    }
  };

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(groupUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOneUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkRemoveUsers = async () => {
    try {
      await Promise.all(
        selectedUserIds.map((userId) =>
          $authHost.post("api/user/remove-group", {
            userId: userId,
            groupId: group.id,
          }),
        ),
      );

      setDbUsers((prev) =>
        prev.map((u) => {
          if (selectedUserIds.includes(u.id)) {
            return {
              ...u,
              groups: u.groups.filter((gId) => gId !== group.id),
            };
          }
          return u;
        }),
      );

      showToast(
        `Исключено пользователей: ${selectedUserIds.length}`,
        "success",
      );
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Ошибка массового исключения: ", error);
      showToast("Ошибка при исключении пользователей", "error");
    }
  };

  const testColumns = [
    { key: "name", title: "Название теста", render: (row) => row.name },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <Button
          style={{ color: "#FFFFFF", backgroundColor: "#E52327" }}
          onClick={(e) => {
            e.stopPropagation();
            setItemToDelete(row);
            setDeleteType("test");
          }}
        >
          Удалить
        </Button>
      ),
      thStyle: { width: "80px" },
    },
  ];

  const userColumns = [
    {
      key: "fullName",
      title: "ФИО",
      render: (row) => row.fullName,
      thStyle: { width: "300px" },
    },
    {
      key: "completedTests",
      title: "Пройденные тесты",
      render: (row) =>
        row.completedTestsInGroup.length > 0
          ? row.completedTestsInGroup
              .map((id) => dbTests.find((t) => t.id === id)?.name)
              .filter(Boolean)
              .join(", ")
          : "—",
      thStyle: { width: "300px" },
    },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <Button
          style={{ color: "#FFFFFF", backgroundColor: "#E52327" }}
          onClick={(e) => {
            e.stopPropagation();
            setItemToDelete(row);
            setDeleteType("user");
          }}
        >
          Удалить
        </Button>
      ),
      thStyle: { width: "50px" },
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

  const finalUserColumns = [
    {
      key: "checkbox",
      title: (
        <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default" }}>
          <Checkbox
            size="small"
            checked={
              selectedUserIds.length === groupUsers.length &&
              groupUsers.length > 0
            }
            onChange={handleSelectAllUsers}
          />
        </div>
      ),
      render: (row) => (
        <Checkbox
          size="small"
          checked={selectedUserIds.includes(row.id)}
          onChange={() => handleSelectOneUser(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      thStyle: { width: "40px", textAlign: "center", cursor: "default" },
    },
    ...userColumns,
  ];

  if (isLoading) {
    return (
      <div>
        <Header title="Загрузка..." />
        <Loader />
      </div>
    );
  }
  if (!group) return <Header title="Группа не найдена" />;

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
          <div>
            {selectedUserIds.length > 0 && (
              <Button
                style={{
                  backgroundColor: "#E52327",
                  color: "white",
                  marginRight: "15px",
                }}
                onClick={handleBulkRemoveUsers}
              >
                Исключить ({selectedUserIds.length})
              </Button>
            )}
            <Button onClick={() => setOpenAddUser(true)}>
              Добавить респондента
            </Button>
          </div>
        </ToolBar>
        <Table
          data={paginatedUsers}
          columns={finalUserColumns}
          onSort={handleSortUsers}
          sortKey={usersSortKey}
          sortOrder={usersSortOrder}
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
        onSave={async (updatedGroup) => {
          try {
            await $authHost.put(`api/group/${updatedGroup.id}`, {
              name: updatedGroup.name,
            });

            setDbGroups((prev) =>
              prev.map((g) =>
                g.id === updatedGroup.id
                  ? { ...g, name: updatedGroup.name }
                  : g,
              ),
            );

            setOpenEdit(false);
            showToast("Название группы изменено", "success");
          } catch (error) {
            console.error("Ошибка при сохранении названия группы:", error);
            showToast(
              error.response?.data?.message || "Ошибка при сохранении",
              "error",
            );
          }
        }}
      />

      <OpenTests
        open={openTestModal}
        onClose={() => setOpenTestModal(false)}
        user={group}
        onAdd={handleAddTestsToGroup}
        tests={availableTests}
      />

      <AddUserToGroupModal
        open={openAddUser}
        onClose={() => setOpenAddUser(false)}
        users={availableUsers}
        onAdd={handleAddUsersToGroup}
      />

      <ConfirmModal
        open={!!itemToDelete}
        onClose={() => {
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteType === "user" ? "Исключение из группы" : "Удаление теста"
        }
      >
        <p>
          {deleteType === "user" ? (
            <>
              Вы уверены, что хотите исключить пользователя{" "}
              <strong>{itemToDelete?.fullName}</strong> из этой группы?
            </>
          ) : (
            <>
              Вы уверены, что хотите убрать тест{" "}
              <strong>{itemToDelete?.name}</strong> из списка доступных для этой
              группы?
            </>
          )}
        </p>
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          Само удаление из системы не произойдет, изменится только доступ к
          данным в этой группе.
        </p>
      </ConfirmModal>
    </div>
  );
}
