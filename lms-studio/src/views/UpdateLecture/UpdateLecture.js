import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import "./UpdateLecture.css";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import {
  ColumnLayout,
  BreadcrumbGroup,
  Wizard,
  Container,
  Header,
  SpaceBetween,
  FormField,
  Input,
  Button,
  Box,
  Link,
  Textarea,
  RadioGroup,
  FileUpload,
  Flashbar,
  Icon,
  Popover,
  Form,
} from "@cloudscape-design/components";
import { Storage } from "aws-amplify";
import { API } from "aws-amplify";
import { apiName, secretKeyPath, lecturePath } from "../../utils/api"

const successMes = "Update success";
const errorMess = "Error! An error occurred. Please try again later";
function UpdateLecture(props) {
  const [newLecture, setNewLecture] = useState({
    activeStepIndex: 0,
    lectureTitle: "",
    lectureDescription: "",
    publicity: false,
    lectureType: "Video",
    lectureVideo: [],
    lectureVideoLength: 0,
    lectureVideoS3Key: "",
    workshopUrl: "",
    workshopDescription: "",
    architectureDiagram: [],
    architectureDiagramS3Key: "",
    transcription: null,
    referDocuments: [],
    deleteReferDocs: [],
    addReferDocs: [],
    referDocumentS3Keys: [],
    referUrl: [],
    currentUrl: "",
    randomId: Math.floor(Math.random() * 1000000),
    quiz: [],
    quizS3Key: "",
    redirectToHome: false,
    isLoadingNextStep: false,
    flashItem: [],
  });

  const [transcriptFile, setTranscriptFile] = useState("");
  const [currentWord, setCurrentWord] = useState({
    type: "",
    alternatives: [{ confidence: "", content: "" }],
    start_time: "",
    end_time: "",
    index: null,
  });
  const [mode, setMode] = useState(0);
  const [videoMode, setVideoMode] = useState("s3");

  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setNewLecture({
      ...newLecture,
      lectureTitle: state.Name,
      lectureDescription: state.Desc,
      publicity: state.Publicity === 1 ? true : false,
      lectureType: state.Type,
      workshopUrl: state.WorkshopUrl,
      workshopDescription: state.WorkshopDescription,
      architectureDiagramS3Key: state.ArchitectureDiagramS3Key,
      referDocumentS3Keys: state.ReferDocs,
      referUrl: state.ReferUrl,
      lectureVideoLength: state.Length,
      transcription: state.Transcription,
      youtubeVideo: state.YoutubeVideoURL,
    });
    if (state.YoutubeVideoURL) {
      setVideoMode("youtube");
    }
  }, []);

  useEffect(() => {
    Storage.get(state.Transcription, { level: "public" }).then((data) => {
      console.log(data);
      fetch(data)
        .then((response) => response.json())
        .then((json) => setTranscriptFile(json))
        .catch((err) => console.error(err));
    });
    // console.log(transcriptFile)
  }, []);

  const resetFail = () => {
    setNewLecture({
      ...newLecture,
      isLoadingNextStep: false,
      flashItem: [
        {
          type: "error",
          content: errorMess,
          dismissible: true,
          dismissLabel: "Dismiss message",
          onDismiss: () => setNewLecture({ ...newLecture, flashItem: [] }),
          id: "error_message",
        },
      ],
    });
  };

  const updateLectureWithNewFile = async () => {
    if (newLecture.lectureType === "Video") {
      uploadLectureVideo(newLecture.lectureVideo[0])
        .then((res) => {
          updateLectureInDB(res.key);
        })
        .catch((error) => {
          resetLectureVideo();
          resetFail();
        });
    } else if (newLecture.lectureType === "Workshop") {
      if (newLecture.architectureDiagram[0]) {
        uploadArchitectureDiagram(newLecture.architectureDiagram[0])
          .then((res) => {
            updateLectureInDB(res.key);
          })
          .catch((error) => {
            resetArchitectureDiagram();
            resetFail();
          });
      } else {
        updateLectureInDB("");
      }
    } else {
      uploadQuiz(newLecture.quiz[0])
        .then((res) => {
          updateLectureInDB(res.key);
        })
        .catch((error) => {
          resetQuiz();
          resetFail();
        });
    }
  };

  const submitRequest = async () => {
    // console.log(detail);
    setNewLecture({ ...newLecture, isLoadingNextStep: true });
    if (newLecture.deleteReferDocs.length > 0) {
      for (let i = 0; i < newLecture.deleteReferDocs.length; i++) {
        await Storage.remove(newLecture.deleteReferDocs[i], {
          level: "public",
        });
      }
    }
    if (newLecture.addReferDocs.length > 0) {
      for (let i = 0; i < newLecture.addReferDocs.length; i++) {
        const s3key = `refer-docs/${
          newLecture.randomId
        }-${newLecture.addReferDocs[i].name.replace(/ /g, "_")}`;
        await Storage.put(s3key, newLecture.addReferDocs[i], {
          level: "public",
        });
        setNewLecture({
          ...newLecture,
          referDocumentS3Keys: [...newLecture.referDocumentS3Keys, s3key],
        });
      }
    }

    // Upload updated transcription file
    await Storage.put(newLecture.transcription, transcriptFile, {
      level: "public",
    });

    if (
      newLecture.lectureVideo[0] ||
      newLecture.architectureDiagram[0] ||
      newLecture.quiz[0]
    ) {
      updateLectureWithNewFile();
      removeOldFile(state.Content);
    } else if ( state.Content && videoMode === "youtube") {
      updateLectureInDB("");
      removeOldFile(state.Content);
    }
    else {
      updateLectureInDB(state.Content);
    }
  };

  const updateLectureInDB = async (lectureContent) => {
    // console.log(lectureContent)

    const jsonData = {
      ID: state.ID,
      Name: newLecture.lectureTitle ? newLecture.lectureTitle : state.Name,
      Desc: newLecture.lectureDescription,
      Publicity: newLecture.publicity ? 1 : 0,
      Type: newLecture.lectureType,
      Content: lectureContent,
      Length: Math.round(newLecture.lectureVideoLength),
      WorkshopUrl: newLecture.workshopUrl
        ? newLecture.workshopUrl
        : state.WorkshopUrl,
      WorkshopDescription: newLecture.workshopDescription,
      ReferDocs: newLecture.referDocumentS3Keys,
      ReferUrl: newLecture.referUrl,
      LastUpdated: new Date().toISOString(),
      State: "Enabled",
      Views: state.Views,
      Transcription: newLecture.transcription,
      YoutubeVideoURL: newLecture.youtubeVideo,
    };

    API.post(apiName, lecturePath, { body: jsonData })
      .then(() => {
        setNewLecture({
          ...newLecture,
          redirectToHome: true,
          // isLoadingNextStep: false,
          // flashItem: [
          //   {
          //     type: "success",
          //     content: successMes,
          //     dismissible: true,
          //     dismissLabel: "Dismiss message",
          //     onDismiss: () => setNewLecture({ ...newLecture, flashItem: [] }),
          //     id: "success_message",
          //   },
          // ],
        });
      })
      .catch((error) => {
        resetFail();
      });
  };

  const removeOldFile = async (file) => {
    try {
      const res = await Storage.remove(state.Content, {
        level: "public",
      });
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const uploadLectureVideo = async (file) => {
    if (!(file.type in ["video/mp4", "video/mov"])) {
      console.log("TODO: lecture video content validation");
    }
    try {
      const s3Key = `lecture-videos/${newLecture.randomId}-${file.name.replace(
        / /g,
        "_"
      )}`;
      const res = await Storage.put(s3Key, file, {
        level: "public",
      });
      return res;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const uploadArchitectureDiagram = async (file) => {
    if (!(file.type in ["image/jpeg", "image/png"])) {
      console.log("TODO: architecture diagram validation");
    }
    try {
      const s3Key = `architecture-diagrams/${
        newLecture.randomId
      }-${file.name.replace(/ /g, "_")}`;
      const res = await Storage.put(s3Key, file, {
        level: "public",
      });
      return res;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const uploadQuiz = async (file) => {
    if (!(file.type in ["application/json"])) {
      console.log("TODO: quiz content validation");
    }
    try {
      const s3Key = `quizzes/${newLecture.randomId}-${file.name.replace(
        / /g,
        "_"
      )}`;
      const res = await Storage.put(s3Key, file, {
        level: "public",
      });
      return res;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const resetQuiz = async () => {
    if (newLecture.quizS3Key !== "") {
      await Storage.remove(newLecture.quizS3Key, {
        level: "protected",
      });
    }
  };

  const resetArchitectureDiagram = async () => {
    if (newLecture.architectureDiagramS3Key !== "") {
      await Storage.remove(newLecture.architectureDiagramS3Key, {
        level: "protected",
      });
    }
  };

  const resetLectureVideo = async () => {
    if (newLecture.lectureVideoS3Key !== "") {
      await Storage.remove(newLecture.lectureVideoS3Key, {
        level: "protected",
      });
    }
  };

  const getDuration = (durationString) => {
    let durationNum = 0;
    if ( !durationString ){
      return;
    }
    const durationParts = durationString
      .replace("PT", "")
      .replace("H", ":")
      .replace("M", ":")
      .replace("S", "")
      .split(":");

    if (durationParts.length === 3) {
      durationNum = Number(durationParts[0])*3600 + Number(durationParts[1])*60 + Number(durationParts[2])
    }

    if (durationParts.length === 2) {
      durationNum = Number(durationParts[0])*60 + Number(durationParts[1]);
    }

    if (durationParts.length === 1) {
      durationNum = Number(durationParts[0])
    }
    console.log(durationNum)
    return durationNum;
  };

  const getYouVideoDuration = async (videoUrl) => {
    if ( videoUrl ){
      const res = await API.get(apiName, secretKeyPath);
      const secret = JSON.parse(res.SecretString);
      const videoID = videoUrl.split("=")[1];
      const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=${secret["youtube-api-key"]}&id=${videoID}`;
  
      console.log(url);
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log(data?.items[0]?.contentDetails?.duration)
          const duration = () => getDuration(data?.items[0]?.contentDetails?.duration);
          setNewLecture(prevLecture => ({...prevLecture, lectureVideoLength: duration}))
        });
    }
  };

  const setLectureLength = (file) =>
    new Promise((resolve, reject) => {
      if (file.length > 0) {
        try {
          let video = document.createElement("video");
          video.preload = "metadata";

          video.onloadedmetadata = function () {
            resolve(this);
          };

          video.onerror = function () {
            reject("Invalid video. Please select a video file.");
          };

          video.src = window.URL.createObjectURL(file[0]);
        } catch (e) {
          reject(e);
        }
      } else {
        setNewLecture({ ...newLecture, lectureVideo: [], lectureVideoLength: 0 });
      }
    });

  const renderReferUrl = () => {
    return (
      <>
        {newLecture.referUrl.map((item, index) => (
          <div className="requirement-item">
            <li className="requirement-item-haft" key={index}>
              {item}
            </li>
            <div
              className="requirement-item-haft"
              style={{ textAlign: "right" }}
              onClick={(e) => deleteUrl(index)}
            >
              <Icon name="close" size="inherit" />
            </div>
          </div>
        ))}
      </>
    );
  };

  const deleteDocs = (index) => {
    let list = [...newLecture.referDocumentS3Keys];
    setNewLecture({
      ...newLecture,
      deleteReferDocs: list[index],
      referDocumentS3Keys: list.splice(index, 1),
    });
  };

  const deleteUrl = (index) => {
    let list = [...newLecture.referUrl];
    list.splice(index, 1);
    setNewLecture({ ...newLecture, referUrl: list });
  };

  const renderReferDocs = () => {
    return (
      <>
        {newLecture.referDocumentS3Keys.map((item, index) => (
          <div className="requirement-item">
            <li className="requirement-item-haft" key={index}>
              {item}
            </li>
            <div
              className="requirement-item-haft"
              style={{ textAlign: "right" }}
              onClick={(e) => deleteDocs(index)}
            >
              <Icon name="close" size="inherit" />
            </div>
          </div>
        ))}
      </>
    );
  };

  // render 'Add Content' in step 2
  const renderAddContent = () => {
    const reference = (
      <>
        <FormField label="Lecture Reference" description="Related documents">
          <FileUpload
            onChange={async ({ detail }) => {
              setNewLecture({ ...newLecture, addReferDocs: detail.value });
            }}
            value={newLecture.addReferDocs}
            i18nStrings={{
              uploadButtonText: (e) => (e ? "Choose files" : "Choose file"),
              dropzoneText: (e) =>
                e ? "Drop files to upload" : "Drop file to upload",
              removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
              limitShowFewer: "Show fewer files",
              limitShowMore: "Show more files",
              errorIconAriaLabel: "Error",
            }}
            showFileLastModified
            showFileSize
            showFileThumbnail
            tokenLimit={3}
            constraintText=".pdf, .doc, .docx"
            accept=".pdf, .doc, .docx"
          />
        </FormField>
        {renderReferDocs}
        <FormField label="Document URL">
          <Input
            value={newLecture.currentUrl}
            onChange={(event) =>
              setNewLecture({
                ...newLecture,
                currentUrl: event.detail.value,
              })
            }
          />
        </FormField>
        <Button
          variant="primary"
          onClick={() => {
            let newUrl = newLecture.currentUrl;
            if (newUrl) {
              setNewLecture({
                ...newLecture,
                referUrl: [...newLecture.referUrl, newUrl],
                currentUrl: "",
              });
            }
          }}
        >
          Add URL
        </Button>
        <ColumnLayout columns={1} variant="text-grid">
          {renderReferUrl()}
        </ColumnLayout>
      </>
    );

    if (newLecture.lectureType === "Video") {
      return (
        <SpaceBetween direction="vertical" size="s">
          <RadioGroup
            onChange={({ detail }) =>
              setVideoMode(detail.value)
            }
            value={videoMode}
            items={[
              {
                value: "s3",
                label: "Upload video",
                description: "Upload your own video",
              },
              { value: "youtube", label: "Youtube video" },
            ]}
          />
          {videoMode === "s3" ? (
            <FormField
            label="Lecture Videos"
            description="Theory video for lecture"
          >
            <FileUpload
              onChange={async ({ detail }) => {
                // setNewLecture({ ...newLecture, lectureVideo: detail.value });
                const video = await setLectureLength(detail.value);
                setNewLecture({
                  ...newLecture,
                  lectureVideo: detail.value,
                  lectureVideoLength: video.duration,
                });
              }}
              value={newLecture.lectureVideo}
              i18nStrings={{
                uploadButtonText: (e) => (e ? "Choose files" : "Choose file"),
                dropzoneText: (e) =>
                  e ? "Drop files to upload" : "Drop file to upload",
                removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
                limitShowFewer: "Show fewer files",
                limitShowMore: "Show more files",
                errorIconAriaLabel: "Error",
              }}
              showFileLastModified
              showFileSize
              showFileThumbnail
              tokenLimit={3}
              constraintText=".mov, .mp4"
              accept=".mov,.mp4"
            />
          </FormField>
          ) : (
            <FormField
              label="Youtube Video URL"
              description="For example: https://www.youtube.com/watch?v=zbiNEyZRhDU"
            >
              <Input
                value={newLecture.youtubeVideo}
                onChange={async (event) => {
                    setNewLecture({ ...newLecture, youtubeVideo: event.detail.value });
                    getYouVideoDuration(event.detail.value);
                }}
              />
            </FormField>
          )}
          {reference}
        </SpaceBetween>
      );
    } else if (newLecture.lectureType === "Workshop") {
      return (
        <div>
          <FormField description="Workshop" label="Hands-on lab for Lecture">
            <Input
              value={newLecture.workshopUrl}
              onChange={(event) =>
                setNewLecture({
                  ...newLecture,
                  workshopUrl: event.detail.value,
                })
              }
            />
          </FormField>

          <FormField label={<span>Workshop Description</span>}>
            <Textarea
              value={newLecture.workshopDescription}
              onChange={(event) =>
                setNewLecture({
                  ...newLecture,
                  workshopDescription: event.detail.value,
                })
              }
            />
          </FormField>
          <FormField
            label="Workshop Architecture"
            description="Architecture diagram"
          >
            <FileUpload
              onChange={async ({ detail }) => {
                setNewLecture({
                  ...newLecture,
                  architectureDiagram: detail.value,
                });
              }}
              value={newLecture.architectureDiagram}
              i18nStrings={{
                uploadButtonText: (e) => (e ? "Choose files" : "Choose file"),
                dropzoneText: (e) =>
                  e ? "Drop files to upload" : "Drop file to upload",
                removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
                limitShowFewer: "Show fewer files",
                limitShowMore: "Show more files",
                errorIconAriaLabel: "Error",
              }}
              showFileLastModified
              showFileSize
              showFileThumbnail
              tokenLimit={3}
              constraintText=".jpeg, .png"
              accept=".jpg,.jpeg,.png"
            />
            {reference}
          </FormField>
        </div>
      );
    } else {
      return (
        <SpaceBetween direction="vertical" size="s">
          <FormField label="Quiz" description="Add questions">
            <FileUpload
              onChange={async ({ detail }) => {
                setNewLecture({ ...newLecture, quiz: detail.value });
              }}
              value={newLecture.quiz}
              i18nStrings={{
                uploadButtonText: (e) => (e ? "Choose files" : "Choose file"),
                dropzoneText: (e) =>
                  e ? "Drop files to upload" : "Drop file to upload",
                removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
                limitShowFewer: "Show fewer files",
                limitShowMore: "Show more files",
                errorIconAriaLabel: "Error",
              }}
              showFileLastModified
              showFileSize
              showFileThumbnail
              tokenLimit={3}
              constraintText=".csv"
              accept=".csv"
            />
          </FormField>
          {reference}
        </SpaceBetween>
      );
    }
  };

  const submitChangeWord = (index) => {
    const oldTranscript = { ...transcriptFile };
    if (currentWord.alternatives[0].content === "") {
      // oldTranscript.results.items.splice(index, 1);
      return;
    } else {
      if (currentWord.index) delete currentWord.index;
      oldTranscript.results.items[index] = currentWord;
    }
    setTranscriptFile(oldTranscript);
  };

  const addNewWords = () => {
    if (currentWord.alternatives[0].content !== "") {
      const oldTranscript = { ...transcriptFile };
      const index = currentWord.index;

      delete currentWord.index;

      oldTranscript.results.items.splice(index, 0, currentWord);
      setTranscriptFile(oldTranscript);

    }
  };

  const renderEditTrancription = () => {
    return (
      <div>
        <SpaceBetween direction="vertical" size="s">
          <Container
            header={<Header variant="h2">Trancription Overview</Header>}
          >
            <div>
              <FormField
                label="Transcript"
                description="You can pick a word, then delete or change its attribute or add a new word after it"
              >
                <div>
                  {transcriptFile.results
                    ? transcriptFile.results.items.map((item, index) => {
                        return (
                          <span>
                            {item.alternatives[0].content === "," ||
                            item.alternatives[0].content === "." ? (
                              <></>
                            ) : (
                              <span> </span>
                            )}
                            <Popover
                              header={mode === 0 ? "Edit word" : "Add word"}
                              position="bottom"
                              id="transcript"
                              size="large"
                              triggerType="custom"
                              content={
                                <form onSubmit={(e) => e.preventDefault()}>
                                  <Form
                                    actions={
                                      <SpaceBetween
                                        direction="horizontal"
                                        size="xxs"
                                      >
                                        {mode === 0 ? (
                                          <>
                                            <Button
                                              formAction="none"
                                              variant="link"
                                              onClick={(event) =>
                                                {
                                                let newTrans = { ...transcriptFile };
                                                newTrans.results.items.splice(index,1);
                                                setTranscriptFile(newTrans)
                                                setCurrentWord({
                                                  type: "",
                                                  alternatives: [
                                                    {
                                                      confidence: "",
                                                      content: "",
                                                    },
                                                  ],
                                                  start_time: "",
                                                  end_time: "",
                                                  index: null,
                                                });
                                              }
                                              }
                                            >
                                              Delete
                                            </Button>
                                            <Button
                                              variant="primary"
                                              onClick={(event) =>
                                                submitChangeWord(index)
                                              }
                                            >
                                              Save
                                            </Button>
                                            <Button
                                              variant="primary"
                                              onClick={(e) => {
                                                setMode(1);
                                                setCurrentWord({
                                                  type: "",
                                                  alternatives: [
                                                    {
                                                      confidence: "",
                                                      content: "",
                                                    },
                                                  ],
                                                  start_time: "",
                                                  end_time: "",
                                                  index: index + 1,
                                                });
                                              }}
                                            >
                                              Add new word
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            variant="primary"
                                            onClick={(e) => addNewWords()}
                                          >
                                            Add
                                          </Button>
                                        )}
                                      </SpaceBetween>
                                    }
                                  >
                                    <Container>
                                      <SpaceBetween
                                        direction="vertical"
                                        size="xxs"
                                      >
                                        <FormField label="Content">
                                          <Input
                                            value={
                                              currentWord.alternatives[0]
                                                .content
                                            }
                                            onChange={(event) => {
                                              // console.log(event.detail);
                                              const oldWord = {
                                                ...currentWord,
                                              };
                                              oldWord.alternatives[0].content =
                                                event.detail.value;
                                              setCurrentWord(oldWord);
                                            }}
                                          />
                                        </FormField>
                                        <FormField label="Start time">
                                          <Input
                                            value={currentWord.start_time}
                                            onChange={(event) =>
                                              setCurrentWord({
                                                ...currentWord,
                                                start_time: event.detail.value,
                                              })
                                            }
                                          />
                                        </FormField>
                                        <FormField label="End time">
                                          <Input
                                            value={currentWord.end_time}
                                            onChange={(event) =>
                                              setCurrentWord({
                                                ...currentWord,
                                                end_time: event.detail.value,
                                              })
                                            }
                                          />
                                        </FormField>
                                      </SpaceBetween>
                                    </Container>
                                  </Form>
                                </form>
                              }
                            >
                              <span
                                onClick={(event) => {
                                  setCurrentWord(
                                    JSON.parse(JSON.stringify(item))
                                  );
                                  setMode(0);
                                }}
                              >
                                {item.alternatives[0].content === "," ||
                                item.alternatives[0].content === "."
                                  ? item.alternatives[0].content
                                  : " " + item.alternatives[0].content}
                              </span>
                            </Popover>
                          </span>
                        );
                      })
                    : ""}
                </div>
              </FormField>
            </div>
          </Container>
        </SpaceBetween>
      </div>
    );
  };

  // render review section in step 3
  const renderReviewSection = () => {
    if (newLecture.lectureType === "Video") {
      return (
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">{videoMode === "s3" ? "File name" : "Video URL"}</Box>
            <div>
              {videoMode === "s3"
                ? (newLecture.lectureVideo.length > 0 && newLecture.lectureVideo[0].name) || state.Content : newLecture.youtubeVideo}
            </div>
          </div>
        </ColumnLayout>
      );
    } else if (newLecture.lectureType === "Workshop") {
      return (
        <ColumnLayout columns={3} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Workshop URL</Box>
            <div>{newLecture.workshopUrl}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Workshop Description</Box>
            <div>{newLecture.workshopDescription}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Architecture Diagram</Box>
            <div>
              {newLecture.architectureDiagram.length > 0
                ? newLecture.architectureDiagram[0].name
                : state.Content}
            </div>
          </div>
        </ColumnLayout>
      );
    } else {
      return (
        <ColumnLayout columns={3} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">File name</Box>
            <div>
              {newLecture.quiz.length > 0
                ? newLecture.quiz[0].name
                : state.Content}
            </div>
          </div>
        </ColumnLayout>
      );
    }
  };

  return newLecture.redirectToHome ? (
    <Navigate to={"/"} />
  ) : (
    <div>
      <NavBar navigation={props.navigation} title="Cloud Academy" />
      <div className="create-lecture-main">
        <BreadcrumbGroup
          items={[
            { text: "Home", href: "#" },
            { text: "Lecture", href: "#lectures" },
          ]}
          ariaLabel="Breadcrumbs"
        />
        <Wizard
          i18nStrings={{
            stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
            collapsedStepsLabel: (stepNumber, stepsCount) =>
              `Step ${stepNumber} of ${stepsCount}`,
            skipToButtonLabel: (step, stepNumber) => `Skip to ${step.title}`,
            navigationAriaLabel: "Steps",
            cancelButton: "Cancel",
            previousButton: "Previous",
            nextButton: "Next",
            submitButton: "Submit",
            optional: "optional",
          }}
          isLoadingNextStep={newLecture.isLoadingNextStep}
          onSubmit={submitRequest}
          onCancel={() =>
            // setNewLecture({ ...newLecture, redirectToHome: true })
            navigate(-1)
          }
          onNavigate={({ detail }) =>
            setNewLecture({
              ...newLecture,
              activeStepIndex: detail.requestedStepIndex,
            })
          }
          activeStepIndex={newLecture.activeStepIndex}
          steps={[
            {
              title: "Add Lecture Detail",
              info: <Link variant="info">Info</Link>,
              description:
                "Each instance type includes one or more instance sizes, allowing you to scale your resources to the requirements of your target workload.",
              content: (
                <Container
                  header={<Header variant="h2">Lecture Detail</Header>}
                >
                  <SpaceBetween direction="vertical" size="l">
                    <FormField label="Lecture Title">
                      <Input
                        value={newLecture.lectureTitle}
                        onChange={(event) =>
                          setNewLecture({
                            ...newLecture,
                            lectureTitle: event.detail.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField label="Lecture Description">
                      <Input
                        value={newLecture.lectureDescription}
                        onChange={(event) =>
                          setNewLecture({
                            ...newLecture,
                            lectureDescription: event.detail.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField label="Lecture Type">
                      <RadioGroup
                        value={newLecture.lectureType}
                        onChange={(event) =>
                          setNewLecture({
                            ...newLecture,
                            lectureType: event.detail.value,
                          })
                        }
                        items={[
                          {
                            value: "Video",
                            label: "Video",
                          },
                          {
                            value: "Workshop",
                            label: "Workshop",
                          },
                          { value: "Quiz", label: "Quiz" },
                        ]}
                      />
                    </FormField>
                  </SpaceBetween>
                </Container>
              ),
            },
            {
              title: "Edit Content",
              content: (
                <Container
                  header={<Header variant="h2">Lecture Content</Header>}
                >
                  <SpaceBetween direction="vertical" size="l">
                    {renderAddContent()}
                  </SpaceBetween>
                </Container>
              ),
              isOptional: false,
            },
            {
              title: "Edit Transcription",
              content: <div>{renderEditTrancription()}</div>,
              isOptional: false,
            },
            {
              title: "Review and launch",
              content: (
                <div>
                  <SpaceBetween direction="vertical" size="l">
                    <SpaceBetween direction="vertical" size="s">
                      <Flashbar items={newLecture.flashItem} />
                      <Header
                        variant="h3"
                        actions={
                          <Button
                            onClick={() =>
                              setNewLecture({
                                ...newLecture,
                                activeStepIndex: 0,
                              })
                            }
                          >
                            Edit
                          </Button>
                        }
                      >
                        Step 1: Add Lecture Detail
                      </Header>
                      <Container
                        header={<Header variant="h2">Lecture Detail</Header>}
                      >
                        <ColumnLayout columns={3} variant="text-grid">
                          <div>
                            <Box variant="awsui-key-label">Lecture title</Box>
                            <div>{newLecture.lectureTitle}</div>
                          </div>
                          <div>
                            <Box variant="awsui-key-label">Description</Box>
                            <div>{newLecture.lectureDescription}</div>
                          </div>
                          <div>
                            <Box variant="awsui-key-label">Lecture Type</Box>
                            <div>{newLecture.lectureType}</div>
                          </div>
                        </ColumnLayout>
                      </Container>
                    </SpaceBetween>
                    <SpaceBetween size="xs">
                      <Header variant="h3">Step 2: Add Content</Header>
                      <Container
                        header={<Header variant="h2">Lecture Content</Header>}
                      >
                        {renderReviewSection()}
                      </Container>
                    </SpaceBetween>
                  </SpaceBetween>
                </div>
              ),
            },
          ]}
        />
      </div>
      <Footer />
    </div>
  );
}

export default UpdateLecture;
