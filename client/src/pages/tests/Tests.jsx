import React, { useState, useMemo, useEffect } from "react";
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
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";
import Message from "../../components/tableMessage/Message";
import { $authHost } from "../../http";
import CreateNewTest from "../../components/modals/TestsModals/createNewTest/CreateNewTest";
import Loader from "../../components/UI/loader/Loader";
import { useToast } from "../../context/ToastContext";

export default function Tests() {
  const [dbTests, setDbTests] = useState([]);
  const [dbGroups, setDbGroups] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);

  const [selectedTest, setSelectedTest] = useState(null);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isCreateTestModalOpen, setCreateTestModalOpen] = useState(false);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const showToast = useToast();

  const fetchTests = async () => {
    try {
      const response = await $authHost.get("api/test");
      setDbTests(response.data);
    } catch (error) {
      console.error("Ошибка загрузки тестов: ", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await $authHost.get("api/group");
      const formattedGroups = response.data.map((g) => ({
        ...g,
        tests: g.tests || [],
      }));
      setDbGroups(formattedGroups);
    } catch (error) {
      console.error("Ошибка загрузки групп: ", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await $authHost.get("api/user");
      const formattedUsers = response.data.map((u) => ({
        ...u,
        openTests: u.openTests || [],
      }));
      setDbUsers(formattedUsers);
    } catch (error) {
      console.error("Ошибка при загрузке пользователей: ", error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchTests(), fetchGroups(), fetchUsers()])
      .catch((err) => {
        console.error(err);
        showToast("Ошибка при загрузке данных", "error");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getAssignedGroups = (testId) => {
    return dbGroups
      .filter((group) => group.tests?.includes(testId))
      .map((group) => group.name)
      .join(", ");
  };

  const enrichedTests = useMemo(() => {
    return dbTests.map((test) => ({
      ...test,
      individualCount: dbUsers.filter((u) => u.openTests?.includes(test.id))
        .length,
      assignedGroupsText: getAssignedGroups(test.id),
    }));
  }, [dbTests, dbUsers, getAssignedGroups]);

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
    return dbGroups.filter((g) => !g.tests?.includes(selectedTest.id));
  }, [selectedTest, dbGroups]);

  const availableUsers = useMemo(() => {
    if (!selectedTest) return [];
    return dbUsers.filter((u) => !u.openTests?.includes(selectedTest.id));
  }, [selectedTest, dbUsers]);

  const handleDeleteTest = (test) => {
    setTestToDelete(test);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;

    try {
      await $authHost.delete(`api/test/${testToDelete.id}`);
      setDeleteModalOpen(false);

      showToast("Тест успешно удален", "success");
      fetchTests();
    } catch (error) {
      console.error("Ошибка при удалении", error);
      showToast(
        error.response?.data?.message || "Ошибка при удалении теста",
        "error",
      );
      setDeleteModalOpen(false);
    }
  };

  const handleRowClick = (test) => {
    navigate(`/tests/${test.id}`);
  };

  const handleAssignToGroups = async (groupIds) => {
    try {
      await Promise.all(
        groupIds.map((groupId) => {
          const targetGroup = dbGroups.find((g) => g.id === groupId);
          const newTests = Array.from(
            new Set([...targetGroup.tests, selectedTest.id]),
          );
          return $authHost.post("api/group/add-tests", {
            groupId: groupId,
            testIds: newTests,
          });
        }),
      );
      setGroupModalOpen(false);
      showToast("Тест успешно назначен выбранным группам!", "success");
      fetchGroups();
    } catch (error) {
      console.error("Ошибка при назначении группам:", error);
      showToast("Ошибка при назначении теста группам", "error");
    }
  };

  const handleAssignToUsers = async (userIds) => {
    try {
      await Promise.all(
        userIds.map((userId) => {
          const targetUser = dbUsers.find((u) => u.id === userId);
          const newTests = Array.from(
            new Set([...targetUser.openTests, selectedTest.id]),
          );
          return $authHost.post("api/user/add-tests", {
            userId: userId,
            testIds: newTests,
          });
        }),
      );
      setUserModalOpen(false);
      showToast("Тест успешно назначен выбранным пользователям!", "success");
      fetchUsers();
    } catch (error) {
      console.error("Ошибка при назначении пользователям:", error);
      showToast("Ошибка при назначении теста пользователям", "error");
    }
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
        return row.assignedGroupsText ? (
          row.assignedGroupsText
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
  } = useTable({ data: enrichedTests, columns, searchKeys: ["name"] });

  if (isLoading) {
    return (
      <div>
        <Header title={"Тесты"} />
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Header title={"Тесты"} />
      <ToolBar>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => setCreateTestModalOpen(true)}>
          Создать тест
        </Button>
      </ToolBar>

      {paginatedData.length > 0 ? (
        <Table
          data={paginatedData}
          columns={columns}
          onSort={handleSort}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onRowClick={handleRowClick}
        />
      ) : (
        <Message>
          {search
            ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска."
            : "У вас пока нет созданных тестов."}
        </Message>

        // <div >
        //   {search
        //     ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска."
        //     : "У вас пока нет созданных тестов."}
        // </div>
      )}

      {totalPages > 1 && (
        <MyPagination totalPages={totalPages} page={page} setPage={setPage} />
      )}

      <OpenTestToGroupModal
        open={isGroupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        test={selectedTest}
        groups={availableGroups}
        onAdd={handleAssignToGroups}
      />

      <OpenTestToUserModal
        open={isUserModalOpen}
        onClose={() => setUserModalOpen(false)}
        test={selectedTest}
        users={availableUsers}
        onAdd={handleAssignToUsers}
      />

      <CreateNewTest
        open={isCreateTestModalOpen}
        onClose={() => setCreateTestModalOpen(false)}
        onSuccess={() => {
          fetchTests();
        }}
      />

      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
        onConfirm={confirmDelete}
        title="Удаление теста"
      >
        <p>
          Вы уверены, что хотите удалить тест{" "}
          <strong>"{testToDelete?.name}"</strong>? Это действие нельзя отменить,
          и все связанные с ним результаты могут быть потеряны.
        </p>
      </ConfirmModal>
    </div>
  );
}
