import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import Header from "../../components/UI/header/Header";
import Button from "../../components/UI/button/Button";
import DataCard from "../../components/dataCard/DataCard";
import classes from "./respondents.module.css";
import EditUserModal from "../../components/modals/ModalsForRespondents/editUserModal/EditUserModal";
import { useTable } from "../../utils/hooks/useTable";
import Table from "../../components/tables/table/Table";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import H2 from "../../components/UI/h2/H2";
import Search from "../../components/UI/search/Search";
import MyPagination from "../../components/UI/pagination/MyPagination";
import AddGroupModal from "../../components/modals/ModalsForRespondents/addGroupModal/AddGroupModal";
import OpenTests from "../../components/modals/openTests/OpenTests";
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";
import { $authHost } from "../../http";
import Loader from "../../components/UI/loader/Loader";
import { useToast } from "../../context/ToastContext";
import Message from "../../components/tableMessage/Message";

export default function RespondentsDetailedInfo() {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();
  const showToast = useToast();

  const [dbUsers, setDbUsers] = useState([]);
  const [dbTests, setDbTests] = useState([]);
  const [dbGroups, setDbGroups] = useState([]);
  const [dbResults, setDbResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [openAddGroupModal, setOpenAddGroupModal] = useState(false);
  const [openTestModal, setOpenTestModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(false);

  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [groupToRemove, setGroupToRemove] = useState(null);
  const [testToRemove, setTestToRemove] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, testsRes, groupsRes, resultsRes] = await Promise.all([
        $authHost.get("api/user"),
        $authHost.get("api/test"),
        $authHost.get("api/group"),
        $authHost.get(`api/test/results/${userId}`),
      ]);

      setDbUsers(
        usersRes.data.map((u) => ({
          ...u,
          groups: u.groups || [],
          openTests: u.openTests || [],
          completedTests: resultsRes.data.map((r) => r.testId),
        })),
      );
      setDbTests(testsRes.data);
      setDbGroups(groupsRes.data.map((g) => ({ ...g, tests: g.tests || [] })));
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

  const userData = dbUsers.find((u) => u.id === userId);

  const group = useMemo(() => {
    if (!userData || dbGroups.length === 0) return [];
    return dbGroups.filter((g) => userData.groups.includes(g.id));
  }, [userData, dbGroups]);

  const availableGroups = useMemo(() => {
    if (!userData) return [];
    return dbGroups.filter((g) => !userData.groups.includes(g.id));
  }, [userData, dbGroups]);

  const userTests = useMemo(() => {
    if (!userData || dbTests.length === 0) return [];

    let groupTests = [];
    group.forEach((g) => {
      groupTests = [...groupTests, ...g.tests];
    });

    const allAvailableTestIds = Array.from(
      new Set([...userData.openTests, ...groupTests]),
    );

    return allAvailableTestIds
      .map((testId) => {
        const test = dbTests.find((t) => t.id === testId);
        if (!test) return null;

        const hasPersonal = userData.openTests.includes(testId);
        const userGroupsWithTest = group.filter((g) =>
          g.tests.includes(testId),
        );

        let accessSource = "";
        if (hasPersonal && userGroupsWithTest.length > 0) {
          accessSource = `Лично + Группы (${userGroupsWithTest.map((g) => g.name).join(", ")})`;
        } else if (hasPersonal) {
          accessSource = "Лично";
        } else {
          accessSource = `Группа (${userGroupsWithTest.map((g) => g.name).join(", ")})`;
        }

        const testResult = dbResults.find((r) => r.testId === testId);
        const isCompleted = !!testResult;

        let formattedTime = "-";
        if (testResult && testResult.startedAt && testResult.completedAt) {
          const diffInSeconds = Math.round(
            (new Date(testResult.completedAt) -
              new Date(testResult.startedAt)) /
              1000,
          );
          const mins = Math.floor(diffInSeconds / 60);
          const secs = diffInSeconds % 60;
          formattedTime =
            mins > 0 ? `${mins} мин. ${secs} сек.` : `${secs} сек.`;
        }

        let avgCognitiveLoad = "-";
        if (testResult && testResult.cognitiveLoad) {
          const values = Object.values(testResult.cognitiveLoad);
          if (values.length > 0) {
            const sum = values.reduce((a, b) => a + Number(b), 0);
            avgCognitiveLoad = (sum / values.length).toFixed(1);
          }
        }

        return {
          id: testId,
          name: test.name,
          accessSource,
          hasPersonalAccess: hasPersonal,
          score:
            isCompleted && testResult.score !== null ? testResult.score : "-",
          timeSpent: formattedTime,
          avgCognitiveLoad: avgCognitiveLoad,
          status: isCompleted ? "Пройден" : "Не пройден",
          isCompleted: isCompleted,
        };
      })
      .filter(Boolean);
  }, [userData, dbTests, group, dbResults]);

  const availableTests = useMemo(() => {
    if (!userData) return [];
    const currentTestIds = userTests.map((t) => t.id);
    return dbTests.filter((t) => !currentTestIds.includes(t.id));
  }, [userData, dbTests, userTests]);

  let title = "Загрузка...";
  if (userData && userData.fullName) {
    const parts = userData.fullName.split(" ");
    if (parts.length >= 2) {
      const lastName = parts[0];
      const firstName = parts[1];
      const middleName = parts[2] ? `${parts[2][0]}.` : "";
      title = `${lastName} ${firstName[0]}.${middleName}`;
    } else {
      title = userData.fullName;
    }
  }

  const handleRemoveGroup = async () => {
    if (!groupToRemove) return;
    try {
      await $authHost.post("api/user/remove-group", {
        userId: userId,
        groupId: groupToRemove.id,
      });
      setDbUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, groups: u.groups.filter((id) => id !== groupToRemove.id) }
            : u,
        ),
      );
      setGroupToRemove(null);
      showToast("Пользователь успешно исключен из группы", "success");
    } catch (error) {
      console.error("Ошибка при удалении пользователя из группы: ", error);
      showToast("Ошибка при исключении из группы", "error");
    }
  };

  const handleAddGroupsToUser = async (groupIds) => {
    try {
      await $authHost.post("api/user/add-groups", {
        userId: userId,
        groupIds: groupIds,
      });
      setDbUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, groups: Array.from(new Set([...u.groups, ...groupIds])) }
            : u,
        ),
      );
      setOpenAddGroupModal(false);
    } catch (error) {
      console.error("Ошибка при добавлении в группы:", error);
    }
  };

  const handleAddTestsToUser = async (testIds) => {
    try {
      const newTests = Array.from(new Set([...userData.openTests, ...testIds]));
      await $authHost.post("api/user/add-tests", {
        userId: userId,
        testIds: newTests,
      });
      setDbUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, openTests: newTests } : u)),
      );
      setOpenTestModal(false);
    } catch (error) {
      console.error("Ошибка при назначении тестов:", error);
    }
  };

  const handleRemoveTest = async () => {
    if (!testToRemove) return;
    try {
      const filteredTests = userData.openTests.filter(
        (id) => id !== testToRemove.id,
      );
      await $authHost.delete(`api/test/${testToRemove.id}/access/user/${userId}`);
      setDbUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, openTests: filteredTests } : u,
        ),
      );
      setTestToRemove(null);
      showToast("Личный доступ к тесту отменен", "success");
    } catch (error) {
      console.error("Ошибка удаления личного теста:", error);
      showToast("Ошибка при отмене доступа к тесту", "error");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await $authHost.delete(`api/user/${userId}`);
      setIsDeleteUserModalOpen(false);
      showToast("Пользователь успешно удален", "success");
      navigate("/respondents");
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
      showToast("Ошибка при удалении пользователя", "error");
    }
  };

  const handleOpenTestResult = (test) => {
    navigate(`/respondents/${userId}/tests/${test.id}`);
  };

  const groupColumns = [
    { key: "name", title: "Группа", render: (row) => row.name },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <Button
          style={{ color: "#FFFFFF", backgroundColor: "#E52327" }}
          onClick={(e) => {
            e.stopPropagation();
            setGroupToRemove(row);
          }}
        >
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
      thStyle: { width: "150px" },
    },
    {
      key: "accessSource",
      title: "Источник доступа",
      render: (row) => (
        <span style={{ fontSize: "13px", color: "#555" }}>
          {row.accessSource}
        </span>
      ),
      thStyle: { width: "150px" },
    },
    { key: "score", title: "Оценка", render: (row) => row.score },
    { key: "timeSpent", title: "Время", render: (row) => row.timeSpent },
    {
      key: "avgCognitiveLoad",
      title: "Ср. когнитивная нагрузка",
      render: (row) => row.avgCognitiveLoad,
      thStyle: { width: "150px" },
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "space-around",
          }}
        >
          <Button
            disabled={!row.isCompleted}
            onClick={() => handleOpenTestResult(row)}
          >
            Подробнее
          </Button>

          {row.hasPersonalAccess ? (
            <Button
              style={{ color: "#fff", backgroundColor: "#E52327" }}
              onClick={(e) => {
                e.stopPropagation();
                setTestToRemove(row);
              }}
            >
              Закрыть
            </Button>
          ) : (
            <span
              style={{ fontSize: "14px", color: "#999", fontStyle: "italic" }}
            >
              Групповой
            </span>
          )}
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
  } = useTable({ data: group, columns: groupColumns, pageSize: 5, searchKeys: ["name"] });

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
  } = useTable({ data: userTests, columns: testColumns, pageSize: 5, searchKeys: ["name"] });

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!userData) return <Header title="Пользователь не найден" />;

  return (
    <div>
      <Header
        title={title}
        crumbs={[
          { label: "Респонденты", to: "/respondents" },
          { label: title },
        ]}
      />
      <DataCard
        actions={
          <>
            <Button onClick={() => setOpenEditUserModal(true)}>
              Редактировать
            </Button>
            <Button
              className={classes.cancelBtn}
              onClick={() => setIsDeleteUserModalOpen(true)}
            >
              Удалить
            </Button>
          </>
        }
      >
        <p>
          <strong>ФИО: </strong>
          {userData.fullName}
        </p>
        <p>
          <strong>Почта: </strong>
          {userData.email}
        </p>
        <p>
          <strong>Группы: </strong>
          {group.length > 0 ? group.map((g) => g.name).join(", ") : "—"}
        </p>
        <p>
          <strong>Открыто тестов: </strong>
          {userTests.length}
        </p>
        <p>
          <strong>Пройдено тестов: </strong>
          {userTests.filter((t) => t.isCompleted).length}
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
        
        {paginatedGroups.length > 0 ? (
<Table
          data={paginatedGroups}
          columns={groupColumns}
          onSort={handleSortGroups}
          sortKey={groupsSortKey}
          sortOrder={groupsSortOrder}
        />
        ) : (
          <Message>
            {groupsSearch
            ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска."
            : "Респондент не состоит в группе."}
          </Message>
        )}
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
        {paginatedTests.length > 0 ? (
          <Table
          data={paginatedTests}
          columns={testColumns}
          onSort={handleSortTests}
          sortKey={testsSortKey}
          sortOrder={testsSortOrder}
        />
        ) : (
          <Message>
            {testsSearch
            ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска."
            : "Тесты не назначены."}
          </Message>
        )}
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
        user={userData}
        onSave={async (updatedData) => {
          try {
            await $authHost.put(`api/user/${userData.id}`, updatedData);
            setDbUsers((prev) =>
              prev.map((u) =>
                u.id === userData.id
                  ? {
                      ...u,
                      fullName: updatedData.fullName,
                      email: updatedData.email,
                    }
                  : u,
              ),
            );
            setOpenEditUserModal(false);
            showToast("Данные пользователя обновлены", "success");
          } catch (error) {
            console.error("Ошибка:", error);
            const errorMessage = error.response?.data?.message || error.message;
            showToast(`Ошибка сохранения: ${errorMessage}`, "error");
          }
        }}
      />

      <AddGroupModal
        open={openAddGroupModal}
        onClose={() => setOpenAddGroupModal(false)}
        groups={availableGroups}
        onAdd={handleAddGroupsToUser}
      />

      <OpenTests
        open={openTestModal}
        onClose={() => setOpenTestModal(false)}
        tests={availableTests}
        onAdd={handleAddTestsToUser}
      />

      <ConfirmModal
        open={isDeleteUserModalOpen}
        onClose={() => setIsDeleteUserModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Удаление пользователя"
      >
        <p>
          Вы уверены, что хотите удалить пользователя{" "}
          <strong>{userData.fullName}</strong>? Это действие нельзя отменить.
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={!!groupToRemove}
        onClose={() => setGroupToRemove(null)}
        onConfirm={handleRemoveGroup}
        title="Исключение из группы"
      >
        <p>
          Вы уверены, что хотите исключить пользователя из группы{" "}
          <strong>{groupToRemove?.name}</strong>?
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={!!testToRemove}
        onClose={() => setTestToRemove(null)}
        onConfirm={handleRemoveTest}
        title="Отмена доступа к тесту"
      >
        <p>
          Вы уверены, что хотите закрыть личный доступ к тесту{" "}
          <strong>{testToRemove?.name}</strong> для этого пользователя?
        </p>
      </ConfirmModal>
    </div>
  );
}
