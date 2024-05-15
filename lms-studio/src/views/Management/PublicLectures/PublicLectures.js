import React, { useEffect, useState } from "react";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import {StatusIndicator, CollectionPreferences} from "@cloudscape-design/components";
import Title from "../../../components/Title";
import { transformDateTime } from "../../../utils/tool";
import { apiName, lecturePublicPath } from "../../../utils/api";
import { API, Storage } from "aws-amplify";
import { getPublicLecturesService } from "../services/lecture";

import { useCollection } from "@cloudscape-design/collection-hooks";
  
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

const PublicLectures = () => {
  const [selectedItems, setSelectedItems] = React.useState([]);

  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(false)

  const [preferences, setPreferences] = useState({
    pageSize: 15,
    visibleContent: ["name", "updatedAt", "state", "actions"],
  });
  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(lectures, {
    filtering: {
      empty: <EmptyState title="No lectures" />,
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

  const handleGetLectures = async () => {
    setLoading(true)

    // try {
    // const {data} = await getPublicLecturesService()
    // setLectures(data)
    // setLoading(false)
    // } catch(_) {
    //   setLoading(false)
    // }
    try {
      const data = await API.get(apiName, lecturePublicPath);
      setLectures(data);
      setLoading(false);
    } catch (_) {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleGetLectures()
  },[])

  return (
    <>
      {/* <Title text="Public Lectures" /> */}
      <Table
      {...collectionProps}
        onSelectionChange={({ detail }) =>
          setSelectedItems(detail.selectedItems)
        }
        selectedItems={selectedItems}
        ariaLabels={{
          selectionGroupLabel: "Items selection",
          allItemsSelectionLabel: ({ selectedItems }) =>
            `${selectedItems.length} ${
              selectedItems.length === 1 ? "item" : "items"
            } selected`,
          itemSelectionLabel: ({ selectedItems }, item) => {
            const isItemSelected = selectedItems.filter(
              (i) => i.Name === item.Name
            ).length;
            return `${item.Name} is ${isItemSelected ? "" : "not"} selected`;
          },
        }}
        columnDefinitions={[
          {
            id: "name",
            header: "Lecture name",
            cell: (e) => e.Name,
            sortingField: "name",
            isRowHeader: true,
          },
          {
            id: "updatedAt",
            header: "Last Updated",
            cell: (lecture) =>
              lecture.LastUpdated ? transformDateTime(lecture.LastUpdated) : "",
            sortingField: "name",
          },
          {
            id: "state",
            header: "State",
            cell: (e) =>
              e.State === "Enabled" ? (
                <StatusIndicator>{e.State}</StatusIndicator>
              ) : (
                <StatusIndicator type="error">{e.State}</StatusIndicator>
              ),
            sortingField: "state",
          },
        ]}
        visibleColumns={preferences.visibleContent}
        items={items}
        loading={loading}
        loadingText="Loading resources"
        selectionType="multi"
        trackBy="Name"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No resources</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              No resources to display.
            </Box>
            <Button>Create resource</Button>
          </Box>
        }
        filter={
          <div className="input-container">
            <TextFilter {...filterProps} filteringPlaceholder="Find resources" />
          </div>
        }
        header={
          <Header
            counter={
              selectedItems.length
                ? "(" + selectedItems.length + `/${lectures.length})`
                : `(${lectures.length})`
            }
          >
            Public Lectures
          </Header>
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
                  { value: 15, label: "15 lectures" },
                  { value: 20, label: "20 lectures" },
                  { value: 25, label: "25 lectures" },
                ],
              }}
              visibleContentPreference={{
                title: "Select visible content",
                options: [
                  {
                    label: "Main distribution properties",
                    options: [
                      {
                        id: "name",
                        label: "Lecture Name",
                        editable: false,
                      },
                      { id: "updatedAt", label: "Last Updated" },
                      { id: "state", label: "State" },
                      { id: "actions", label: "Actions" },
                    ],
                  },
                ],
              }}
              onConfirm={({ detail }) => setPreferences(detail)}
            />
          }
      />
    </>
  );
};

export default PublicLectures;
