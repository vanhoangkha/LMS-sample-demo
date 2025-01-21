import { I18n } from 'aws-amplify';
import {
  Authenticator,
  View,
  Image,
  Text,
  Heading,
  Button,
  useTheme,
  useAuthenticator,
  Theme,
  ThemeProvider
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Auth } from 'aws-amplify';
import { API } from "aws-amplify";
import { useState, useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { getUISet } from "../../utils/tools";
import { apiName, usersPath } from "../../utils/api"
import { translations } from '@aws-amplify/ui-react';
import './AuthForm.css';

I18n.putVocabularies(translations);
I18n.setLanguage('en');

I18n.putVocabularies({
  vn: {
    'Sign In': 'Đăng Nhập',
    'Sign in': 'Đăng nhập',
    'Create Account': "Tạo tài khoản",
    'Forgot your password?': 'Quên mật khẩu?',
    'Signing in': "Đăng nhập ...",
    'Creating Account': "Tạo tài khoản ..."
  },
});


export default function AuthForm(props) {
  const [theme, setTheme] = useState();
  const { tokens } = useTheme();
  const location = useLocation();
  
  // multi language
  const {t} = useTranslation();
  const formFields = {
    signIn: {
      username: {
        label: t("auth.email.label"),
        placeholder: t("auth.email.placeholder"),
        isRequired: false,
        order: 1
      },
      password: {
        label: t("auth.password.label"),
        placeholder: t("auth.password.placeholder"),
        isRequired: false,
        order: 2,
      },
    },
    signUp: {
      email: {
        label: t("auth.email.label"),
        placeholder: t("auth.email.placeholder"),
        isRequired: true,
        order: 1
      },
      password: {
        label: t("auth.password.label"),
        placeholder: t("auth.password.placeholder"),
        isRequired: true,
        order: 2,
      },
      confirm_password: {
        label: t("auth.confirm_pass.label"),
        placeholder: t("auth.confirm_pass.placeholder"),
        isRequired: true,
        order: 3,
      },
      'custom:name_on_certificate': {
        placeholder: 'Enter your Name on Certificate',
        isRequired: true,
        label: "Name on Certificate",
        order: 4
      }
    },
  };

  const startSignOut = async() => {
    try {
      await Auth.signOut({global: true});
      console.log("log out");
    } catch (error) {
      console.log("error signing out: ", error);
    }
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  
  const services = {
    async handleSignIn(formData) {
      let { username, password, attributes } = formData;
      let user = null;
      // try {
      //   const res = await Auth.signOut({ global: true });
      //   // await API.get(apiName, usersPath + user.signInUserSession.refreshToken.token)
      //   // console.log("Revoke done")
      // } catch (error) {
      //   console.log('error signing out: ', error);
      // }
      await Auth.signIn({
        username,
        password,
        attributes,
        autoSignIn: {
          enabled: true,
        },
      });

      // await API.put(apiName, usersPath);
      let userInfor = await Auth.currentUserInfo();
      console.log(userInfor)

      await API.put(apiName, usersPath, {body: {
        UserID: userInfor.username,
        Identity: userInfor.id
      }});

      // startSignOut();
      await Auth.signOut({global: true});
      console.log("after log out");
      // await sleep(5000)
      console.log("after sleep");
      // return user;
      return Auth.signIn({
        username,
        password,
        attributes,
        autoSignIn: {
          enabled: true,
        },
      });
    },
  };
  
  useEffect(() => {
    getUISet().then((data) => {
      const theme: Theme = {
        name: 'Auth Example Theme',
        tokens: {
          colors: {
            brand: {
              primary: {
                '10': tokens.colors.teal['100'],
                '80': tokens.colors.teal['40'],
                '90': tokens.colors.teal['20'],
                '100': tokens.colors.teal['10'],
              },
            },
          },
          components: {
            button: {
              primary: {
                backgroundColor: {
                  value: data?.MainColor || '#EC7211' 
                },
                borderColor: {
                  value: data?.MainColor || '#EC7211' 
                },
                color: {
                  value: data?.TexColor || 'white'
                },
                _hover: {
                  backgroundColor: {
                    value: data?.MainColor || '#EC7211',
                  },
                },
              },
              _hover: {
                backgroundColor: {
                  value: data?.MainColor || '#EC7211',
                },
              },
            },
            tabs: {
              item: {
                _focus: {
                  color: {
                    value: data?.MainColor || '#EC7211',
                  }
                },
                _hover: {
                  color: {
                    value: data?.MainColor || '#EC7211',
                  },
                },
                _active: {
                  color: {
                    value: data?.MainColor || '#EC7211',
                  },
                  borderColor: {
                    value: data?.MainColor || '#EC7211'
                  }
                },
              },
            },
          },
        },
      };
      setTheme(theme)
     });
  }, [])
  
  return (
    <ThemeProvider theme={theme}>
    <Authenticator initialState={location.state.action ? location.state.action : "signIn"} formFields={formFields} services={services}>
      <Navigate to={location.state.path ? location.state.path : "/"} replace={true} />
    </Authenticator>
    </ThemeProvider>
  );
}
