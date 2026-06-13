import React, { useMemo, useState, useEffect } from "react";
import Header from "../../components/UI/header/Header";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import Button from "../../components/UI/button/Button";
import Table from "../../components/tables/table/Table";
import RowActionsGroups from "../../components/tables/rowActions/RowActionsGroups";
import MyPagination from "../../components/UI/pagination/MyPagination";
import { useTable } from "../../utils/hooks/useTable";
import CreateGroupModal from "../../components/modals/ModalsForGroups/createGroup/CreateGroupModal";
import OpenTest from "../../components/modals/openTests/OpenTests";
import { useNavigate } from "react-router";
import { $authHost } from "../../http";
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";
import Loader from "../../components/UI/loader/Loader";
import { useToast } from "../../context/ToastContext";
import Message from "../../components/tableMessage/Message";

export default function Groups() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openTestModal, setOpenTestModal] = useState(false);
  const [dbGroups, setDbGroups] = useState([]);
  const [dbTests, setDbTests] = useState([]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = useToast()

  const fetchGroups = async () => {
    try {
      const response = await $authHost.get("api/group");
      const formatedGroups = response.data.map((group) => ({
        ...group,
        tests: group.tests || [],
      }));
      setDbGroups(formatedGroups);
      console.log(formatedGroups);
    } catch (error) {
      console.error("Ошибка зыгрузки групп", error);
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

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      await Promise.all([fetchGroups(), fetchTests()]);
      setIsLoading(false);
    }

    loadAllData();
  }, []);

  const getTestsName = (id) => {
    return dbTests.find((g) => g.id === id)?.name;
  };

  const handleDelete = (group) => {
    setGroupToDelete(group);
    setDeleteModalOpen(true);
  };

  const handleOpenTest = (group) => {
    setSelectedGroup(group);
    setOpenTestModal(true);
  };

  const handleRowClick = (group) => {
    navigate(`/groups/${group.id}`);
  };

  const availableTest = useMemo(() => {
    if (!selectedGroup) return [];

    const groupTests = selectedGroup.tests || [];
    return dbTests.filter((test) => !groupTests.includes(test.id));
  }, [selectedGroup, dbTests]);

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      await $authHost.delete(`api/group/${groupToDelete.id}`);

      setDeleteModalOpen(false);
      setGroupToDelete(null);
      showToast("Группа успешно удалена!", "success")
      fetchGroups();
    } catch (error) {
      console.error("Ошибка при удалении: ", error);
      showToast("Ошибка при удалении", "error")
    }
  };

  const columns = [
    {
      key: "name",
      title: "Название группы",
      render: (row) => row.name,
      thStyle: { width: "340px", cursor: "pointer" },
    },
    {
      key: "openTests",
      title: "Открытые тесты",
      render: (row) => {
        if (!row.tests || row.tests.length === 0) return "—";
        return row.tests.map(getTestsName).join(", ");
      },
      thStyle: { width: "500px", cursor: "pointer" },
    },
    {
      key: "usersCount",
      title: "Пользователи",
      render: (row) => row.usersCount ?? "-",
      thStyle: { width: "120px", cursor: "pointer" },
    },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <RowActionsGroups
          group={row}
          onDelete={handleDelete}
          onOpenTest={handleOpenTest}
        />
      ),
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
  } = useTable({ data: dbGroups, columns, searchKeys: ["name"]});

  if (isLoading) {
    return (
      <div>
        <Header title={"Группы"}/>
        <Loader/>
      </div>
    )
  }

  return (
    <div>
      <Header title={"Группы"} />
      <ToolBar>
        <Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        ></Search>
        <Button onClick={() => setOpenCreateGroup(true)}>Создать группу</Button>
      </ToolBar>
      <div>
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
            : "У вас пока нет созданных групп."}
          </Message>
        )}
      </div>
      {totalPages > 1 && (
        <MyPagination totalPages={totalPages} page={page} setPage={setPage} />
      )}
      <CreateGroupModal
        open={openCreateGroup}
        onClose={() => setOpenCreateGroup(false)}
        onCreate={fetchGroups}
      />
      <OpenTest
        open={openTestModal}
        onClose={() => setOpenTestModal(false)}
        user={selectedGroup}
        tests={availableTest}
        onAdd={async (selectedTestIds) => {
          try {
            await $authHost.post("api/group/add-tests", {
              groupId: selectedGroup.id,
              testIds: selectedTestIds,
            });

            setOpenTestModal(false);
            showToast("Тест успешно открыт!", "success");
            fetchGroups();
          } catch (error) {
            console.error("Ошибка при назначении тестов: ", error);
            showToast(`Ошибка при назначении тестов: ${error}`, "success");
          }
        }}
      />
      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Удаление группы"
      >
        <p>
          Вы уверены, что хотите удалить группу{" "}
          <strong>{groupToDelete?.name}</strong>? Все пользователи останутся в
          системе, но будут отвязаны от этой группы.
        </p>
      </ConfirmModal>
    </div>
  );
}
