import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  BreadcrumbGroup,
  Wizard,
  FormField,
  Input,
  Container,
  Modal,
  Header,
  SpaceBetween,
  Button,
  Form,
  Box,
  FileUpload,
  Table,
  TextFilter,
  Textarea,
  Alert,
  Pagination,
  CollectionPreferences,
  Flashbar,
  Icon,
  ExpandableSection,
  ButtonDropdown,
} from "@cloudscape-design/components";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { apiName, uiConfigPath } from "../../../utils/api";
import { API } from "aws-amplify";

const successMes = "Delete success";
const errorMess = "Error! An error occurred. Please try again later";

function EmptyState({ title, subtitle, action }) {
  return (
    <Box textAlign="center" color="inherit">
      <Box variant="strong" textAlign="center" color="inherit">
        {title}
      </Box>
      <Box variant="p" padding={{ bottom: "s" }} color="inherit">
        {subtitle}
      </Box>
      {action}
    </Box>
  );
}

export default function SetUI() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [editDisable, setEditDisable] = useState(false);
  const [listUISet, setListUISet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [disable, setDisable] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionDisable, setActionDisable] = useState(true);
  const [flashItem, setFlashItem] = useState([]);

  const [preferences, setPreferences] = useState({
    pageSize: 15,
    visibleContent: ["id", "banner", "banner_icon"],
  });

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(listUISet, {
    filtering: {
      empty: <EmptyState title="No UI Set" />,
      noMatch: (
        <EmptyState
          title="No matches"
          action={
            <Button onClick={() => actions.setFiltering("")}>
              Clear filter
            </Button>
          }
        />
      ),
    },
    pagination: { pageSize: preferences.pageSize },
    sorting: {},
    selection: {},
  });


  useEffect(()=> {
    API.get(apiName, uiConfigPath).then((data)=>{
      setListUISet(data)
      setLoading(false)
    })
    .catch((error) => {
      console.log(error);
      setLoading(false);
    })
  }, [])

  const handleClick = (value, lecture) => {
    switch (value.id) {
      case "rm":
        confirmDelete();
        // setCurrentLecture(lecture);
        break;
      case "upd":
        navigate(`/updateUISet/${selectedItems[0].ID}`, {
          state: selectedItems[0],
        });
        break;
      default:
        break;
    }
  };

  const confirmDelete = () => {
    setNoticeMessage("Are you sure deleting the lectures?");
    setVisible(true);
  };

  const deleteUISet = async () => {
    let newUISet = [...listUISet]
    try {
      await API.del(apiName, uiConfigPath + "/" + selectedItems[0].ID);
      newUISet = newUISet.filter(
        (uiSet) => uiSet.ID != selectedItems[0].ID
      );
      resetSuccess()
      setListUISet(newUISet)
    }catch(error){
      console.log(error);
      resetFail();
    }
  }

  const resetSuccess = () => {
    setDisable(false);
    setDeleting(false);
    setVisible(false);
    setFlashItem([
      {
        type: "success",
        content: successMes,
        dismissible: true,
        dismissLabel: "Dismiss message",
        onDismiss: () => setFlashItem([]),
        id: "success_message",
      },
    ]);
    setSelectedItems([]);
  };

  const resetFail = () => {
    setDeleting(false);
    setDisable(false);
    setVisible(false);
    setFlashItem([
      {
        type: "error",
        content: errorMess,
        dismissible: true,
        dismissLabel: "Dismiss message",
        onDismiss: () => setFlashItem([]),
        id: "error_message",
      },
    ]);
  };

  return (
    <>
      <Flashbar items={flashItem} />
      <Table
        {...collectionProps}
        onSelectionChange={({ detail }) => {
          setSelectedItems(detail.selectedItems);
          setActionDisable(false);
        }}
        selectedItems={selectedItems}
        ariaLabels={{
          selectionGroupLabel: "Items selection",
          allItemsSelectionLabel: ({ selectedItems }) =>
            `${selectedItems.length} ${
              selectedItems.length === 1 ? "item" : "items"
            } selected`,
          itemSelectionLabel: ({ selectedItem }, item) => {
            const isItemSelected = selectedItems.filter(
              (i) => i.Name === item.Name
            ).length;
            return `${item.Name} is ${isItemSelected ? "" : "not"} selected`;
          },
        }}
        columnDefinitions={[
          {
            id: "id",
            header: "ID",
            cell: (e) => e.ID,
            sortingField: "ID",
          },
          {
            id: "banner",
            header: "Banner Image",
            cell: (e) => e.Banner?.split("/")[2],
            sortingField: "ID",
            isRowHeader: true,
          },
          {
            id: "banner_icon",
            header: "Banner Icon",
            cell: (e) => e.BannerIcon?.split("/")[2],
          },
        ]}
        columnDisplay={[
          { id: "id", visible: true },
          { id: "banner", visible: true },
          { id: "banner_icon", visible: true },
        ]}
        items={items}
        loading={loading}
        selectionType="single"
        trackBy="ID"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No resources</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              No resources to display.
            </Box>
            <Button>Create UI Set</Button>
          </Box>
        }
        filter={
          <div className="input-container">
            <TextFilter {...filterProps} filteringPlaceholder="Find resources" />
          </div>
        }
        header={
          <div className="header">
          <Header
            // counter={
            //   selectedItems.length
            //     ? "(" + selectedItems.length + `/${accessCode.length})`
            //     : `(${accessCode.length})`
            // }
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="primary" href="/#/createSetUI">
                  Create new UI
                </Button>
                <ButtonDropdown
                  items={[
                    {
                      text: "Update",
                      id: "upd",
                      disabled: editDisable,
                    },
                    {
                      text: "Delete",
                      id: "rm",
                      disabled: false,
                    },
                  ]}
                  disabled={actionDisable}
                  onItemClick={(e) => handleClick(e.detail)}
                >
                  Actions
                </ButtonDropdown>
              </SpaceBetween>
            }
          >
            UI Set
          </Header>
          </div>
        }
        pagination={<Pagination {...paginationProps} />}
        preferences={
          <CollectionPreferences
            title="Preferences"
            preferences={preferences}
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            pageSizePreference={{
              title: "Page size",
              options: [
                { value: 15, label: "15 Set" },
                { value: 20, label: "20 Set" },
                { value: 25, label: "25 Set" },
              ],
            }}
            visibleContentPreference={{
              title: "Select visible content",
              options: [
                {
                  label: "Main distribution properties",
                  options: [
                    {
                      id: "id",
                      label: "Set ID",
                      editable: false,
                    },
                    { id: "banner", label: "Banner" },
                    { id: "banner_icon", label: "Banner Icon" },
                  ],
                },
              ],
            }}
            onConfirm={({ detail }) => setPreferences(detail)}
          />
        }
      />
      <Modal
        onDismiss={() => setVisible(false)}
        visible={visible}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setVisible(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disable={disable}
                loading={deleting}
                onClick={() => deleteUISet(selectedItems)}
              >
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
        header="Confirm"
      >
        {noticeMessage}
      </Modal>
    </>
  );
}
