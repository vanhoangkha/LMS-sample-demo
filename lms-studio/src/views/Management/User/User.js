import React, { useState, useEffect } from "react";
import Tabs from "@cloudscape-design/components/tabs";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { apiName, userOverview, userProgressPath, coursePath, lecturePath, describePath } from "../../../utils/api";
import { API } from "aws-amplify";
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

const User = () => {
  //   const [selectedItems, setSelectedItems] = React.useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [listUser, setListUser] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTabId, setActiveTabId] = useState("overview");
  const [overView, setOverview] = useState({});

  const [preferences, setPreferences] = useState({
    pageSize: 15,
    visibleContent: ["name", "avgProgress"],
  });
  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(listUser, {
    filtering: {
      empty: <EmptyState title="No users" />,
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

  useEffect(() => {
    fetchOverview();
  }, [])

  useEffect(() => {
    if (activeTabId === "users"){
        fetchUser();
    }
  }, [activeTabId]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const courseDes = await API.get(apiName, coursePath + describePath);
      // console.log(courseDes);
      const lectureDes = await API.get(apiName, lecturePath + describePath);
      // console.log(lectureDes);
      setOverview({
        courseCount: courseDes.ItemCount,
        lectureCount: lectureDes.ItemCount,
      })
      setLoading(false);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    const userList = await getUserList();
    const userProgress = await getUsserProgress();
    setUserProgress(userProgress);
    const userHasInfor = userList.map((user) => {
      const progress = userProgress.find((item) => item.UserID === user.userId);
      let countPercent = 0;
      if(progress){
          progress.Progress.map((item) => {
              countPercent += item.ProgressPercent
          })
      }
      console.log("progress ", progress);
      return {
        ...user,
        avgProgress: progress ? (countPercent / (overView.courseCount*100))*100 : 0,
      };
    });
    console.log(userHasInfor);
    setListUser(userHasInfor);
    setLoading(false);
  };


  const getUsserProgress = async () => {
    try {
      const data = await API.get(apiName, userProgressPath);
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  };
  const getUserList = async () => {
    let userList = [];
    try {
      const userData = await API.get(apiName, userOverview);

      // console.log(userData);
      userData.forEach((user) => {
        userList.push({
          userId: user.Attributes[3].Value,
          email: user.Attributes[0].Value,
          name: user.Attributes[2].Value,
        });
      });

      return userList;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  return (
    <Tabs
      onChange={(detail) => setActiveTabId(detail.detail.activeTabId)}
      tabs={[
        {
          label: "Overview",
          id: "overview",
          content: (
            <Container
              loading={loading}
              header={
                <Header
                  variant="h2"
                  // description="Container description"
                >
                  Overview
                </Header>
              }
            >
              <Container
                header={
                  <Header variant="h2" description="Amount of courses"></Header>
                }
              >
                No of course - {overView.courseCount}
              </Container>
              <br></br>
              <Container
                header={
                  <Header variant="h2" description="Amount of lectures"></Header>
                }
              >
                No of lectures - {overView.lectureCount}
              </Container>
              <br></br>
              {/* <Container
                header={
                  <Header
                    variant="h2"
                    description="Amount of resources"
                  ></Header>
                }
              >
                No of resources - 56
              </Container>

              <br></br>
              <Container
                header={
                  <Header
                    variant="h2"
                    description="Most popular courses"
                  ></Header>
                }
              >
                AWS courses X
              </Container> */}
            </Container>
          ),
        },
        {
          label: "Users",
          id: "users",
          content: (
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
                  return `${item.Name} is ${
                    isItemSelected ? "" : "not"
                  } selected`;
                },
              }}
              columnDefinitions={[
                {
                  id: "username",
                  header: "User name",
                  cell: (e) => e.name,
                  sortingField: "name",
                  isRowHeader: true,
                },
                // {
                //     id: "amountOfCourses",
                //     header: "Amount of Courses",
                //     cell: e => e.aoc,
                //     sortingField: "amc"
                // },
                {   id: "avgProgress",
                    header: "Average Progress",
                    cell: e => e.avgProgress + "%"
                },
              ]}
              columnDisplay={[
                { id: "username", visible: true },
                { id: "amountOfCourses", visible: true },
                { id: "avgProgress", visible: true },
              ]}
              items={items}
              loadingText="Loading resources"
              loading={loading}
              selectionType="multi"
              trackBy="name"
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
                  <TextFilter
                    {...filterProps}
                    filteringPlaceholder="Find resources"
                  />
                </div>
              }
              header={
                <Header
                  counter={
                    selectedItems.length
                      ? "(" + selectedItems.length + `/${listUser.length})`
                      : `(${listUser.length})`
                  }
                >
                  Check User
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
                      { value: 15, label: "15 users" },
                      { value: 20, label: "20 users" },
                      { value: 25, label: "25 users" },
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
                            label: "User Name",
                            editable: false,
                          },
                        ],
                      },
                    ],
                  }}
                  onConfirm={({ detail }) => setPreferences(detail)}
                />
              }
            />
          ),
        },
      ]}
    />
  );
};

export default User;
