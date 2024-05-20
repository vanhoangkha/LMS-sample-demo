import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
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
  Link,
  Box,
  ColumnLayout,
  FileUpload,
  TextFilter,
  Textarea,
  Alert,
  Pagination,
  CollectionPreferences,
  Flashbar,
  Icon,
  ExpandableSection,
  Select,
} from "@cloudscape-design/components";
import NavBar from "../../components/NavBar/NavBar";
import { API, Storage } from "aws-amplify";
import { uiConfigPath, apiName } from "../../utils/api";

const errorMess = "Error! An error occurred. Please try again later";

export default function UpdateSetUI(props) {
  const { state } = useLocation();

  const [id, setId] = useState("");
  const [banner, setBanner] = useState([]);
  const [bannerIcon, setBannerIcon] = useState([]);
  const [logo, setLogo] = useState([]);
  const [hlImage1, setHlImage1] = useState([]);
  const [hlImage2, setHlImage2] = useState([]);
  const [hlImage3, setHlImage3] = useState([]);
  const [mainColor, setMainColor] = useState("");
  const [hoverColor, setHoverColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [subTextColor, setSubTextColor] = useState("");
  const [highlight, setHighLight] = useState([
    { title: "", desc: "" },
    { title: "", desc: "" },
    { title: "", desc: "" },
  ]);
  const [defaultThumb, setDefaultThumb] = useState([]);
  const [header, setHeader] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [leftFooter, setLeftFooter] = useState([]);
  const [rightFooter, setRightFooter] = useState([]);
  const [currentLeftInfo, setCurrentLeftInfo] = useState("");
  const [currentRightInfo, setCurrentRightInfo] = useState("");

  const [activeStepIndex, setActiveStepIndex] = React.useState(0);
  const [loading, setLoading] = useState(false);
  const [flashItem, setFlashItem] = useState([]);


  useEffect(() => {
    console.log(state);
    setId(state.ID);
    // setBanner(state.Banner);
    // setBannerIcon(state.BannerIcon);
    // setLogo(state.Logo);
    // setHlImage(state.HLImages);
    setMainColor(state.MainColor);
    setHoverColor(state.HoverColor);
    setTextColor(state.TextColor);
    setSubTextColor(state.subTextColor);
    setHighLight(state.Highlight);
    setHeader(state.WebTitle);
    setName(state.WebName);
    setDesc(state.WebDesc);
    setLeftFooter(state.Footer.Left);
    setRightFooter(state.Footer.Right);
  }, []);

  const updateConfig = async () => {
    setLoading(true);
    const folderImage = `UI/${id}/`;
    const jsonData = {
      ID: id,
      WebName: name,
      WebTitle: header,
      WebDesc: desc,
      Highlight: highlight,
      HLImages: state.HLImages,
      Banner: state.Banner,
      BannerIcon: state.BannerIcon,
      MainColor: mainColor,
      TextColor: textColor,
      HoverColor: hoverColor,
      TextColor: textColor,
      SubTextColor: subTextColor,
      Footer: {
        Left: leftFooter,
        Right: rightFooter
      }
    };
    try {
      if (logo.length > 0) {
        var randomLogo = Math.floor(Math.random() * 1000000);
        const s3KeyLogo =
          folderImage +
          `${randomLogo}-` +
          `logo-${logo[0].name.replace(/ /g, "_")}`;
        await Storage.put(s3KeyLogo, logo[0], {
          level: "public",
        });
        jsonData.Logo = s3KeyLogo;
      }

      if (banner.length > 0) {
        var randomBanner = Math.floor(Math.random() * 1000000);
        const s3KeyBanner =
          folderImage +
          `${randomBanner}-` +
          `banner-${banner[0].name.replace(/ /g, "_")}`;
        await Storage.put(s3KeyBanner, banner[0], {
          level: "public",
        });
        jsonData.Banner = s3KeyBanner;
      }

      if (bannerIcon.length > 0) {
        var randomBannerIcon = Math.floor(Math.random() * 1000000);
        const s3KeyBannerIcon =
          folderImage +
          `${randomBannerIcon}-` +
          `bannericon-${bannerIcon[0].name.replace(/ /g, "_")}`;
        await Storage.put(s3KeyBannerIcon, bannerIcon[0], {
          level: "public",
        });
        jsonData.BannerIcon = s3KeyBannerIcon;
      }

      if (defaultThumb.length > 0) {
        var randomLogo = Math.floor(Math.random() * 1000000);
        const s3KeyThumbnail =
          folderImage +
          `${randomLogo}-` +
          `thumb-${defaultThumb[0].name.replace(/ /g, "_")}`;
        await Storage.put(s3KeyThumbnail, defaultThumb[0], {
          level: "public",
        });
        jsonData.DefaultThumb = s3KeyThumbnail;
      }

      if (hlImage1.length > 0) {
        var randomHL = Math.floor(Math.random() * 1000000);
        const s3KeyHl1 =
          folderImage +
          `${randomHL}-` +
          `hl${0}-${hlImage1[0].name.replace(/ /g, "_")}`;
        await Storage.put(s3KeyHl1, hlImage1[0], {
          level: "public",
        });
        jsonData.HLImages[0] = s3KeyHl1;
      }

      if (hlImage2.length > 0) {
        var randomHL = Math.floor(Math.random() * 1000000);
        const s3KeyHl2 =
          folderImage +
          `${randomHL}-` +
          `hl${1}-${hlImage2[0].name.replace(/ /g, "_")}`;
        await Storage.put(s3KeyHl2, hlImage2[0], {
          level: "public",
        });
        jsonData.HLImages[1] = s3KeyHl2;
      }

      if (hlImage3.length > 0) {
        var randomHL = Math.floor(Math.random() * 1000000);
        const s3KeyHl3 =
          folderImage +
          `${randomHL}-` +
          `hl${2}-${hlImage3[0].name.replace(/ /g, "_")}`;
        await Storage.put(s3KeyHl3, hlImage3[0], {
          level: "public",
        });
        jsonData.HLImages[2] = s3KeyHl3;
      }

      await API.put(apiName, uiConfigPath, { body: jsonData });
      setLoading(false);
    } catch (error) {
      resetFail();
      console.log(error);
    }

  };

  const resetFail = () => {
    setLoading(false);
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

  const deleteInfor = (index, kind) => {
    if ( kind === 'left'){
      let list = [...leftFooter];
      list.splice(index, 1);
      setLeftFooter(list);
    }else{
      let list = [...rightFooter];
      list.splice(index, 1);
      setRightFooter(list);
    }
    
  }
  const renderInfor = (data, kind) => {
    return <>
        {data.map((item, index) => (
          <div className="requirement-item">
            <li className="requirement-item-haft" key={index}>
              {item}
            </li>
            <div
              className="requirement-item-haft"
              style={{ textAlign: "right"}}
              onClick={(e) => deleteInfor(index, kind)}
            >
              <Icon name="close" size="inherit" />
            </div>
          </div>
        ))}
      </>
  }

  return (
    <>
      <NavBar navigation={props.navigation} title="Cloud Academy" />
      <div className="dashboard-main">
        <div>
          <Outlet />
          <div style={{ paddingLeft: 20 }}>
            <BreadcrumbGroup
              items={[
                { text: "Home", href: "#" },
                { text: "Set UI", href: "#components" },
              ]}
              ariaLabel="Breadcrumbs"
            />
          </div>
          <div className="dashboard-main" style={{ padding: "0 20px" }}>
            <Outlet />
            <Wizard
              i18nStrings={{
                stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
                collapsedStepsLabel: (stepNumber, stepsCount) =>
                  `Step ${stepNumber} of ${stepsCount}`,
                navigationAriaLabel: "Steps",
                cancelButton: "Cancel",
                previousButton: "Previous",
                nextButton: "Next",
                submitButton: "Update",
                // optional: "optional",
              }}
              isLoadingNextStep={loading}
              onSubmit={updateConfig}
              onNavigate={({ detail }) =>
                setActiveStepIndex(detail.requestedStepIndex)
              }
              activeStepIndex={activeStepIndex}
              allowSkipTo
              steps={[
                {
                  title: "Update title",
                  info: <Link variant="info">Info</Link>,
                  description: "Choose title and description for flatform",
                  content: (
                    <SpaceBetween size="l">
                      <Container
                        header={<Header variant="h2">Web header config</Header>}
                      >
                        <SpaceBetween direction="vertical" size="l">
                          {/* <FormField
                            label="Set name"
                            description="Enter the set of name"
                          >
                            <Input
                              onChange={({ detail }) => setId(detail.value)}
                              value={id}
                            />
                          </FormField> */}
                          <div>
                              <Box variant="awsui-key-label">Set ID</Box>
                              <div>{id}</div>
                          </div>
                          <FormField
                            label="Web name"
                            description="Enter the name of web"
                          >
                            <Input
                              onChange={({ detail }) => setName(detail.value)}
                              value={name}
                            />
                          </FormField>
                          <FormField
                            label="Web title"
                            description="Enter the website title"
                          >
                            <Input
                              onChange={({ detail }) => setHeader(detail.value)}
                              value={header}
                            />
                          </FormField>
                          <FormField
                            label="Web description"
                            description="Enter description of web"
                          >
                            <Textarea
                              onChange={({ detail }) => setDesc(detail.value)}
                              value={desc}
                            />
                          </FormField>
                        </SpaceBetween>
                      </Container>
                      <Container
                        header={
                          <Header
                            variant="h2"
                            description="Enter three highlights about website"
                          >
                            Highlight
                          </Header>
                        }
                      >
                        <SpaceBetween direction="vertical" size="l">
                          <ColumnLayout columns={2} variant="text-grid">
                            <FormField label="Highlight title 1" stretch={true}>
                              <Input
                                onChange={({ detail }) => {
                                  var oldHighlight = [...highlight];
                                  oldHighlight[0].title = detail.value;
                                  // console.log(oldHighlight)
                                  setHighLight(oldHighlight);
                                  // setValue({...value, title: detail.value})
                                }}
                                value={highlight[0].title}
                              />
                            </FormField>
                            <FormField
                              label="Highlight description 1"
                              stretch={true}
                            >
                              <Input
                                onChange={({ detail }) => {
                                  var oldHighlight = [...highlight];
                                  oldHighlight[0].desc = detail.value;
                                  setHighLight(oldHighlight);
                                }}
                                value={highlight[0].desc}
                              />
                            </FormField>
                          </ColumnLayout>
                          <ColumnLayout columns={2} variant="text-grid">
                            <FormField label="Highlight title 2" stretch={true}>
                              <Input
                                onChange={({ detail }) => {
                                  var oldHighlight = [...highlight];
                                  oldHighlight[1].title = detail.value;
                                  setHighLight(oldHighlight);
                                }}
                                value={highlight[1].title}
                              />
                            </FormField>
                            <FormField
                              label="Highlight description 2"
                              stretch={true}
                            >
                              <Input
                                onChange={({ detail }) => {
                                  var oldHighlight = [...highlight];
                                  oldHighlight[1].desc = detail.value;
                                  setHighLight(oldHighlight);
                                }}
                                value={highlight[1].desc}
                              />
                            </FormField>
                          </ColumnLayout>
                          <ColumnLayout columns={2} variant="text-grid">
                            <FormField label="Highlight title 3" stretch={true}>
                              <Input
                                onChange={({ detail }) => {
                                  var oldHighlight = [...highlight];
                                  oldHighlight[2].title = detail.value;
                                  setHighLight(oldHighlight);
                                }}
                                value={highlight[2].title}
                              />
                            </FormField>
                            <FormField
                              label="Highlight description 3"
                              stretch={true}
                            >
                              <Input
                                onChange={({ detail }) => {
                                  var oldHighlight = [...highlight];
                                  oldHighlight[2].desc = detail.value;
                                  setHighLight(oldHighlight);
                                }}
                                value={highlight[2].desc}
                              />
                            </FormField>
                          </ColumnLayout>
                        </SpaceBetween>
                      </Container>
                    </SpaceBetween>
                  ),
                },
                {
                  title: "Update images",
                  info: <Link variant="info">Info</Link>,
                  content: (
                    <Container
                      header={<Header variant="h2">Images and Icon</Header>}
                    >
                      <SpaceBetween direction="vertical" size="l">
                        <FormField label="Banner" description={state.Banner ? "Current file: " + `${state.Banner.split("/")[2]}` : ""}>
                          <FileUpload
                            onChange={({ detail }) => setBanner(detail.value)}
                            value={banner}
                            i18nStrings={{
                              uploadButtonText: (e) =>
                                e ? "Choose files" : "Choose file",
                              dropzoneText: (e) =>
                                e
                                  ? "Drop files to upload"
                                  : "Drop file to upload",
                              removeFileAriaLabel: (e) =>
                                `Remove file ${e + 1}`,
                              limitShowFewer: "Show fewer files",
                              limitShowMore: "Show more files",
                              errorIconAriaLabel: "Error",
                            }}
                            showFileLastModified
                            showFileSize
                            showFileThumbnail
                            tokenLimit={3}
                            accept=".jpg,.jpeg,.png"
                            constraintText=".jpg, .jpeg, .png"
                          />
                        </FormField>
                        <FormField label="Banner icon" description={state.BannerIcon ? "Current file: " + `${state.BannerIcon.split("/")[2]}` : ""}>
                          <FileUpload
                            onChange={({ detail }) =>
                              setBannerIcon(detail.value)
                            }
                            value={bannerIcon}
                            i18nStrings={{
                              uploadButtonText: (e) =>
                                e ? "Choose files" : "Choose file",
                              dropzoneText: (e) =>
                                e
                                  ? "Drop files to upload"
                                  : "Drop file to upload",
                              removeFileAriaLabel: (e) =>
                                `Remove file ${e + 1}`,
                              limitShowFewer: "Show fewer files",
                              limitShowMore: "Show more files",
                              errorIconAriaLabel: "Error",
                            }}
                            showFileLastModified
                            showFileSize
                            showFileThumbnail
                            tokenLimit={3}
                            accept=".jpg,.jpeg,.png"
                            constraintText=".jpg, .jpeg, .png"
                          />
                        </FormField>
                        <FormField label="Web logo" description={state.Logo ? "Current file: " + `${state.Logo.split("/")[2]}` : ""}>
                          <FileUpload
                            onChange={({ detail }) => setLogo(detail.value)}
                            value={logo}
                            i18nStrings={{
                              uploadButtonText: (e) =>
                                e ? "Choose files" : "Choose file",
                              dropzoneText: (e) =>
                                e
                                  ? "Drop files to upload"
                                  : "Drop file to upload",
                              removeFileAriaLabel: (e) =>
                                `Remove file ${e + 1}`,
                              limitShowFewer: "Show fewer files",
                              limitShowMore: "Show more files",
                              errorIconAriaLabel: "Error",
                            }}
                            showFileLastModified
                            showFileSize
                            showFileThumbnail
                            tokenLimit={3}
                            accept=".jpg,.jpeg,.png"
                            constraintText=".jpg, .jpeg, .png"
                          />
                        </FormField>
                        <FormField label="Highlight image">
                          <FileUpload
                            onChange={({ detail }) => setHlImage1(detail.value)}
                            value={hlImage1}
                            i18nStrings={{
                              uploadButtonText: (e) =>
                                e ? "Choose files" : "Choose icon 1",
                              dropzoneText: (e) =>
                                e
                                  ? "Drop files to upload"
                                  : "Drop file to upload",
                              removeFileAriaLabel: (e) =>
                                `Remove file ${e + 1}`,
                              limitShowFewer: "Show fewer files",
                              limitShowMore: "Show more files",
                              errorIconAriaLabel: "Error",
                            }}
                            showFileLastModified
                            showFileSize
                            showFileThumbnail
                            tokenLimit={3}
                            accept=".jpg,.jpeg,.png"
                            constraintText=".jpg, .jpeg, .png"
                          />

                          <FileUpload
                            onChange={({ detail }) => setHlImage2(detail.value)}
                            value={hlImage2}
                            i18nStrings={{
                              uploadButtonText: (e) =>
                                e ? "Choose files" : "Choose icon 2",
                              dropzoneText: (e) =>
                                e
                                  ? "Drop files to upload"
                                  : "Drop file to upload",
                              removeFileAriaLabel: (e) =>
                                `Remove file ${e + 1}`,
                              limitShowFewer: "Show fewer files",
                              limitShowMore: "Show more files",
                              errorIconAriaLabel: "Error",
                            }}
                            showFileLastModified
                            showFileSize
                            showFileThumbnail
                            tokenLimit={3}
                            accept=".jpg,.jpeg,.png"
                            constraintText=".jpg, .jpeg, .png"
                          />

                          <FileUpload
                            onChange={({ detail }) => setHlImage3(detail.value)}
                            value={hlImage3}
                            i18nStrings={{
                              uploadButtonText: (e) =>
                                e ? "Choose files" : "Choose icon 3",
                              dropzoneText: (e) =>
                                e
                                  ? "Drop files to upload"
                                  : "Drop file to upload",
                              removeFileAriaLabel: (e) =>
                                `Remove file ${e + 1}`,
                              limitShowFewer: "Show fewer files",
                              limitShowMore: "Show more files",
                              errorIconAriaLabel: "Error",
                            }}
                            showFileLastModified
                            showFileSize
                            showFileThumbnail
                            tokenLimit={1}
                            accept=".jpg,.jpeg,.png"
                            constraintText=".jpg, .jpeg, .png"
                          />
                        </FormField>
                        <FormField label="Default thumbnail" description={state.Logo ? "Current file: " + `${state.Logo.split("/")[2]}` : ""}>
                          <FileUpload
                            onChange={({ detail }) => setDefaultThumb(detail.value)}
                            value={defaultThumb}
                            i18nStrings={{
                              uploadButtonText: (e) =>
                                e ? "Choose files" : "Choose file",
                              dropzoneText: (e) =>
                                e
                                  ? "Drop files to upload"
                                  : "Drop file to upload",
                              removeFileAriaLabel: (e) =>
                                `Remove file ${e + 1}`,
                              limitShowFewer: "Show fewer files",
                              limitShowMore: "Show more files",
                              errorIconAriaLabel: "Error",
                            }}
                            showFileLastModified
                            showFileSize
                            showFileThumbnail
                            tokenLimit={3}
                            accept=".jpg,.jpeg,.png"
                            constraintText=".jpg, .jpeg, .png"
                          />
                        </FormField>
                      </SpaceBetween>
                    </Container>
                  ),
                },
                {
                  title: "Theme",
                  content: (
                    <Container
                      header={<Header variant="h2">Color Configure</Header>}
                    >
                      <SpaceBetween direction="vertical" size="l">
                        <FormField
                          label="Background Color"
                          description="Enter color code, example: #000000"
                          stretch={true}
                        >
                          <Input
                            onChange={({ detail }) =>
                              setMainColor(detail.value)
                            }
                            value={mainColor}
                          />
                        </FormField>
                        <FormField
                          label="Hover Color"
                          description="Enter color code, example: #000000"
                          stretch={true}
                        >
                          <Input
                            onChange={({ detail }) =>
                              setHoverColor(detail.value)
                            }
                            value={hoverColor}
                          />
                        </FormField>
                        <FormField
                          label="Text Color"
                          description="Enter color code, example: #000000"
                          stretch={true}
                        >
                          <Input
                            onChange={({ detail }) =>
                              setTextColor(detail.value)
                            }
                            value={textColor}
                          />
                        </FormField>
                        <FormField
                          label="Sub Text Color"
                          description="Enter color code, example: #000000"
                          stretch={true}
                        >
                          <Input
                            onChange={({ detail }) =>
                              subTextColor(detail.value)
                            }
                            value={setSubTextColor}
                          />
                        </FormField>
                      </SpaceBetween>
                    </Container>
                  ),
                },
                {
                  title: "Update footer information",
                  info: <Link variant="info">Info</Link>,
                  content: (
                    <SpaceBetween direction="vertical" size="l">
                      <Container
                        header={<Header variant="h2">Left Footer</Header>}
                      >
                        <SpaceBetween direction="vertical" size="l">
                          <FormField label="Information">
                            <Input
                              onChange={({ detail }) =>
                                setCurrentLeftInfo(detail.value)
                              }
                              value={currentLeftInfo}
                            />
                          </FormField>
                          <Button
                            variant="primary"
                            onClick={() => {
                              let newLeftFooter = currentLeftInfo;
                              setLeftFooter(newLeftFooter);
                              setCurrentLeftInfo("");
                            }}
                          >
                            Add infor
                          </Button>
                          <ColumnLayout columns={2} variant="text-grid">
                            {renderInfor(leftFooter)}
                          </ColumnLayout>
                        </SpaceBetween>
                      </Container>
                      <Container
                        header={<Header variant="h2">Right Footer</Header>}
                      >
                        <SpaceBetween direction="vertical" size="l">
                          <FormField label="Information">
                            <Input
                              onChange={({ detail }) =>
                                setCurrentRightInfo(detail.value)
                              }
                              value={currentRightInfo}
                            />
                          </FormField>
                          <Button
                            variant="primary"
                            onClick={() => {
                              let newRightFooter = currentRightInfo;
                              setRightFooter(newRightFooter);
                              setCurrentRightInfo("")
                            }}
                          >
                            Add infor
                          </Button>
                          <ColumnLayout columns={2} variant="text-grid">
                            {renderInfor(rightFooter)}
                          </ColumnLayout>
                        </SpaceBetween>
                      </Container>
                    </SpaceBetween>
                  ),
                },
                {
                  title: "Review and launch",
                  content: (
                    <SpaceBetween size="l">
                      <SpaceBetween size="xs">
                        <Flashbar items={flashItem} />
                        <Header
                          variant="h3"
                          actions={
                            <Button onClick={() => setActiveStepIndex(0)}>
                              Edit
                            </Button>
                          }
                        >
                          Step 1: Web content
                        </Header>
                        <Container
                          header={
                            <Header variant="h2">General configure</Header>
                          }
                        >
                          <SpaceBetween size="xs">
                            <ColumnLayout columns={2} variant="text-grid">
                              <div>
                                <Box variant="awsui-key-label">Web title</Box>
                                <div>{header ? header : "—"}</div>
                              </div>
                              <div>
                                <Box variant="awsui-key-label">Web header</Box>
                                <div>{name ? name : "—"}</div>
                              </div>
                            </ColumnLayout>
                            <div>
                              <Box variant="awsui-key-label">
                                Web description
                              </Box>
                              <div>{desc ? desc : "—"}</div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Highlight 1</Box>
                              <div>
                                {highlight[0].title ? highlight[0].title : "—"}
                              </div>
                              <div>
                                {highlight[0].desc ? highlight[0].desc : "—"}
                              </div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Highlight 2</Box>
                              <div>
                                {highlight[1].title ? highlight[1].title : "—"}
                              </div>
                              <div>
                                {highlight[1].desc ? highlight[1].desc : "—"}
                              </div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Highlight 3</Box>
                              <div>
                                {highlight[2].title ? highlight[2].title : "—"}
                              </div>
                              <div>
                                {highlight[2].desc ? highlight[2].desc : "—"}
                              </div>
                            </div>
                          </SpaceBetween>
                        </Container>
                      </SpaceBetween>
                      <SpaceBetween size="xs">
                        <Header
                          variant="h3"
                          actions={
                            <Button onClick={() => setActiveStepIndex(0)}>
                              Edit
                            </Button>
                          }
                        >
                          Step 2: Web images
                        </Header>
                        <Container
                          header={<Header variant="h2">Image configure</Header>}
                        >
                          <ColumnLayout columns={3} variant="text-grid">
                            <div>
                              <Box variant="awsui-key-label">Logo</Box>
                              <div>{logo[0] ? logo[0].name : "—"}</div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Banner</Box>
                              <div>{banner[0] ? banner[0].name : "—"}</div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Banner icon</Box>
                              <div>
                                {bannerIcon[0] ? bannerIcon[0].name : "—"}
                              </div>
                            </div>
                          </ColumnLayout>
                          <ColumnLayout columns={1} variant="text-grid">
                            <div>
                              <Box variant="awsui-key-label">Highlight</Box>
                              <div>{hlImage1[0] ? hlImage1[0].name : "—"}</div>
                              <div>{hlImage2[0] ? hlImage2[0].name : "—"}</div>
                              <div>{hlImage3[0] ? hlImage3[0].name : "—"}</div>
                            </div>
                          </ColumnLayout>
                        </Container>
                      </SpaceBetween>
                      <SpaceBetween size="xs">
                        <Header
                          variant="h3"
                          actions={
                            <Button onClick={() => setActiveStepIndex(0)}>
                              Edit
                            </Button>
                          }
                        >
                          Step 3: Theme
                        </Header>
                        <Container
                          header={<Header variant="h2">Color configure</Header>}
                        >
                          <ColumnLayout columns={2} variant="text-grid">
                            <div>
                              <Box variant="awsui-key-label">
                                Background color
                              </Box>
                              <div>{mainColor ? mainColor : "—"}</div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Text color</Box>
                              <div>{textColor ? textColor : "—"}</div>
                            </div>
                          </ColumnLayout>
                        </Container>
                      </SpaceBetween>
                      <SpaceBetween size="xs">
                        <Header
                          variant="h3"
                          actions={
                            <Button onClick={() => setActiveStepIndex(0)}>
                              Edit
                            </Button>
                          }
                        >
                          Step 4: Footer
                        </Header>
                        <Container
                          header={
                            <Header variant="h2">Footer configure</Header>
                          }
                        >
                          <ColumnLayout columns={2} variant="text-grid">
                            <div>
                              <Box variant="awsui-key-label">Left Footer</Box>
                              <div>{leftFooter.length > 0 ? leftFooter : "—"}</div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Right Footer</Box>
                              <div>{rightFooter.length > 0 ? rightFooter : "—"}</div>
                            </div>
                          </ColumnLayout>
                        </Container>
                      </SpaceBetween>
                    </SpaceBetween>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
