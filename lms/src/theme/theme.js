import { Theme, applyTheme } from "@cloudscape-design/components/theming";

export const setTheme = (data) => {
  const theme: Theme = {
    tokens: {
      // Values are applied globally, except for visual contexts
      colorBackgroundLayoutMain: {
        // Specify value for light and dark mode
        light: "white",
        dark: "blue",
      },
      // Shorter syntax to apply the same value for both light and dark mode
      colorTextAccent: data?.HoverColor || "#EC7211",
      colorBackgroundLayoutToggleDefault: data?.HoverColor || "#EC7211",
      colorBackgroundButtonPrimaryDefault: data?.MainColor || "#EC7211",
      colorBackgroundButtonPrimaryHover: data?.HoverColor || "#EC7211",
      colorBackgroundButtonPrimaryActive: data?.HoverColor || "#EC7211",
      colorTextButtonPrimaryDefault: data?.TextColor || "#7d8998",
      colorTextButtonNormalDefault: data?.MainColor || "#EC7211",
      colorBorderButtonNormalDefault: data?.MainColor || "#EC7211",
      colorBackgroundButtonNormalHover: data?.TextColor || "#EC7211",
      colorBorderButtonNormalHover: data?.HoverColor || "#EC7211",
      colorTextButtonNormalHover: data?.HoverColor || "#EC7211",
    },
    contexts: {
      // Values for visual contexts. Unless specified, default values will be applied
      "top-navigation": {
        tokens: {
          // colorTextTopNavigationTitle: '#EC7211',
          // colorBackgroundContainerContent: "#ffffff",
          // colorTextBodyDefault: "#000716",
          // colorBackgroundInputDefault: "#ffffff",
          // colorTextTopNavigationTitle: "#000716",
          // colorTextInteractiveDefault: "#000716",
          colorTextInteractiveHover: data?.MainColor || "#EC7211",
          colorTextButtonPrimaryDefault: "#ffffff",
          colorBackgroundButtonPrimaryDefault: data?.MainColor || "#EC7211",
          colorTextAccent: data?.HoverColor || "#EC7211",
          colorBorderInputFocused: data?.HoverColor || "#EC7211",
        },
      },
      header: {
        tokens: {
          colorBackgroundLayoutMain: data?.MainColor || "#EC7211",
          colorTextLinkDefault: data?.TextColor || "",
          colorTextBreadcrumbIcon: data?.TextColor || "",
          colorTextBreadcrumbCurrent: data?.TextColor || "",
        },
      },
    },
  };
  applyTheme({ theme });
};
