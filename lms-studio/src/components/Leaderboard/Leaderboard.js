import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
// import { withAuthenticator } from '@aws-amplify/ui-react';

import SideNavigation from "@cloudscape-design/components/side-navigation";
import Applayout from "@cloudscape-design/components/app-layout";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import Tabs from "@cloudscape-design/components/tabs";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { useNavigate } from "react-router-dom";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { API, Auth } from "aws-amplify";
import {
  apiName,
  coursePath,
  courseTopViewPath,
  userPath,
  byUserName,
  lecturePath,
  lectureTopViewPath,
  contributorPath,
  topContributorPath,
  courseOppPath,
  topOppValuePath,
} from "../../utils/api";
import "./Leaderboard.css";

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

function CourseTable(props) {
  console.log(props.topCourse);
  const columnDefinitions = [
    {
      id: "course",
      header: "Name",
      cell: (e) => e.Name,
      isRowHeader: true,
      sortingField: "Name",
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
    },
    {
      id: "level",
      header: "Level",
      cell: (e) => e.Level,
    },
    {
      id: "views",
      header: "Views",
      cell: (e) => e.Views,
      sortingField: "Views",
    },
    {
      id: "creator",
      header: "Creator",
      cell: (e) => e.Creator,
      sortingField: "Creator",
    },
  ];
  const [preferences, setPreferences] = useState({
    pageSize: 15,
    columnDisplay: [
      { id: "course", visible: true },
      { id: "state", visible: true },
      { id: "level", visible: true },
      { id: "views", visible: true },
      { id: "creator", visible: true },
    ],
  });

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(props.topCourse, {
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
    sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
  });

  return (
    <Table
      {...collectionProps}
      // onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      // selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: ({ selectedItems }) =>
          `${selectedItems.length} ${
            selectedItems.length === 1 ? "item" : "items"
          } selected`,
        itemSelectionLabel: ({ selectedItems }, item) => {
          const isItemSelected = selectedItems.filter(
            (i) => i.name === item.name
          ).length;
          return `${item.name} is ${isItemSelected ? "" : "not"} selected`;
        },
      }}
      columnDefinitions={columnDefinitions}
      columnDisplay={preferences.columnDisplay}
      items={items}
      loadingText="Loading resources"
      loading={props.loading}
      selectionType="multi"
      trackBy="name"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
          <Box padding={{ bottom: "s" }} variant="p" color="inherit">
            No resources to display.
          </Box>
        </Box>
      }
      filter={
        <div className="input-container">
          <TextFilter {...filterProps} filteringPlaceholder="Find resources" />
        </div>
      }
      header={
        <Header
        // counter={
        //   selectedItems.length ? "(" + selectedItems.length + "/10)" : "(10)"
        // }
        >
          Top Courses
        </Header>
      }
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={preferences}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 resources" },
              { value: 20, label: "20 resources" },
            ],
          }}
          wrapLinesPreference={{}}
          stripedRowsPreference={{}}
          contentDensityPreference={{}}
          contentDisplayPreference={{
            options: [
              {
                id: "course",
                label: "Name",
                alwaysVisible: true,
              },
              { id: "state", label: "State" },
              { id: "level", label: "Level" },
              { id: "views", label: "Views" },
            ],
          }}
          stickyColumnsPreference={{
            firstColumns: {
              title: "Stick first column(s)",
              description:
                "Keep the first column(s) visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "First column", value: 1 },
                { label: "First two columns", value: 2 },
              ],
            },
            lastColumns: {
              title: "Stick last column",
              description:
                "Keep the last column visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "Last column", value: 1 },
              ],
            },
          }}
        />
      }
    />
  );
}

function LectureTable(props) {
  const columnDefinitions = [
    {
      id: "lecture",
      header: "Name",
      cell: (e) => e.Name,
      isRowHeader: true,
      sortingField: "Name",
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
      sortingField: "alt",
    },
    {
      id: "level",
      header: "Level",
      cell: (e) => e.Level,
    },
    {
      id: "views",
      header: "Views",
      cell: (e) => e.Views,
      sortingField: "Views",
    },
    {
      id: "creator",
      header: "Creator",
      cell: (e) => e.Creator,
      sortingField: "Creator",
    },
  ];
  const [preferences, setPreferences] = useState({
    pageSize: 15,
    columnDisplay: [
      { id: "lecture", visible: true },
      { id: "state", visible: true },
      { id: "level", visible: true },
      { id: "views", visible: true },
      { id: "creator", visible: true },
    ],
  });

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(props.topLecture, {
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
    sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
  });

  return (
    <Table
      {...collectionProps}
      // onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      // selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: ({ selectedItems }) =>
          `${selectedItems.length} ${
            selectedItems.length === 1 ? "item" : "items"
          } selected`,
        itemSelectionLabel: ({ selectedItems }, item) => {
          const isItemSelected = selectedItems.filter(
            (i) => i.name === item.name
          ).length;
          return `${item.name} is ${isItemSelected ? "" : "not"} selected`;
        },
      }}
      columnDefinitions={columnDefinitions}
      columnDisplay={preferences.columnDisplay}
      items={items}
      loadingText="Loading resources"
      loading={props.loading}
      selectionType="multi"
      trackBy="name"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
          <Box padding={{ bottom: "s" }} variant="p" color="inherit">
            No resources to display.
          </Box>
        </Box>
      }
      filter={
        <div className="input-container">
          <TextFilter {...filterProps} filteringPlaceholder="Find resources" />
        </div>
      }
      header={
        <Header
        // counter={
        //   selectedItems.length ? "(" + selectedItems.length + "/10)" : "(10)"
        // }
        >
          Top Lecture
        </Header>
      }
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={preferences}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 resources" },
              { value: 20, label: "20 resources" },
            ],
          }}
          wrapLinesPreference={{}}
          stripedRowsPreference={{}}
          contentDensityPreference={{}}
          contentDisplayPreference={{
            options: [
              {
                id: "course",
                label: "Name",
                alwaysVisible: true,
              },
              { id: "state", label: "State" },
              { id: "level", label: "Level" },
              { id: "views", label: "Views" },
            ],
          }}
          stickyColumnsPreference={{
            firstColumns: {
              title: "Stick first column(s)",
              description:
                "Keep the first column(s) visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "First column", value: 1 },
                { label: "First two columns", value: 2 },
              ],
            },
            lastColumns: {
              title: "Stick last column",
              description:
                "Keep the last column visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "Last column", value: 1 },
              ],
            },
          }}
        />
      }
    />
  );
}

function ContributorTable(props) {
  const columnDefinitions = [
    {
      id: "creator",
      header: "Creator",
      cell: (e) => e.Creator,
    },
    {
      id: "courseNumber",
      header: "Number of courses",
      cell: (e) => e.coursesNum,
      sortingField: "coursesNum",
      isRowHeader: true,
    },
    {
      id: "views",
      header: "Views",
      cell: (e) => e.views,
      sortingField: "views",
    },
  ];

  const [preferences, setPreferences] = useState({
    pageSize: 15,
    columnDisplay: [
      { id: "creator", visible: true },
      { id: "courseNumber", visible: true },
      { id: "views", visible: true },
    ],
  });

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(props.topContributor, {
    filtering: {
      empty: <EmptyState title="No data" />,
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
    sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
  });

  return (
    <Table
      {...collectionProps}
      // onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      // selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: ({ selectedItems }) =>
          `${selectedItems.length} ${
            selectedItems.length === 1 ? "item" : "items"
          } selected`,
        itemSelectionLabel: ({ selectedItems }, item) => {
          const isItemSelected = selectedItems.filter(
            (i) => i.name === item.name
          ).length;
          return `${item.name} is ${isItemSelected ? "" : "not"} selected`;
        },
      }}
      columnDefinitions={columnDefinitions}
      columnDisplay={preferences.columnDisplay}
      items={items}
      loadingText="Loading resources"
      loading={props.loading}
      selectionType="multi"
      trackBy="name"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
          <Box padding={{ bottom: "s" }} variant="p" color="inherit">
            No resources to display.
          </Box>
        </Box>
      }
      filter={
        <div className="input-container">
          <TextFilter {...filterProps} filteringPlaceholder="Find resources" />
        </div>
      }
      header={
        <Header
        // counter={
        //   selectedItems.length ? "(" + selectedItems.length + "/10)" : "(10)"
        // }
        >
          Top Contributors
        </Header>
      }
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={preferences}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 resources" },
              { value: 20, label: "20 resources" },
            ],
          }}
          wrapLinesPreference={{}}
          stripedRowsPreference={{}}
          contentDensityPreference={{}}
          contentDisplayPreference={{
            options: [
              {
                id: "course",
                label: "Name",
                alwaysVisible: true,
              },
              { id: "state", label: "State" },
              { id: "level", label: "Level" },
              { id: "views", label: "Views" },
            ],
          }}
          stickyColumnsPreference={{
            firstColumns: {
              title: "Stick first column(s)",
              description:
                "Keep the first column(s) visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "First column", value: 1 },
                { label: "First two columns", value: 2 },
              ],
            },
            lastColumns: {
              title: "Stick last column",
              description:
                "Keep the last column visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "Last column", value: 1 },
              ],
            },
          }}
        />
      }
    />
  );
}

function OppValueTable(props) {
  const columnDefinitions = [
    {
      id: "name",
      header: "Course Name",
      cell: (e) => e.CourseName,
    },
    {
      id: "value",
      header: "Opportunity Value",
      cell: (e) => e.OppValue,
      sortingField: "name",
      isRowHeader: true,
    },
  ];
  const [preferences, setPreferences] = useState({
    pageSize: 15,
    columnDisplay: [
      { id: "name", visible: true },
      { id: "value", visible: true },
    ],
  });

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(props.topCourseOppValue, {
    filtering: {
      empty: <EmptyState title="No data" />,
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
    sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
  });

  return (
    <Table
      {...collectionProps}
      // onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      // selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: ({ selectedItems }) =>
          `${selectedItems.length} ${
            selectedItems.length === 1 ? "item" : "items"
          } selected`,
        itemSelectionLabel: ({ selectedItems }, item) => {
          const isItemSelected = selectedItems.filter(
            (i) => i.name === item.name
          ).length;
          return `${item.name} is ${isItemSelected ? "" : "not"} selected`;
        },
      }}
      columnDefinitions={columnDefinitions}
      columnDisplay={preferences.columnDisplay}
      items={items}
      loadingText="Loading resources"
      loading={props.loading}
      selectionType="multi"
      trackBy="name"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
          <Box padding={{ bottom: "s" }} variant="p" color="inherit">
            No resources to display.
          </Box>
        </Box>
      }
      filter={
        <div className="input-container">
          <TextFilter {...filterProps} filteringPlaceholder="Find resources" />
        </div>
      }
      header={
        <Header
        // counter={
        //   selectedItems.length ? "(" + selectedItems.length + "/10)" : "(10)"
        // }
        >
          Top Lecture
        </Header>
      }
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={preferences}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 resources" },
              { value: 20, label: "20 resources" },
            ],
          }}
          wrapLinesPreference={{}}
          stripedRowsPreference={{}}
          contentDensityPreference={{}}
          contentDisplayPreference={{
            options: [
              {
                id: "course",
                label: "Name",
                alwaysVisible: true,
              },
              { id: "state", label: "State" },
              { id: "level", label: "Level" },
              { id: "views", label: "Views" },
            ],
          }}
          stickyColumnsPreference={{
            firstColumns: {
              title: "Stick first column(s)",
              description:
                "Keep the first column(s) visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "First column", value: 1 },
                { label: "First two columns", value: 2 },
              ],
            },
            lastColumns: {
              title: "Stick last column",
              description:
                "Keep the last column visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "Last column", value: 1 },
              ],
            },
          }}
        />
      }
    />
  );
}

const Leaderboard = (props) => {
  const [activeHref, setActiveHref] = useState("leaderboard");
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [topCourse, setTopCourse] = useState([]);
  const [topLectures, setTopLectures] = useState([]);
  const [topContributor, setTopContributor] = useState([]);
  const [topCourseOppValue, setTopCourseOppValue] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [activeTabId, setActiveTabId] = useState("courses");
  const [isAdmin, setIsAdmin] = useState(false);
  const [contributor, setContributor] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTabId === "courses") {
      getTopCourse();
    } else if (activeTabId === "lectures") {
      getTopLecture();
    } else if (activeTabId === "contributor") {
      getContributor();
    } else {
      getTopOppValue();
    }
  }, [activeTabId]);

  useEffect(() => {
    checkAdmin();
  }, []);

  // check admin user
  const checkAdmin = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      if (user.attributes["custom:role"] === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTopCourse = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, coursePath + courseTopViewPath);
      let i = 0;
      const userPoolId = Auth.userPool.userPoolId;
      let topCourseTemp = [...data];
      let contributorTemp = { ...contributor };
      while (i < data.length) {
        if (!contributorTemp[data[i].CreatorID]) {
          const response = await API.get(
            apiName,
            userPath +
              byUserName +
              `?username=${data[i].CreatorID}&userPoolId=${userPoolId}`
          );
          contributorTemp[data[i].CreatorID] = response.UserAttributes[2].Value;
          topCourseTemp[i]["Creator"] = response.UserAttributes[2].Value;
        } else {
          topCourseTemp[i]["Creator"] = contributorTemp[data[i].CreatorID];
        }
        i++;
      }
      setContributor(contributorTemp);
      setTopCourse(topCourseTemp);
      // setCurrentData(topCourseTemp)
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getTopLecture = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, lecturePath + lectureTopViewPath);
      let i = 0;
      const userPoolId = Auth.userPool.userPoolId;
      let topLectureTemp = [...data];
      let contributorTemp = { ...contributor };
      while (i < data.length) {
        if (!contributorTemp[data[i].CreatorID]) {
          const response = await API.get(
            apiName,
            userPath +
              byUserName +
              `?username=${data[i].CreatorID}&userPoolId=${userPoolId}`
          );
          contributorTemp[data[i].CreatorID] = response.UserAttributes[2].Value;
          topLectureTemp[i]["Creator"] = response.UserAttributes[2].Value;
        } else {
          topLectureTemp[i]["Creator"] = contributorTemp[data[i].CreatorID];
        }
        i++;
      }
      setContributor(contributorTemp);
      setTopLectures(topLectureTemp);
      // setCurrentData(topLectureTemp)
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getContributor = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, contributorPath + topContributorPath);
      const userPoolId = Auth.userPool.userPoolId;
      let topContributorTemp = [...data];
      let contributorTemp = { ...contributor };
      let i = 0;
      while (i < data.length) {
        if (!contributorTemp[data[i].contributorID]) {
          const response = await API.get(
            apiName,
            userPath +
              byUserName +
              `?username=${data[i].contributorID}&userPoolId=${userPoolId}`
          );
          contributorTemp[data[i].contributorID] = response.UserAttributes[2].Value;
          topContributorTemp[i]["Creator"] = response.UserAttributes[2].Value;
        } else {
          topContributorTemp[i]["Creator"] = contributorTemp[data[i].contributorID];
        }
        i++;
      }
      setTopContributor(topContributorTemp);
      setCurrentData(topContributorTemp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const getTopOppValue = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, courseOppPath + topOppValuePath);
      console.log(data);
      setTopCourseOppValue(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <>
      <NavBar navigation={props.navigation} title="Cloud Academy" />

      <div className="dashboard-main">
        <Applayout
          navigation={
            <SideNavigation
              activeHref={activeHref}
              header={{ href: "/", text: "Management" }}
              onFollow={(event) => {
                if (!event.detail.external) {
                  event.preventDefault();
                  const href =
                    event.detail.href === "/"
                      ? "leaderboard"
                      : event.detail.href;
                  setActiveHref(href);
                  navigate(`/management/${href}`);
                }
              }}
              items={
                isAdmin
                  ? [
                      {
                        type: "section",
                        text: "Lectures",
                        items: [
                          {
                            type: "link",
                            text: "My Lectures",
                            href: "myLectures",
                          },
                          {
                            type: "link",
                            text: "Public Lectures",
                            href: "publicLectures",
                          },
                        ],
                      },
                      {
                        type: "section",
                        text: "Courses",
                        items: [
                          {
                            type: "link",
                            text: "My Courses",
                            href: "myCourses",
                          },
                          {
                            type: "link",
                            text: "Public Courses",
                            href: "publicCourses",
                          },
                          {
                            type: "link",
                            text: "Private Courses",
                            href: "privateCourses",
                          },
                        ],
                      },
                      { type: "divider" },
                      { type: "link", text: "User", href: "user" },
                      {
                        type: "link",
                        text: "Leaderboard",
                        href: "leaderboard",
                      },
                      { type: "link", text: "Sale", href: "sale" },
                      { type: "link", text: "Set UI", href: "setUI" },
                      {
                        type: "link",
                        text: "Batch Management",
                        href: "batchManange",
                      },
                    ]
                  : [
                      {
                        type: "section",
                        text: "Lectures",
                        items: [
                          {
                            type: "link",
                            text: "My Lectures",
                            href: "myLectures",
                          },
                          {
                            type: "link",
                            text: "Public Lectures",
                            href: "publicLectures",
                          },
                        ],
                      },
                      {
                        type: "section",
                        text: "Courses",
                        items: [
                          {
                            type: "link",
                            text: "My Courses",
                            href: "myCourses",
                          },
                          {
                            type: "link",
                            text: "Public Courses",
                            href: "publicCourses",
                          },
                        ],
                      },
                    ]
              }
            />
          }
          content={
            <div>
              <Tabs
                onChange={(detail) => setActiveTabId(detail.detail.activeTabId)}
                // activeTabId={activeTabId}
                tabs={[
                  {
                    label: "Top Courses",
                    id: "courses",
                    content: (
                      <CourseTable topCourse={topCourse} loading={loading} />
                    ),
                  },
                  {
                    label: "Top Lectures",
                    id: "lectures",
                    content: (
                      <LectureTable topLecture={topLectures} loading={loading} />
                    ),
                  },
                  {
                    label: "Top Contributors",
                    id: "contributor",
                    content: (
                      <ContributorTable topContributor={topContributor} loading={loading} />
                    ),
                  },
                  {
                    label: "Top Opp Value",
                    id: "oppValue",
                    content: (
                      <OppValueTable topCourseOppValue={topCourseOppValue} loading={loading} />
                    ),
                  },
                ]}
              />
            </div>
          }
        />
        <Footer />
      </div>
    </>
  );
};
// export default withAuthenticator(Leaderboard);
export default Leaderboard;
