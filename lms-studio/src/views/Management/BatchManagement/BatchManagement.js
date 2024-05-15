import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  FormField,
  Icon,
  FileUpload,
  Flashbar,
  Input,
} from "@cloudscape-design/components";
import { API, Storage } from "aws-amplify";
import {
  apiName,
  secretKeyPath,
  lecturePath,
  batchWriteLecturePath,
  batchWriteCoursePath,
} from "../../../utils/api";
import { v4 as uuid } from "uuid";
// import LectureList from "../../../assets/test/LectureList.json";
import putCourseTemplate from "../../../assets/template/putCourseTemplate.json";
import Papa from "papaparse";

const successMes = "Created success";
const noticeMes = "No any resources";
const errorMess = "Error! An error occurred. Please try again later";

function generateRecords() {
  const records = [];

  for (let i = 0; i < 500; i++) {
    const record = {
      ID: uuid(),
      Content: `lecture-videos/${Math.floor(Math.random() * 100000)}.mp4`,
      CreatorID: uuid(),
      Desc: "Random Description",
      LastUpdated: new Date().toISOString(),
      Length: Math.floor(Math.random() * 10000),
      Name: "Random Name",
      Publicity: 1,
      ReferDocs: [],
      ReferUrl: [],
      State: "Disabled",
      Transcription: `transcription/${Math.floor(Math.random() * 100000)}.json`,
      Type: "Video",
      Views: Math.floor(Math.random() * 100),
      WorkshopDescription: "",
      WorkshopUrl: "",
      YoutubeVideoURL: "",
    };

    records.push(record);
  }

  return records;
}

function BatchManagement(props) {
  const [isCreatingLecture, setIsCreatingLecture] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseTemplate, setCourseTemplate] = useState([]);
  const [flashItem, setFlashItem] = useState([]);
  const [folder, setFolder] = useState("")

  // test upload 500 records to DynamoDB
  // useEffect(() => {
  //   const records = generateRecords();
  //   console.log(records.length)
  //   API.put(apiName, batchWriteLecturePath, { body: records }).then((data) => console.log("successful"));
  // }, [])
  const createMultiLectures = async (e) => {
    e.preventDefault();
    const lecturesData = [];
    setIsCreatingLecture(true);
    const lectureList = await Storage.list(`lecture-videos/${folder}`, {
      pageSize: "ALL",
    });
    // const quizList =  await Storage.list({ prefix: "quizzes/", level: "public" });
    const chunkLectureList = [];
    while (lectureList.results.length > 0) {
      chunkLectureList.push(lectureList.results.splice(0, 500));
    }
    console.log(chunkLectureList);
    // L-lecturename-publicity-videoname-material
    if (chunkLectureList.length > 0) {
      try {
        for (const chunk of chunkLectureList) {
          for (let i = 0; i < chunk.length; i++) {
            const video = chunk[i];
            if (video.size > 0) {
              const videoPath = video.key;
              const videoName = video.key.split("/").slice(-1)[0];
              const splitName = videoName.split("-");
              const transcription =
                "transcription/" + videoName.split(".")[0] + ".json";

              const videoURL = await Storage.get(video.key, {
                level: "public",
              });
              const videoEle = await setLectureLength(videoURL);
              const lecture = {
                ID: uuid(),
                Name: splitName[1].replace(".mp4", ""),
                LastUpdated: new Date().toISOString(),
                Publicity:
                  splitName.length > 2 ? Number.parseInt(splitName[2]) : 1,
                Content: videoPath,
                Type: "Video",
                State: "Enabled",
                Length: Math.round(videoEle.duration),
                WorkshopUrl: "",
                WorkshopDescription: "",
                YoutubeVideoURL: "",
                Views: 0,
                ReferDocs:
                  splitName.length === 5
                    ? `public/refer-docs/${splitName[4]}`
                    : [],
                ReferUrl: [],
                Transcription: transcription,
              };

              lecturesData.push(lecture);
            }
          }

          console.log(lecturesData);
          await API.put(apiName, batchWriteLecturePath, { body: lecturesData });
        }
        setFlashItem([
          {
            type: "success",
            content: successMes,
            dismissible: true,
            dismissLabel: "Dismiss message",
            onDismiss: () => setFlashItem([]),
            id: "success_message",
          },
        ]);
        setIsCreatingLecture(false);
      } catch (error) {
        console.log(error);
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
        setIsCreatingLecture(false);
      }
    } else {
      setFlashItem([
        {
          type: "success",
          content: noticeMes,
          dismissible: true,
          dismissLabel: "Dismiss message",
          onDismiss: () => setFlashItem([]),
          id: "success_message",
        },
      ]);
      setIsCreatingLecture(false);
    }
  };
  const downloadLectureList = async () => {
    try {
      const response = await API.get(apiName, lecturePath);
      exportCSVFile(response, "lectureList");
      // test
      // exportCSVFile(LectureList, "lectureList")
    } catch (_) {}
  };

  const setLectureLength = (url) =>
    new Promise((resolve, reject) => {
      if (url) {
        try {
          let video = document.createElement("video");
          video.preload = "metadata";

          video.onloadedmetadata = function () {
            resolve(this);
          };

          video.onerror = function (error) {
            console.log(error);
            reject("Invalid video. Please select a video file.");
          };

          video.src = url;
        } catch (e) {
          reject(e);
        }
      } else {
        // this.setState({ lectureVideoLength: 0 });
      }
    });

  const convertToCSV = (objArray) => {
    // var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    var str = "";
    // console.log(array)
    // for (var i = 0; i < array.length; i++) {
    //   var line = "";
    //   if (i === 0) {
    //     for (var index in array[0]) {
    //       if (line != "") line += ",";
    //       line += index;
    //     }
    //     str += line + "\r\n";
    //     line = "";
    //   }
    //   for (var index in array[i]) {
    //     // console.log(array[i])
    //     if (line != "") line += ",";

    //     line += array[i][index];
    //   }

    //   str += line + "\r\n";
    // }
    str = Papa.unparse(objArray)
    return str;
  };

  const exportCSVFile = (items, fileTitle) => {
    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = convertToCSV(jsonObject);

    var exportedFilename = fileTitle + ".csv" || "export.csv";

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, exportedFilename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const downCourseTemplate = () => {
    var blob = new Blob([JSON.stringify(putCourseTemplate)]);
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "putCourseTemplate.json");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createMultiCourses = async (e) => {
    e.preventDefault();
    setIsCreatingCourse(true);
    const fileContent = await parseJsonFile(courseTemplate[0]);
    const chunkCourseList = [];
    while (fileContent.length > 0) {
      chunkCourseList.push(fileContent.splice(0, 500));
    }

    if (chunkCourseList.length > 0) {
      try {
        for (const chunk of chunkCourseList) {
          await API.put(apiName, batchWriteCoursePath, { body: chunk });
        }
      } catch (error) {
        console.log(error);
        setFlashItem([
          {
            type: "success",
            content: errorMess,
            dismissible: true,
            dismissLabel: "Dismiss message",
            onDismiss: () => setFlashItem([]),
            id: "success_message",
          },
        ]);
        setIsCreatingCourse(false);
      }
    }
    setFlashItem([
      {
        type: "success",
        content: successMes,
        dismissible: true,
        dismissLabel: "Dismiss message",
        onDismiss: () => setFlashItem([]),
        id: "success_message",
      },
    ]);
    setIsCreatingCourse(false);
  };

  async function parseJsonFile(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => resolve(JSON.parse(event.target.result));
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });
  }

  return (
    <>
      <SpaceBetween direction="vertical" size="s">
        <Flashbar items={flashItem} />
        <Container
          header={
            <Header
              variant="h2"
              description="Admin create lecture by video, document and quiz resources"
            >
              Create Lectures
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="s">
            <FormField label="Lecture folder" description="Folder contains just uploaded resources">
              <Input
                value={folder}
                onChange={(event) => setFolder(event.detail.value)
                }
              />
            </FormField>
            <Button
              variant="primary"
              loading={isCreatingLecture}
              onClick={(e) => createMultiLectures(e)}
            >
              Create
            </Button>
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header
              variant="h2"
              description="Admin create multi course with template"
            >
              Download lecture list and course template
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="xs">
            <FormField label="Download lecture list" description=".csv file">
              <Button onClick={() => downloadLectureList()}>
                Download <Icon name="download" />
              </Button>
            </FormField>
            <FormField
              label="Download create multi courses template"
              description=".json file"
            >
              <Button onClick={() => downCourseTemplate()}>
                Download <Icon name="download" />
              </Button>
            </FormField>
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header
              variant="h2"
              description="Admin upload template to create courses"
            >
              Upload
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="xs">
            <FormField label="Upload template">
              <FileUpload
                onChange={async ({ detail }) => {
                  setCourseTemplate(detail.value);
                }}
                value={courseTemplate}
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
                constraintText=".json"
                accept=".json"
              />
            </FormField>
            <div style={{ float: "right" }}>
              <Button
                variant="primary"
                loading={isCreatingCourse}
                onClick={(e) => createMultiCourses(e)}
              >
                Create
              </Button>
            </div>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </>
  );
}

export default BatchManagement;
