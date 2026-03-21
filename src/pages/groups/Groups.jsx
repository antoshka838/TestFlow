import React, { useMemo, useState, useEffect } from "react";
import Header from "../../components/UI/header/Header";
import ToolBar from "../../components/UI/toolBar/ToolBar";
import Search from "../../components/UI/search/Search";
import Button from "../../components/UI/button/Button";
import { groups } from "../../utils/groups";
import { users } from "../../utils/users";
import { tests } from "../../utils/tests";
import Table from "../../components/tables/table/Table";
import RowActionsGroups from "../../components/tables/rowActions/RowActionsGroups";
import MyPagination from "../../components/UI/pagination/MyPagination";
import { useTable } from "../../utils/hooks/useTable";
import CreateGroupModal from "../../components/modals/ModalsForGroups/createGroup/CreateGroupModal";
import OpenTest from "../../components/modals/openTests/OpenTests";
import { useNavigate } from "react-router";

export default function Groups() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openTestModal, setOpenTestModal] = useState(false);
  const [groupsData, setGroupsData] = useState(groups);
  const navigate = useNavigate()

  const getTestsName = (id) => {
    return tests.find((g) => g.id === id)?.name;
  };

  const handleDelete = (group) => {
    console.log("Удалить пользователя", group);
  };

  const handleCreateGroup = (newGroup) => {
    setGroupsData((prev) => [...prev, newGroup]);
  };

  const handleOpenTest = (group) => {
    setSelectedGroup(group);
    setOpenTestModal(true);
  };

  const handleRowClick = (group) => {
    navigate(`/groups/${group.id}`);
  }

  const availableTest = useMemo(() => {
    if (!selectedGroup) return [];

    return tests.filter((test) => !selectedGroup.tests.includes(test.id));
  }, [selectedGroup]);

  const columns = [
    {
      key: "groups",
      title: "Название группы",
      render: (row) => row.name,
      thStyle: { width: "140px", cursor: "pointer" },
    },
    {
      key: "openTests",
      title: "Открытые тесты",
      render: (row) => row.tests?.map(getTestsName).join(", "),
      thStyle: { width: "700px", cursor: "pointer" },
    },
    {
      key: "usersCount",
      title: "Пользователи",
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
  } = useTable({ data: groupsData, columns });

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
          onRowClick = {handleRowClick}
        />
      </div>
      {totalPages > 1 && (
        <MyPagination totalPages={totalPages} page={page} setPage={setPage} />
      )}
      <CreateGroupModal
        open={openCreateGroup}
        onClose={() => setOpenCreateGroup(false)}
        onCreate={handleCreateGroup}
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
    </div>
  );
}
