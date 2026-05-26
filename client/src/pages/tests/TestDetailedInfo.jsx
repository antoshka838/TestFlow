import React, { useState, useMemo, useEffect } from "react";
import Header from "../../components/UI/header/Header";
import { useParams, useNavigate } from "react-router";
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
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";
import { $authHost } from "../../http";
import Loader from "../../components/UI/loader/Loader";
import { useToast } from "../../context/ToastContext";

export default function TestDetailedInfo() {
  const { testId } = useParams();
  const tId = Number(testId);
  const navigate = useNavigate();
  const showToast = useToast();

  const [dbTests, setDbTests] = useState([]);
  const [dbGroups, setDbGroups] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [dbResults, setDbResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditTest, setEditTest] = useState(false);
  const [isOpenAddGroup, setOpenAddGroup] = useState(false);
  const [isOpenAddRespondent, setOpenAddRespondent] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [groupToRemove, setGroupToRemove] = useState(null);
  const [userToRemove, setUserToRemove] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [testsRes, groupsRes, usersRes, resultsRes] = await Promise.all([
        $authHost.get("api/test"),
        $authHost.get("api/group"),
        $authHost.get("api/user"),
        $authHost.get(`api/test/${tId}/results`),
      ]);

      setDbTests(testsRes.data);
      setDbGroups(groupsRes.data.map((g) => ({ ...g, tests: g.tests || [] })));
      setDbUsers(
        usersRes.data.map((u) => ({
          ...u,
          groups: u.groups || [],
          openTests: u.openTests || [],
          completedTests: u.completedTests || [],
        })),
      );
      setDbResults(resultsRes.data);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const test = dbTests.find((t) => Number(t.id) === tId);

  const assignedGroups = useMemo(() => {
    if (!test || dbGroups.length === 0) return [];

    return dbGroups
      .filter((group) => group.tests.includes(tId))
      .map((group) => {
        const groupUsers = dbUsers.filter((u) => u.groups.includes(group.id));
        const completedCount = groupUsers.filter((u) =>
          u.completedTests.includes(tId),
        ).length;

        return {
          ...group,
          usersCount: groupUsers.length,
          progress: `${completedCount} / ${groupUsers.length}`,
        };
      });
  }, [tId, dbGroups, dbUsers, test]);

  const assignedUsers = useMemo(() => {
    if (!test || dbUsers.length === 0) return [];

    const groupsWithTest = dbGroups.filter((g) => g.tests.includes(tId));
    const groupIdsWithTest = groupsWithTest.map((g) => g.id);

    return dbUsers
      .filter((user) => {
        const hasPersonal = user.openTests.includes(tId);
        const hasGroup = user.groups.some((gId) =>
          groupIdsWithTest.includes(gId),
        );
        return hasPersonal || hasGroup;
      })
      .map((user) => {
        const hasPersonal = user.openTests.includes(tId);
        const userGroupsWithTest = groupsWithTest.filter((g) =>
          user.groups.includes(g.id),
        );

        let accessSource = "";
        if (hasPersonal && userGroupsWithTest.length > 0) {
          accessSource = `Лично + Группы (${userGroupsWithTest.map((g) => g.name).join(", ")})`;
        } else if (hasPersonal) {
          accessSource = "Лично";
        } else {
          accessSource = `Группа (${userGroupsWithTest.map((g) => g.name).join(", ")})`;
        }

        const testResult = dbResults.find((r) => r.userId === user.id);
        const isCompleted = !!testResult;

        let timeSpentInSeconds = 0;
        if (testResult && testResult.startedAt && testResult.completedAt) {
          timeSpentInSeconds = Math.round(
            (new Date(testResult.completedAt) -
              new Date(testResult.startedAt)) /
              1000,
          );
        }

        return {
          ...user,
          accessSource,
          hasPersonalAccess: hasPersonal,
          status: isCompleted ? "Пройден" : "Не пройден",
          score:
            isCompleted && testResult.score !== null ? testResult.score : -1,
          timeSpent: isCompleted ? timeSpentInSeconds : 0,
        };
      });
  }, [tId, dbUsers, dbGroups, test, dbResults]);

  const availableGroups = useMemo(() => {
    if (!test) return [];
    return dbGroups.filter((g) => !g.tests.includes(tId));
  }, [tId, dbGroups, test]);

  const availableUsers = useMemo(() => {
    if (!test) return [];

    return dbUsers.filter(
      (u) => !u.openTests.includes(tId) && !u.completedTests.includes(tId),
    );
  }, [tId, dbUsers, test]);

  const handleAddTestToGroups = async (groupIds) => {
    try {
      await Promise.all(
        groupIds.map((groupId) => {
          const targetGroup = dbGroups.find((g) => g.id === groupId);
          const newTests = Array.from(new Set([...targetGroup.tests, tId]));
          return $authHost.post("api/group/add-tests", {
            groupId: groupId,
            testIds: newTests,
          });
        }),
      );

      setDbGroups((prev) =>
        prev.map((g) =>
          groupIds.includes(g.id)
            ? { ...g, tests: Array.from(new Set([...g.tests, tId])) }
            : g,
        ),
      );
      setOpenAddGroup(false);
      showToast("Тест успешно назначен выбранным группам!", "success");
    } catch (error) {
      console.error("Ошибка при назначении теста группам:", error);
      showToast("Ошибка при назначении теста группам", "error");
    }
  };

  const handleRemoveGroup = async (groupId) => {
    if (!groupToRemove) return;
    try {
      const targetGroup = dbGroups.find((g) => g.id === groupToRemove.id);
      const filteredTests = targetGroup.tests.filter((id) => id !== tId);

      await $authHost.post("api/group/add-tests", {
        groupId: groupToRemove.id,
        testIds: filteredTests,
      });

      setDbGroups((prev) =>
        prev.map((g) =>
          g.id === groupToRemove.id ? { ...g, tests: filteredTests } : g,
        ),
      );
      setGroupToRemove(null);
      showToast("Доступ для группы успешно закрыт", "success");
    } catch (error) {
      console.error("Ошибка удаления группы:", error);
      showToast("Ошибка при закрытии доступа", "error");
    }
  };

  const handleAddTestToUsers = async (userIds) => {
    try {
      await Promise.all(
        userIds.map((userId) => {
          const targetUser = dbUsers.find((u) => u.id === userId);
          const newTests = Array.from(new Set([...targetUser.openTests, tId]));
          return $authHost.post("api/user/add-tests", {
            userId: userId,
            testIds: newTests,
          });
        }),
      );

      setDbUsers((prev) =>
        prev.map((u) =>
          userIds.includes(u.id)
            ? { ...u, openTests: Array.from(new Set([...u.openTests, tId])) }
            : u,
        ),
      );
      setOpenAddRespondent(false);
      showToast("Тест успешно назначен выбранным пользователям!", "success");
    } catch (error) {
      console.error("Ошибка при назначении теста пользователям:", error);
      showToast("Ошибка при назначении теста пользователям", "error");
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    try {
      const targetUser = dbUsers.find((u) => u.id === userToRemove.id);
      const filteredTests = targetUser.openTests.filter((id) => id !== tId);

      await $authHost.delete(`api/test/${test.id}/access/user/${userToRemove.id}`);

      setDbUsers((prev) =>
        prev.map((u) =>
          u.id === userToRemove.id ? { ...u, openTests: filteredTests } : u,
        ),
      );
      setUserToRemove(null);
      showToast("Личный доступ пользователя отменен", "success");
    } catch (error) {
      console.error("Ошибка удаления личного теста у респондента:", error);
      showToast("Ошибка при отмене доступа", "error");
    }
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    try {
      await $authHost.delete(`api/test/${tId}`);
      setTestToDelete(null);
      showToast("Тест успешно удален", "success");
      navigate("/tests");
    } catch (error) {
      console.error("Ошибка при удалении теста:", error);
      showToast("Ошибка при удалении теста", "error");
    }
  };

  const groupColumns = [
    { key: "name", title: "Название группы", thStyle: { width: "250px" }, },
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
          onClick={(e) => {
            e.stopPropagation();
            setGroupToRemove(row);
          }}
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
      key: "accessSource",
      title: "Источник доступа",
      render: (row) => (
        <span style={{ fontSize: "13px", color: "#555" }}>
          {row.accessSource}
        </span>
      ),
      thStyle: { width: "200px" },
    },
    {
      key: "status",
      title: "Статус",
      render: (row) => (
        <span style={{ color: row.status === "Пройден" ? "green" : "#e65100" }}>
          {row.status}
        </span>
      ),
      thStyle: { width: "120px" },
    },
    {
      key: "score",
      title: "Балл",
      render: (row) => (row.score === -1 ? "—" : row.score),
      thStyle: { width: "80px" },
    },
    {
      key: "timeSpent",
      title: "Время",
      render: (row) =>
        row.timeSpent > 0
          ? `${Math.floor(row.timeSpent / 60)} мин. ${row.timeSpent % 60} сек.`
          : "—",
      thStyle: { width: "150px" },
    },
    {
      key: "actions",
      title: "",
      render: (row) =>
        row.hasPersonalAccess ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setUserToRemove(row);
            }}
            className={classes.cancelBtn}
          >
            Удалить личный
          </Button>
        ) : (
          <span
            style={{ fontSize: "14px", color: "#999", fontStyle: "italic" }}
          >
            Доступ через группу
          </span>
        ),
      thStyle: { width: "140px" },
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
  } = useTable({ data: assignedGroups, columns: groupColumns, pageSize: 5 });

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
  } = useTable({ data: assignedUsers, columns: userColumns, pageSize: 5 });

  if (isLoading) {
    return (
      <div>
        <Header title="Загрузка..." />
        <Loader />
      </div>
    );
  }
  if (!test) return <Header title="Тест не найден" />;

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
            <Button
              className={classes.cancelBtn}
              onClick={() => setTestToDelete(test)}
            >
              Удалить
            </Button>
          </>
        }
      >
        <p>
          <strong>Название теста: </strong>
          {test.name}
        </p>
        <p>
          <strong>Описание: </strong>
          {test.description || "Описание отсутствует"}
        </p>
        <p>
          <strong>Ссылка на тест: </strong>
          <a
            href={test.externalUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {test.externalUrl || "Ссылка не указана"}
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
          <Button onClick={() => setOpenAddRespondent(true)}>
            Добавить респондента
          </Button>
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

      <EditTest
        open={isEditTest}
        onClose={() => setEditTest(false)}
        test={test}
        onSave={async (updatedData) => {
          try {
            await $authHost.put(`api/test/${test.id}`, updatedData);

            setDbTests((prev) =>
              prev.map((t) =>
                t.id === test.id ? { ...t, ...updatedData } : t,
              ),
            );

            setEditTest(false);
            showToast("Настройки теста успешно обновлены!", "success");
          } catch (error) {
            console.error("Ошибка при обновлении теста:", error);
            showToast(error.response?.data?.message || "Ошибка при обновлении теста", "error");
          }
        }}
      />

      <OpenTestToGroupModal
        open={isOpenAddGroup}
        onClose={() => setOpenAddGroup(false)}
        groups={availableGroups}
        test={test}
        onAdd={handleAddTestToGroups}
      />

      <OpenTestToUserModal
        open={isOpenAddRespondent}
        onClose={() => setOpenAddRespondent(false)}
        users={availableUsers}
        test={test}
        onAdd={handleAddTestToUsers}
      />

      <ConfirmModal
        open={!!testToDelete}
        onClose={() => setTestToDelete(null)}
        onConfirm={handleDeleteTest}
        title="Удаление теста"
      >
        <p>
          Вы уверены, что хотите удалить тест{" "}
          <strong>{testToDelete?.name}</strong>? Это действие нельзя отменить.
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={!!groupToRemove}
        onClose={() => setGroupToRemove(null)}
        onConfirm={handleRemoveGroup}
        title="Отключение группы"
      >
        <p>
          Вы уверены, что хотите закрыть доступ к этому тесту для группы{" "}
          <strong>{groupToRemove?.name}</strong>?
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={!!userToRemove}
        onClose={() => setUserToRemove(null)}
        onConfirm={handleRemoveUser}
        title="Отмена личного доступа"
      >
        <p>
          Вы уверены, что хотите отменить личный доступ к этому тесту для
          пользователя <strong>{userToRemove?.fullName}</strong>?
        </p>
      </ConfirmModal>
    </div>
  );
}
