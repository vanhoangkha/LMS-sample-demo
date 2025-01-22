import React, { useState, useEffect } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import Tabs from "@cloudscape-design/components/tabs";
import {
  Container,
  Header,
  ColumnLayout,
  SpaceBetween,
  Box,
  ExpandableSection,
} from "@cloudscape-design/components";

const UserDetail = (props) => {
  // console.log(useLocation())
  const [userData, setUserData] = useState();
  const privousData = useLocation();
  console.log(privousData)
  useEffect(() => {
    setUserData(privousData.state);
  }, []);

  return (
    <>
      {userData ? (
        <Container header={<Header variant="h2">User Progress</Header>}>
          <Header variant="h3">{userData.name}</Header>
          <ColumnLayout columns={1} variant="text-grid">
              <SpaceBetween direction="vertical" size="xs">
                {userData.detail.Progress.map((item, index) => (
                  <div>
                    <Box variant="awsui-key-label">{item.CourseID}</Box>
                    <div>{item.ProgressPercent}%</div>
                  </div>
                ))}
              </SpaceBetween>
          </ColumnLayout>
        </Container>
      ) : (
        <></>
      )}
    </>
  );
};

export default UserDetail;
