import React, { useMemo, useState, useEffect } from "react";
import Header from "../../components/UI/header/Header";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import Button from "../../components/UI/button/Button";
import { tests } from "../../utils/tests";
import Table from "../../components/tables/table/Table";
import RowActionsGroups from "../../components/tables/rowActions/RowActionsGroups";
import MyPagination from "../../components/UI/pagination/MyPagination";
import { useTable } from "../../utils/hooks/useTable";
import CreateGroupModal from "../../components/modals/ModalsForGroups/createGroup/CreateGroupModal";
import OpenTest from "../../components/modals/openTests/OpenTests";
import { useNavigate } from "react-router";
import { $authHost } from "../../http";
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";

export default function Groups() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openTestModal, setOpenTestModal] = useState(false);
  const [dbGroups, setDbGroups] = useState([]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const response = await $authHost.get("api/group");
      const formatedGroups = response.data.map((group) => ({
        ...group,
        tests: group.tests || [],
      }));
      setDbGroups(formatedGroups);
    } catch (error) {
      console.error("Ошибка зыгрузки групп", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const getTestsName = (id) => {
    return tests.find((g) => g.id === id)?.name;
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
    return tests.filter((test) => !groupTests.includes(test.id));
  }, [selectedGroup]);

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      await $authHost.delete(`api/group/${groupToDelete.id}`);

      setDeleteModalOpen(false);
      setGroupToDelete(null);

      fetchGroups();
    } catch (error) {
      console.error("Ошибка при удалении: ", error);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Название группы",
      render: (row) => row.name,
      thStyle: { width: "140px", cursor: "pointer" },
    },
    {
      key: "openTests",
      title: "Открытые тесты",
      render: (row) => {
        if (!row.tests || row.tests.length === 0) return "—";
        return row.tests.map(getTestsName).join(", ");
      },
      thStyle: { width: "700px", cursor: "pointer" },
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
    pageSize,
  } = useTable({ data: dbGroups, columns });

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
        <Table
          data={paginatedData}
          columns={columns}
          onSort={handleSort}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onRowClick={handleRowClick}
        />
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
        onAdd={(selectedTestIds) => {
          console.log(
            "Открываем тесты",
            selectedTestIds,
            "для группы",
            selectedGroup,
          );
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
