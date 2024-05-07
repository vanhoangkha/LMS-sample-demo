import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import {} from "@aws-amplify/ui-react";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import Applayout from "@cloudscape-design/components/app-layout";
import { useNavigate, useLocation } from "react-router-dom";
import { BreadcrumbGroup } from "@cloudscape-design/components";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Auth } from "aws-amplify";

import "./Management.css";

function Management(props) {
  const [activeHref, setActiveHref] = useState();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    setActiveHref(location.pathname.split("/").pop());
    ionViewCanEnter();
  }, []);

  const ionViewCanEnter = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setAuthChecked(true);
      setAuthenticated(true);
      if ( user.attributes['custom:role'] === "admin"){
        setIsAdmin(true)
      }
    } catch {
      setAuthChecked(true);
      setAuthenticated(false);
    }
  };
  
  return (
    <>
      {authChecked === false ? [] : !authenticated ? (
        <Navigate to="/auth" />
        // console.log(loggedIn)
      ) : (
        <div>
          <NavBar navigation={props.navigation} title="Cloud Academy" />
          <div className="dashboard-main">
            <Applayout
              className="management"
              breadcrumbs={
                <BreadcrumbGroup
                  items={[
                    { text: "Home", href: "/management" },
                    // { text: "My Courses", href: "/management/myCourses"}
                  ]}
                  ariaLabel="Breadcrumbs"
                />
              }
              navigation={
                <SideNavigation
                  activeHref={activeHref}
                  header={{ href: "/", text: "Management" }}
                  // className="side-nav-custom"
                  onFollow={(event) => {
                    if (!event.detail.external) {
                      event.preventDefault();
                      const href =
                        event.detail.href === "/"
                          ? "myLectures"
                          : event.detail.href;
                      setActiveHref(href);
                      navigate(`/management/${href}`);
                    }
                  }}
                  items={ isAdmin ? [
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
                    { type: "link", text: "User", href: "user" },
                    { type: "link", text: "Leaderboard", href: "leaderboard" },
                    { type: "link", text: "Sale", href: "sale" },
                    { type: "link", text: "Set UI", href: "setUI" },
                    { type: "link", text: "Batch Management", href: "batchManange"},
                  ] : [
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
                  ]}
                />
              }
              content={
                <div className="content">
                  <Outlet checkAuthen={ionViewCanEnter}/>
                </div>
              }
            />
            <Footer />
          </div>
        </div>
      )}
    </>
  );
};

// export default withAuthenticator(Management);
export default Management;
