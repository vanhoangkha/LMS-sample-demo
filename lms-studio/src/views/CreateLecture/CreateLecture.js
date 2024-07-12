import React from "react";
import { Navigate } from "react-router-dom";
import "./CreateLecture.css";
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
  Toggle,
  Icon,
  Popover,
  Form,
} from "@cloudscape-design/components";
import loadingGif from "../../assets/images/loading.gif";
import { Storage } from "aws-amplify";
import { API } from "aws-amplify";
import { v4 as uuid } from "uuid";
import { apiName, secretKeyPath, lecturePath } from "../../utils/api"

const successMes = "Created success";
const errorMess = "Error! An error occurred. Please try again later";
class CreateLecture extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
  }

  submitRequest = async () => {
    // console.log(detail);
    if (this.state.continue) {
      this.setState(this.getDefaultState());
      return;
    }

    this.setState({ isLoadingNextStep: true });

    if (this.state.referDocuments.length > 0) {
      let i;
      for (i = 0; i < this.state.referDocuments.length; i++) {
        const s3key = `refer-docs/${
          this.state.randomId
        }-${this.state.referDocuments[i].name.replace(/ /g, "_")}`;
        try {
          await Storage.put(s3key, this.state.referDocuments[i], {
            level: "public",
          });
          this.setState({
            referDocumentS3Keys: [...this.state.referDocumentS3Keys, s3key],
          });
        } catch (error) {
          console.log(error);
        }
      }
    }

    if (this.state.lectureType === "Video") {
      if (this.state.checked || this.state.videoMode === "youtube") {
        this.writeLectureToDB(this.state.lectureVideoS3Key);
      } else {
        this.uploadLectureVideo(this.state.lectureVideo[0])
          .then((res) => {
            this.writeLectureToDB(res.key);
          })
          .catch((error) => {
            this.resetLectureVideo();
            this.setState({
              isLoadingNextStep: false,
              flashItem: [
                {
                  type: "error",
                  content: errorMess,
                  dismissible: true,
                  dismissLabel: "Dismiss message",
                  onDismiss: () => this.setState({ flashItem: [] }),
                  id: "error_message",
                },
              ],
            });
          });
      }
    } else if (this.state.lectureType === "Workshop") {
      if (this.state.architectureDiagram[0]) {
        this.uploadArchitectureDiagram(this.state.architectureDiagram[0])
          .then((res) => {
            this.writeLectureToDB(res.key);
          })
          .catch((error) => {
            this.resetArchitectureDiagram();
            this.setState({
              isLoadingNextStep: false,
              flashItem: [
                {
                  type: "error",
                  content: errorMess,
                  dismissible: true,
                  dismissLabel: "Dismiss message",
                  onDismiss: () => this.setState({ flashItem: [] }),
                  id: "error_message",
                },
              ],
            });
          });
      } else {
        this.writeLectureToDB("");
      }
    } else {
      this.uploadQuiz(this.state.quiz[0])
        .then((res) => {
          this.writeLectureToDB(res.key);
        })
        .catch((error) => {
          this.resetQuiz();
          this.setState({
            isLoadingNextStep: false,
            flashItem: [
              {
                type: "error",
                content: errorMess,
                dismissible: true,
                dismissLabel: "Dismiss message",
                onDismiss: () => this.setState({ flashItem: [] }),
                id: "error_message",
              },
            ],
          });
        });
    }
  };

  writeLectureToDB = async (lectureContent) => {
    // console.log(lectureContent)
    let transcription = "";
    if (this.state.lectureVideo[0]) {
      transcription = lectureContent.split("/")[1];
      transcription = transcription.split(".")[0];
      transcription = transcription.replace(/[^a-zA-Z ]/g, "");
      transcription = "transcription/" + transcription + ".json";
    }

    const jsonData = {
      ID: uuid(),
      Name: this.state.lectureTitle,
      Desc: this.state.lectureDescription,
      Publicity: this.state.publicity ? 1 : 0,
      Type: this.state.lectureType,
      Content: lectureContent,
      Length: Math.round(this.state.lectureVideoLength),
      WorkshopUrl: this.state.workshopUrl,
      WorkshopDescription: this.state.workshopDescription,
      YoutubeVideoURL: this.state.youtubeVideo,
      // ArchitectureDiagramS3Key: this.state.architectureDiagramS3Key,
      // QuizS3Key: this.state.quizS3Key,
      LastUpdated: new Date().toISOString(),
      ReferDocs: this.state.referDocumentS3Keys,
      ReferUrl: this.state.referUrl,
      State: "Enabled",
      Views: 0,
      Transcription: transcription,
    };
    try {
      await API.put(apiName, lecturePath, { body: jsonData });
      this.setState({
        // redirectToHome: true,
        isLoadingNextStep: false,
        flashItem: [
          {
            type: "success",
            content: successMes,
            dismissible: true,
            dismissLabel: "Dismiss message",
            onDismiss: () => this.setState({ flashItem: [] }),
            id: "success_message",
          },
        ],
        continue: true,
      });
    } catch (error) {
      this.setState({
        isLoadingNextStep: false,
        flashItem: [
          {
            type: "error",
            content: errorMess,
            dismissible: true,
            dismissLabel: "Dismiss message",
            onDismiss: () => this.setState({ flashItem: [] }),
            id: "error_message",
          },
        ],
      });
    }
  };
  getDefaultState = () => {
    return {
      activeStepIndex: 0,
      lectureTitle: "",
      lectureDescription: "",
      publicity: false,
      lectureType: "Video",
      lectureVideo: [],
      youtubeVideo: "",
      lectureVideoLength: 0,
      lectureVideoS3Key: "",
      workshopUrl: "",
      workshopDescription: "",
      architectureDiagram: [],
      architectureDiagramS3Key: "",
      referDocuments: [],
      referDocumentS3Keys: [],
      referUrl: [],
      currentUrl: "",
      transcription: null,
      randomId: Math.floor(Math.random() * 1000000),
      quiz: [],
      quizS3Key: "",
      redirectToHome: false,
      isLoadingNextStep: false,
      flashItem: [],
      continue: false,
      loading: false,
      checked: "",
      mode: 0,
      videoMode: "s3",
      currentWord: {
        type: "",
        alternatives: [{ confidence: "", content: "" }],
        start_time: "",
        end_time: "",
        index: null,
      },
    };
  };

  uploadLectureVideo = async (file) => {
    if (!(file.type in ["video/mp4", "video/mov"])) {
      console.log("TODO: lecture video content validation");
    }
    try {
      const s3Key = `lecture-videos/${this.state.randomId}-${file.name.replace(
        / /g,
        "_"
      )}`;
      const res = await Storage.put(s3Key, file, {
        level: "public",
      });
      this.setState({ lectureVideoS3Key: res.key });
      return res;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  uploadArchitectureDiagram = async (file) => {
    if (!(file.type in ["image/jpeg", "image/png"])) {
      console.log("TODO: architecture diagram validation");
    }
    try {
      const s3Key = `architecture-diagrams/${
        this.state.randomId
      }-${file.name.replace(/ /g, "_")}`;
      const res = await Storage.put(s3Key, file, {
        level: "public",
      });
      return res;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  uploadQuiz = async (file) => {
    if (!(file.type in ["application/json"])) {
      console.log("TODO: quiz content validation");
    }
    try {
      const s3Key = `quizzes/${this.state.randomId}-${file.name.replace(
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

  resetQuiz = async () => {
    if (this.state.quizS3Key !== "") {
      await Storage.remove(this.state.quizS3Key, {
        level: "protected",
      });
    }
  };

  resetArchitectureDiagram = async () => {
    if (this.state.architectureDiagramS3Key !== "") {
      await Storage.remove(this.state.architectureDiagramS3Key, {
        level: "protected",
      });
    }
  };

  resetLectureVideo = async () => {
    if (this.state.lectureVideoS3Key !== "") {
      await Storage.remove(this.state.lectureVideoS3Key, {
        level: "protected",
      });
    }
  };

  getDuration = (durationString) => {
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

  getYouVideoDuration = async (videoUrl) => {
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
          const duration = this.getDuration(data?.items[0]?.contentDetails?.duration);
          this.setState({ lectureVideoLength: duration });
        });
    }
  };

  setLectureLength = (file) =>
    new Promise((resolve, reject) => {
      if (file) {
        try {
          let video = document.createElement("video");
          video.preload = "metadata";

          video.onloadedmetadata = function () {
            resolve(this);
          };

          video.onerror = function () {
            reject("Invalid video. Please select a video file.");
          };

          video.src = window.URL.createObjectURL(file);
        } catch (e) {
          reject(e);
        }
      } else {
        this.setState({ lectureVideoLength: 0 });
      }
    });

  deleteUrl = (index) => {
    let list = [...this.state.referUrl];
    list.splice(index, 1);
    this.setState({ referUrl: list });
  };

  editTranscription = async (value) => {
    if (this.state.lectureVideo.length > 0) {
      this.setState({ loading: true, checked: value });

      this.uploadLectureVideo(this.state.lectureVideo[0]).then((res) => {
        // console.log(res)
        setTimeout(() => this.loadTranscription(res.key), 25000);
      });
    }
  };

  loadTranscription = (videoName) => {
    let transcription = videoName.split("/")[1];
    transcription = transcription.split(".")[0];
    transcription = "transcription/" + transcription + ".json";
    console.log(transcription);

    Storage.get(transcription, { level: "public" }).then((data) => {
      console.log(data);
      fetch(data)
        .then((response) => response.json())
        .then((json) => {
          this.setState({ transcription: json, loading: false });
          console.log(json);
        })
        .catch((err) => {
          console.error(err);
          this.setState({ loading: false });
        });
    });
  };

  renderReferUrl = () => {
    return (
      <>
        {this.state.referUrl.map((item, index) => (
          <div className="requirement-item">
            <li className="requirement-item-haft" key={index}>
              {item}
            </li>
            <div
              className="requirement-item-haft"
              style={{ textAlign: "right" }}
              onClick={(e) => this.deleteUrl(index)}
            >
              <Icon name="close" size="inherit" />
            </div>
          </div>
        ))}
      </>
    );
  };

  submitChangeWord = (index) => {
    const oldTranscript = { ...this.state.transcription };
    if (this.state.currentWord.alternatives[0].content === "") {
      // oldTranscript.results.items.splice(index, 1);
      return;
    } else {
      if (this.state.currentWord.index) delete this.state.currentWord.index;
      oldTranscript.results.items[index] = this.state.currentWord;
    }
    this.setState({ transcription: oldTranscript });
  };

  addNewWords = () => {
    if (this.state.currentWord.alternatives[0].content !== "") {
      const oldTranscript = { ...this.state.transcription };
      const index = this.state.currentWord.index;
      console.log(index);
      delete this.state.currentWord.index;

      oldTranscript.results.items.splice(index, 0, this.state.currentWord);
      this.setState({ transcription: oldTranscript });
      // setVisiable(false);
    }
  };

  renderEditTransciption = () => {
    return (
      <div>
        {this.state.loading ? (
          <div fluid="true" className="learn-parent-loading">
            <img
              src={loadingGif}
              alt="loading..."
              className="learn-loading-gif"
            />
          </div>
        ) : (
          <div>
            {this.state.transcription ? (
              <FormField
                label="Transcript"
                description="You can pick a word, then delete or change its attribute or add a new word after it."
              >
                <div>
                  {this.state.transcription.results
                    ? this.state.transcription.results.items.map(
                        (item, index) => {
                          return (
                            <span>
                              {item.alternatives[0].content === "," ||
                              item.alternatives[0].content === "." ? (
                                <></>
                              ) : (
                                <span> </span>
                              )}
                              <Popover
                                header={
                                  this.state.mode === 0
                                    ? "Edit word"
                                    : "Add word"
                                }
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
                                          {this.state.mode === 0 ? (
                                            <>
                                              <Button
                                                formAction="none"
                                                variant="link"
                                                onClick={(event) => {
                                                  const newTrans = {
                                                    ...this.state.transcription,
                                                  };
                                                  newTrans.results.items.splice(
                                                    index,
                                                    1
                                                  );
                                                  this.setState({
                                                    transcription: newTrans,
                                                    currentWord: {
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
                                                    },
                                                  });
                                                }}
                                              >
                                                Delete
                                              </Button>
                                              <Button
                                                variant="primary"
                                                onClick={(event) =>
                                                  this.submitChangeWord(index)
                                                }
                                              >
                                                Save
                                              </Button>
                                              <Button
                                                variant="primary"
                                                onClick={(e) =>
                                                  // setVisiable(true);
                                                  this.setState({
                                                    mode: 1,
                                                    currentWord: {
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
                                                    },
                                                  })
                                                }
                                              >
                                                Add new word
                                              </Button>
                                            </>
                                          ) : (
                                            <Button
                                              variant="primary"
                                              onClick={(e) =>
                                                this.addNewWords()
                                              }
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
                                                this.state.currentWord
                                                  .alternatives[0].content
                                              }
                                              onChange={(event) => {
                                                // console.log(event.detail);
                                                const oldWord = {
                                                  ...this.state.currentWord,
                                                };
                                                oldWord.alternatives[0].content =
                                                  event.detail.value;
                                                this.setState({
                                                  currentWord: oldWord,
                                                });
                                              }}
                                            />
                                          </FormField>
                                          <FormField label="Start time">
                                            <Input
                                              value={
                                                this.state.currentWord
                                                  .start_time
                                              }
                                              onChange={(event) =>
                                                this.setState({
                                                  currentWord: {
                                                    ...this.state.currentWord,
                                                    start_time:
                                                      event.detail.value,
                                                  },
                                                })
                                              }
                                            />
                                          </FormField>
                                          <FormField label="End time">
                                            <Input
                                              value={
                                                this.state.currentWord.end_time
                                              }
                                              onChange={(event) =>
                                                this.setState({
                                                  currentWord: {
                                                    ...this.state.currentWord,
                                                    end_time:
                                                      event.detail.value,
                                                  },
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
                                    this.setState({
                                      mode: 0,
                                      currentWord: JSON.parse(
                                        JSON.stringify(item)
                                      ),
                                    });
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
                        }
                      )
                    : ""}
                </div>
              </FormField>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    );
  };
  // render 'Add Content' in step 2
  renderAddContent = () => {
    const reference = (
      <>
        <FormField label="Lecture Reference" description="Related documents">
          <FileUpload
            onChange={async ({ detail }) => {
              this.setState({ referDocuments: detail.value });
            }}
            value={this.state.referDocuments}
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
        <FormField label="Document URL">
          <Input
            value={this.state.currentUrl}
            onChange={(event) =>
              this.setState({
                currentUrl: event.detail.value,
              })
            }
          />
        </FormField>
        <Button
          variant="primary"
          onClick={() => {
            let newUrl = this.state.currentUrl;
            if (newUrl) {
              this.setState({
                referUrl: [...this.state.referUrl, newUrl],
                currentUrl: "",
              });
            }
          }}
        >
          Add URL
        </Button>
        <ColumnLayout columns={1} variant="text-grid">
          {this.renderReferUrl}
        </ColumnLayout>
      </>
    );

    if (this.state.lectureType === "Video") {
      return (
        <SpaceBetween direction="vertical" size="m">
          <RadioGroup
            onChange={({ detail }) =>
              this.setState({ videoMode: detail.value })
            }
            value={this.state.videoMode}
            items={[
              {
                value: "s3",
                label: "Upload video",
                description: "Upload your own video",
              },
              { value: "youtube", label: "Youtube video" },
            ]}
          />
          {this.state.videoMode === "s3" ? (
            <FormField
              label="Lecture Videos"
              description="Theory video for lecture"
            >
              <FileUpload
                onChange={async ({ detail }) => {
                  this.setState({ lectureVideo: detail.value });
                  const video = await this.setLectureLength(detail.value[0]);
                  this.setState({ lectureVideoLength: video.duration });
                  if (this.state.checked) {
                    this.setState({ checked: false });
                    this.resetLectureVideo();
                  }
                  //  console.log(detail.value[0])
                  //   if (detail.value.length === 0) {
                  //     this.resetLectureVideo();
                  //   } else {
                  //     this.uploadLectureVideo(detail.value[0]);
                  //   }
                }}
                value={this.state.lectureVideo}
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
                value={this.state.youtubeVideo}
                onChange={async (event) => {
                    this.setState({ youtubeVideo: event.detail.value });
                    this.getYouVideoDuration(event.detail.value);
                }}
              />
            </FormField>
          )}
          {reference}
          <RadioGroup
            onChange={({ detail }) => this.editTranscription(detail.value)}
            value={this.state.checked}
            items={[
              {
                value: "checkEdit",
                label: <strong>Edit transcription</strong>,
              },
            ]}
          />
          {this.renderEditTransciption()}
        </SpaceBetween>
      );
    } else if (this.state.lectureType === "Workshop") {
      return (
        <SpaceBetween direction="vertical" size="s">
          <FormField label="Workshop" description="Hands-on lab for Lecture">
            <Input
              value={this.state.workshopUrl}
              onChange={(event) =>
                this.setState({ workshopUrl: event.detail.value })
              }
            />
          </FormField>

          <FormField label={<span>Workshop Description</span>}>
            <Textarea
              value={this.state.workshopDescription}
              onChange={(event) =>
                this.setState({ workshopDescription: event.detail.value })
              }
            />
          </FormField>
          <FormField
            label="Workshop Architecture"
            description="Architecture diagram"
          >
            <FileUpload
              onChange={async ({ detail }) => {
                this.setState({ architectureDiagram: detail.value });
                // if (detail.value.length === 0) {
                //   this.resetArchitectureDiagram();
                // } else {
                //   this.uploadArchitectureDiagram(detail.value[0]);
                // }
              }}
              value={this.state.architectureDiagram}
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
          </FormField>
          {reference}
        </SpaceBetween>
      );
    } else {
      return (
        <SpaceBetween direction="vertical" size="s">
          <FormField label="Quiz" description="Add quiz file">
            <FileUpload
              onChange={async ({ detail }) => {
                this.setState({ quiz: detail.value });
                //   if (detail.value.length === 0) {
                //     this.resetQuiz();
                //   } else {
                //     this.uploadQuiz(detail.value[0]);
                //   }
              }}
              value={this.state.quiz}
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

  // render review section in step 3
  renderReviewSection = () => {
    if (this.state.lectureType === "Video") {
      return (
        <ColumnLayout columns={2} vareiant="text-grid">
          <div>
            <Box variant="awsui-key-label">{this.state.videoMode === "s3" ? "File name" : "Video URL"}</Box>
            <div>
              {this.state.lectureVideo.length > 0
                ? this.state.lectureVideo[0].name : this.state.youtubeVideo }
            </div>
          </div>
        </ColumnLayout>
      );
    } else if (this.state.lectureType === "Workshop") {
      return (
        <ColumnLayout columns={3} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Workshop URL</Box>
            <div>{this.state.workshopUrl}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Workshop Description</Box>
            <div>{this.state.workshopDescription}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Architecture Diagram</Box>
            <div>
              {this.state.architectureDiagram.length > 0
                ? this.state.architectureDiagram[0].name
                : ""}
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
              {this.state.quiz.length > 0 ? this.state.quiz[0].name : ""}
            </div>
          </div>
        </ColumnLayout>
      );
    }
  };

  render() {
    return this.state.redirectToHome ? (
      <Navigate to={"/"} />
    ) : (
      <div>
        <NavBar navigation={this.props.navigation} title="Cloud Academy" />
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
              submitButton: this.state.continue ? "Create Continue" : "Submit",
              optional: "optional",
            }}
            isLoadingNextStep={this.state.isLoadingNextStep}
            onSubmit={this.submitRequest}
            onCancel={() => this.setState({ redirectToHome: true })}
            onNavigate={({ detail }) =>
              this.setState({ activeStepIndex: detail.requestedStepIndex })
            }
            activeStepIndex={this.state.activeStepIndex}
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
                          value={this.state.lectureTitle}
                          onChange={(event) =>
                            this.setState({ lectureTitle: event.detail.value })
                          }
                        />
                      </FormField>
                      <FormField label="Lecture Description">
                        <Input
                          value={this.state.lectureDescription}
                          onChange={(event) =>
                            this.setState({
                              lectureDescription: event.detail.value,
                            })
                          }
                        />
                      </FormField>
                      <div>
                        <p>
                          <strong>Lecture Publicity</strong>
                        </p>
                        <Toggle
                          onChange={({ detail }) =>
                            this.setState({ publicity: detail.checked })
                          }
                          checked={this.state.publicity}
                        >
                          Public Lecture
                        </Toggle>
                      </div>
                      <FormField label="Lecture Type">
                        <RadioGroup
                          value={this.state.lectureType}
                          onChange={(event) =>
                            this.setState({ lectureType: event.detail.value })
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
                title: "Add Content",
                content: (
                  <Container
                    header={<Header variant="h2">Lecture Content</Header>}
                  >
                    <SpaceBetween direction="vertical" size="l">
                      {this.renderAddContent()}
                    </SpaceBetween>
                  </Container>
                ),
                isOptional: false,
              },
              {
                title: "Review and launch",
                content: (
                  <div>
                    <SpaceBetween direction="vertical" size="l">
                      <SpaceBetween direction="vertical" size="s">
                        <Flashbar items={this.state.flashItem} />
                        <Header
                          variant="h3"
                          actions={
                            <Button
                              onClick={() =>
                                this.setState({ activeStepIndex: 0 })
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
                              <div>{this.state.lectureTitle}</div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Description</Box>
                              <div>{this.state.lectureDescription}</div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">Lecture Type</Box>
                              <div>{this.state.lectureType}</div>
                            </div>
                          </ColumnLayout>
                        </Container>
                      </SpaceBetween>
                      <SpaceBetween size="xs">
                        <Header variant="h3">Step 2: Add Content</Header>
                        <Container
                          header={<Header variant="h2">Lecture Content</Header>}
                        >
                          {this.renderReviewSection()}
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
}

export default CreateLecture;
