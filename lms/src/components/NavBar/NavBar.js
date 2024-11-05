import React from "react";
import { Auth } from "aws-amplify";
import { Navigate } from "react-router-dom";
import { TopNavigation, Input } from "@cloudscape-design/components";
import { withTranslation } from "react-i18next";
import { API, Storage } from "aws-amplify";
import { getUISet } from "../../utils/tools";
import { setTheme } from "../../theme/theme"

export class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authChecked: false,
      authenticated: false,
      redirectAuth: false,
      redirectHome: false,
      redirectHelp: false,
      redirectMyLearning: false,
      user: null,
      action: "",
      searchKey: "",
      uiSet: {},
      logo: null,
    };
  }

  componentDidMount() {
    Auth.currentAuthenticatedUser({
      // Optional, By default is false. If set to true,
      // this call will send a request to Cognito to get the latest user data
      bypassCache: true,
    })
      .then((user) => {
        this.setState({
          authChecked: true,
          authenticated: true,
          user: user,
        });
      })
      .catch((err) => {
        this.setState({
          authChecked: true,
          authenticated: false,
        });
      });

      if (!this.props.uiSet){
        getUISet().then((data) => {
          this.setState({ uiSet: data });
          if (data) {
            Storage.get(data.Logo, { level: "public" }).then((res) => {
              this.setState({ logo: res });
            });
            setTheme(data)
          }
        });
      }else {
        this.setState({ uiSet: this.props.uiSet });
        setTheme(this.props.uiSet)
      }
    // API.get(apiName, configUI + uiConfigId)
    //   .then((data) => {
    //     // console.log(data)
    //     localStorage.setItem("AWSLIBVN_UISET", JSON.stringify(data));
    //     this.setState({ uiSet: data });
    //     // console.log(data);
    //     if (data) {
    //       Storage.get(data.Logo, { level: "public" }).then((res) => {
    //         this.setState({ logo: res });
    //         // console.log(res);
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  }

  startAuthentication(action) {
    this.setState({
      redirectAuth: true,
      action: action,
    });
  }

  async startSignOut() {
    try {
      await Auth.signOut({ global: true });
    } catch (error) {
      console.log("error signing out: ", error);
      Auth.userHasAuthenticated(false);
    }
    if (this.props.href != "/") {
      this.setState({
        redirectHome: true,
      });
    } else {
      window.location.reload();
    }
    this.setState({
      authChecked: true,
      authenticated: false,
    });
  }

  onLanguageHandle = (event) => {
    let newLang = event.detail.id;
    this.props.i18n.changeLanguage(newLang);
  };

  render() {
    const { t } = this.props;
    return this.state.redirectAuth ? (
      <Navigate to="/auth" state={{ action: this.state.action }} />
    ) : this.state.redirectHome ? (
      <Navigate to="/" />
    ) : this.state.redirectMyLearning ? (
      <Navigate to="/mylearning" />
    ) : this.state.redirectHelp ? (
      <Navigate to="/help" />
    ) : (
      <div id="h" style={{ position: "sticky", top: 0, zIndex: 1002 }}>
        <TopNavigation
          identity={{
            href: "/",
            title: this.state.uiSet?.WebName
              ? this.state.uiSet.WebName
              : "AWS Special Force Portal",
            // logo: {
            //   src: this.state.logo ? this.state.logo : AWSLogo,
            //   alt: "AWS Logo",
            // },
          }}
          search={
            <Input
              type="search"
              placeholder={t("nav.search")}
              ariaLabel="Search"
              value={this.props.searchKey}
              onChange={({ detail }) => {
                // this.props.setSearchKey(detail.value);
                this.props.searchCourse(detail.value);
              }}
            />
          }
          utilities={
            !this.state.authChecked
              ? []
              : !this.state.authenticated
              ? [
                  // {
                  //     type: "menu-dropdown",
                  //     text: t('nav.language.title'),
                  //     items: [
                  //         {
                  //             id: "vn",
                  //             text: t('nav.language.item-vn'),
                  //         },
                  //         {
                  //             id: "en",
                  //             text: t('nav.language.item-en'),
                  //         }
                  //     ],
                  //     onItemClick: (e) => this.onLanguageHandle(e)
                  // },
                  {
                    type: "button",
                    text: t("nav.signIn"),
                    onClick: () => {
                      this.startAuthentication("signIn");
                    },
                  },
                  {
                    type: "button",
                    variant: "primary-button",
                    text: t("nav.signUp"),
                    onClick: () => {
                      this.startAuthentication("signUp");
                    },
                  },
                ]
              : [
                  // {
                  //     type: "menu-dropdown",
                  //     text: t('nav.language.title'),
                  //     items: [
                  //         {
                  //             id: "vn",
                  //             text: t('nav.language.item-vn'),
                  //         },
                  //         {
                  //             id: "eng",
                  //             text: t('nav.language.item-en'),
                  //         }
                  //     ],
                  //     onItemClick: (e) => this.onLanguageHandle(e)
                  // },
                  {
                    type: "menu-dropdown",
                    text: this.state.user.attributes.email,
                    iconName: "user-profile",
                    items: [
                      {
                        id: "mylearning",
                        text: t("nav.user.learning"),
                      },
                      {
                        id: "signout",
                        text: t("nav.user.signOut"),
                      },
                      {
                        id: "help",
                        text: t("nav.user.help"),
                      },
                    ],
                    onItemClick: (e) => {
                      if (e.detail.id === "mylearning") {
                        if (this.props.href != "/mylearning") {
                          this.setState({
                            redirectMyLearning: true,
                          });
                        } else {
                          window.location.reload();
                        }
                      } else if (e.detail.id === "signout") {
                        this.startSignOut();
                      }
                      if (e.detail.id === "help") {
                        this.setState({
                          redirectHelp: true,
                        });
                      }
                    },
                  },
                ]
          }
        />
      </div>
    );
  }
}

export default withTranslation()(NavBar);
