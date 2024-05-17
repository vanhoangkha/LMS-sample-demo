import React, { useState, useEffect, useRef } from "react";
import "./Learn.css";
import "video-react/dist/video-react.css";
import { API, Auth, Storage } from "aws-amplify";
import { Helmet } from "react-helmet";
import NavBar from "../../components/NavBar/NavBar";
import { withTranslation } from "react-i18next";
import {
  AppLayout,
  BreadcrumbGroup,
  SideNavigation,
  Toggle,
  Button,
  RadioGroup,
  Alert,
  Checkbox,
  Modal,
  Box,
  SpaceBetween,
  HelpPanel,
  Tabs,
  Header,
  Icon,
} from "@cloudscape-design/components";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { csv } from "csvtojson";
import Papa from "papaparse";
import { getUISet } from "../../utils/tools";

import {
  Player,
  LoadingSpinner,
  BigPlayButton,
  ControlBar,
  ReplayControl,
  ForwardControl,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  FullscreenToggle,
} from "video-react";

import {
  IoChevronBack,
  IoChevronForward,
  IoExpand,
  IoContract,
  IoClose,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoEllipseSharp,
  IoCheckmarkSharp,
  IoFemaleSharp,
} from "react-icons/io5";
import { Navigate } from "react-router-dom";
import {
  apiName,
  userCoursePath,
  userCourseUpdatePath,
  userLecturePath,
  coursePath,
  lecturePath,
} from "../../utils/api";

import loadingGif from "../../assets/images/loading.gif";

const DEBUG = true;
const MAX_ANSWERS = 6;
const landingPageUrl = "https://dev.dfpjafbqllhh1.amplifyapp.com/";

function PageMetadata(props) {
  return (
    <Helmet>
      <title>{props.courseName}</title>
    </Helmet>
  );
}

function LoadingContainer() {
  return (
    <div fluid="true" className="learn-parent-loading">
      <img src={loadingGif} alt="loading..." className="learn-loading-gif" />
    </div>
  );
}

function ContentLoading() {
  return (
    <div className="learn-player-loading">
      <img src={loadingGif} alt="loading..." className="learn-loading-gif" />
    </div>
  );
}

// function LectureContent(props) {
//   const playerChild = useRef();

//   const changeVideoTime = (startTime) => {
//     playerChild.current.changeVideoTime(startTime);
//   };

//   switch (props.lecture.lecture.type) {
//     case "Video":
//       return (
//         <VideoContent
//           ref={playerChild}
//           videoSrc={props.lecture.lecture.content}
//           setTimeLeft={props.setTimeLeft}
//           handleFullScreen={props.handleFullScreen}
//           handleVideoEnded={props.handleVideoEnded}
//           lectureId={props.lecture.lecture.id}
//           countView={props.countView}
//         />
//       );
//     case "Workshop":
//       return (
//         <LabContent
//           desc={props.lecture.lecture.workshopDesc}
//           url={props.lecture.lecture.workshopUrl}
//           architect={props.lecture.lecture.content}
//           openLink={props.openLink}
//           countView={props.countView}
//           markLectureCompleted={props.markLectureCompleted}
//         />
//       );
//     case "Document":
//       return (
//         <DocumentContent
//           desc={props.lecture.lecture.desc}
//           url={props.lecture.lecture.content}
//           openLink={props.openLink}
//         />
//       );
//     case "Survey":
//       return (
//         <SurveyContent
//           desc={props.lecture.lecture.desc}
//           url={props.lecture.lecture.content}
//           openLink={props.openLink}
//           name={props.lecture.lecture.name}
//         />
//       );
//     case "Quiz":
//       return (
//         <QuizContent
//           desc={props.lecture.lecture.desc}
//           url={props.lecture.lecture.content}
//           // openLink={props.openLink}
//           name={props.lecture.lecture.name}
//           // questions={props.lecture.lecture.questions}
//           nextLecture={props.nextLecture}
//           markLectureCompleted={props.markLectureCompleted}
//           setQuestionLength={props.setQuestionLength}
//           countView={props.countView}
//           isLast={props.isLast}
//         />
//       );
//     default:
//       return <></>;
//   }
// }

class LectureContent extends React.Component {
  constructor(props) {
    super(props);
    this.playerChild = React.createRef();
  }

  changeVideoTime = (startTime) => {
    this.playerChild.current.changeVideoTime(startTime);
  };

  renderComponent = () => {
    switch (this.props.lecture.lecture.type) {
      case "Video":
        return (
          <VideoContent
            ref={this.playerChild}
            videoSrc={this.props.lecture.lecture.content}
            youtubeVideoSrc={this.props.lecture.lecture.youtubeVideoSrc}
            transcript={this.props.lecture.transcript}
            setTimeLeft={this.props.setTimeLeft}
            handleFullScreen={this.props.handleFullScreen}
            handleVideoEnded={this.props.handleVideoEnded}
            lectureId={this.props.lecture.lecture.id}
            countView={this.props.countView}
            setCurrentVideoTime={this.props.setCurrentVideoTime}
            t={this.props.t}
          />
        );
      case "Workshop":
        return (
          <LabContent
            desc={this.props.lecture.lecture.workshopDesc}
            url={this.props.lecture.lecture.workshopUrl}
            architect={this.props.lecture.lecture.content}
            openLink={this.props.openLink}
            countView={this.props.countView}
            markLectureCompleted={this.props.markLectureCompleted}
          />
        );
      case "Document":
        return (
          <DocumentContent
            desc={this.props.lecture.lecture.desc}
            url={this.props.lecture.lecture.content}
            openLink={this.props.openLink}
          />
        );
      case "Survey":
        return (
          <SurveyContent
            desc={this.props.lecture.lecture.desc}
            url={this.props.lecture.lecture.content}
            openLink={this.props.openLink}
            name={this.props.lecture.lecture.name}
          />
        );
      case "Quiz":
        return (
          <QuizContent
            desc={this.props.lecture.lecture.desc}
            url={this.props.lecture.lecture.content}
            // openLink={this.props.openLink}
            name={this.props.lecture.lecture.name}
            // questions={this.props.lecture.lecture.questions}
            nextLecture={this.props.nextLecture}
            markLectureCompleted={this.props.markLectureCompleted}
            setQuestionLength={this.props.setQuestionLength}
            countView={this.props.countView}
            isLast={this.props.isLast}
            t={this.props.t}
          />
        );
      default:
        return <></>;
    }
  };

  render() {
    return <>{this.renderComponent()}</>;
  }
}

class Trancription extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.isOpenTranscript !== state.prevPropsIsOpenTranscript) {
      return {
        prevPropsIsOpenTranscript: props.isOpenTranscript,
        isActive: props.isOpenTranscript,
      };
    }
  }

  handleClick = (event) => {
    console.log(this.props.actions)
    if (!this.props.isOpenTranscript){
      // event.target.classList.add("video-react-icon-transcript-active");
      this.props.openTrans();
      // this.isActive.current = true;
      this.setState({isActive: true})
    }else{
      // event.target.classList.remove("video-react-icon-transcript-active");
      this.props.closeTrans();
      // this.isActive.current = false;
      this.setState({isActive: false})
    }
    
  }
  render() {
    return (
      <button className={!this.state.isActive ? "video-react-control video-react-button video-react-icon-transcript" : "video-react-control video-react-button video-react-icon-transcript video-react-icon-transcript-active"}
        onClick={(event) => this.handleClick(event)}
      >
      </button>
    );
  }
} 

class VideoContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoSrc: null,
      updateView: false,
      isOpenTranscript: false,
      isFullscreenEnabled: false,
      currentVideoTime: 0,
      isMobile: window.innerWidth < 500,
      // uploading: false,
    };
    this.uploadingRef = React.createRef();
    this.uploadingRef.current = false;
  }

  componentDidMount() {
    if (this.props.videoSrc) {
      this.getVideoURL(this.props.videoSrc);
      this.player.subscribeToStateChange(this.handleStateChange.bind(this));
    } else {
      console.log(this.props.youtubeVideoSrc);
      // fetch(`https://noembed.com/embed?url=${this.props.youtubeVideoSrc}`)
      //   .then((res) => res.json())
      //   .then((out) => {
      //     let youtubeVideo = document.getElementById("youtube-video");
      //     youtubeVideo.innerHTML = out.html;
      //     let iframe = document.getElementsByTagName('iframe');
      //     iframe.width = "400";
      //   })
      //   .catch((err) => {
      //     throw err;
      //   });
      const videoID = this.props.youtubeVideoSrc.split("=")[1];
      let iframe = document.getElementById("youtube-video");
      iframe.src = `https://www.youtube.com/embed/${videoID}`;
      iframe.width = "100%";
      iframe.height = "100%";
    }

    window.addEventListener('resize', () => {
      this.setState({
          isMobile: window.innerWidth < 500
      });
    }, false);

    // this.player.actions.toggleFullscreen = () => {
    //   this.props.handleFullScreen();
    // };
  }

  handleStateChange(state, prevState) {
    this.props.setTimeLeft(Math.floor(state.duration - state.currentTime));
    // console.log(state.ended);
    if (state.ended) this.props.handleVideoEnded();
    // if (!this.uploadingRef.current && !this.state.updateView && state.currentTime / state.duration > 0.05) {
    //   this.countView()
    // }
    if (state.currentTime / state.duration > 0.05) {
      this.props.countView();
    }
    if (prevState.isFullscreen !== state.isFullscreen) {
      this.setState({ isFullscreenEnabled: state.isFullscreen });
    }
    // this.props.setCurrentVideoTime(state.currentTime);
    this.setState({ currentVideoTime: state.currentTime});
  }

  getVideoURL = async (key) => {
    if (key) {
      const signedURL = await Storage.get(key, { level: "public" });
      this.setState({ videoSrc: signedURL });
    } else {
      this.setState({ videoSrc: this.props.youtubeVideoSrc });
    }
  };

  closeTrans = () => {
    let videoEle = document.getElementsByClassName('lesson-video');
    let transEle = document.getElementsByClassName('transcription');
    transEle[0].style.display = "none";
    videoEle[0].style.width = "100%";
    this.setState({ isOpenTranscript: false });
  }

  openTrans = () => {
    let transEle = document.getElementsByClassName('transcription');
    transEle[0].style.display = "block";
    this.setState({ isOpenTranscript: true });
  }

  changeVideoTime = (startTime) => {
    this.player.seek(startTime);
  };

  render() {
    const t = this.props.t
    const classNames = [
      'lesson-video',
    ];
    if ( !this.state.isFullscreenEnabled ){
      classNames.push("learn-transparent-player")
    }
    if ( this.state.isMobile & this.state.isOpenTranscript ){
      classNames.push("video-hidden")
    }

    if (this.props.videoSrc) {
      return (
        <div className="video-lesson">
          <Player
            ref={(player) => {
              this.player = player;
            }}
            className={classNames.join(' ')}
            autoPlay
            playsInline
            fluid={false}
            height="100%"
            width="100%"
            src={this.state.videoSrc}
          >
            <LoadingSpinner />
            <BigPlayButton position="center" />
            <ControlBar>
              <ReplayControl seconds={5} order={2.1} />
              <ForwardControl seconds={5} order={2.2} />
              <PlaybackRateMenuButton
                rates={[2, 1.5, 1.25, 1, 0.9, 0.75]}
                order={7}
              />
              <VolumeMenuButton order={8} />
              <Trancription openTrans={this.openTrans} closeTrans={this.closeTrans} isOpenTranscript={this.state.isOpenTranscript} order={9}></Trancription>
              {/* <FullscreenToggle disabled/> */}
            </ControlBar>
          </Player>
          <div className="transcription">
            <Header variant="h3" actions={<div style={{cursor: "pointer"}} onClick={() => this.closeTrans()}><Icon name="close" /></div>} >
              {t("learn.transcription")}
            </Header>
            <span className="transcript">
              {this.props.transcript
                ? this.props.transcript.map((item, index) => {
                    return (
                      <div
                        ref={
                          this.state.currentVideoTime >= item.start_time &&
                          this.state.currentVideoTime <= item.end_time
                            ? this.wordElement
                            : null
                        }
                        key={index}
                        className="trans-word"
                        onClick={(e) => this.changeVideoTime(item.start_time)}
                      >
                        <span
                          className={
                            this.state.currentVideoTime >= item.start_time &&
                            this.state.currentVideoTime <= item.end_time
                              ? "bg-yellow-500"
                              : ""
                          }
                        >
                          {item.alternatives[0].content === "," ||
                          item.alternatives[0].content === "."
                            ? item.alternatives[0].content
                            : " " + item.alternatives[0].content}
                        </span>
                      </div>
                    );
                  })
                : ""}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <iframe id="youtube-video" src=""></iframe>
        </div>
      );
    }
  }
}

function LabContent(props) {
  const [architectUrl, setArchitecUrl] = useState("");
  useEffect(() => {
    Storage.get(props.architect, { level: "public" }).then((res) =>
      setArchitecUrl(res)
    );
    props.countView();
    props.markLectureCompleted();
  });
  return (
    <div className="learn-lab-content-container">
      <>
        <div className="learn-lab-content-desc">{props.desc}</div>
        <div className="learn-lab-content-link">
          <button
            onClick={() => {
              props.openLink(props.url);
            }}
          >
            {props.url}
          </button>
        </div>
        <div className="learn-lab-architech" style={{ textAlign: "center" }}>
          <img src={architectUrl} />
        </div>
      </>
    </div>
  );
}

function DocumentContent(props) {
  return (
    <div className="learn-lab-content-container">
      <div className="learn-lab-content-desc">{props.desc}</div>
      <div className="learn-lab-content-link">
        <button
          onClick={() => {
            props.openLink(props.url);
          }}
        >
          {props.url}
        </button>
      </div>
    </div>
  );
}

function SurveyContent(props) {
  return (
    <div className="learn-lab-content-container">
      <div className="learn-lab-content-desc">{props.desc}</div>
      <div className="learn-lab-content-link">
        <button
          onClick={() => {
            props.openLink(props.url);
          }}
        >
          {props.url}
        </button>
      </div>
    </div>
  );
}

class QuizContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: null,
      quizStarted: false,
      quizDone: false,
      quizPassed: false,
      currentQuestionAnswered: false,
      currentQuestion: 0,
      selectedAnswer: null,
      selectedMultiAnswer: [],
      checkedAnswer: Array(6).fill(false),
      correctedAnswer: 0,
      visible: false,
    };
  }

  convertCSVtoJSON = async (key) => {
    var commonConfig = { delimiter: ";" };
    const signedURL = await Storage.get(key, { level: "public" });
    // const response = await fetch(signedURL);

    // console.log(response)
    // const responseJson = await response.json();
    // const responseJson = await csv().fromStream(response);

    Papa.parse(signedURL, {
      ...commonConfig,
      header: true,
      download: true,
      complete: (result) => {
        this.setState({ questions: Array.from(result.data) });
        this.props.setQuestionLength(result.data.length);
        console.log(result.data);
        // this.convertJSONToObject(result.data)
      },
    });
  };

  getAnswerRadio = () => {
    let answers = [];
    for (let i = 0; i < 6; i++) {
      if (this.state.questions[this.state.currentQuestion][`A${i}`]) {
        answers.push({
          value: i,
          label: this.state.questions[this.state.currentQuestion][`A${i}`],
          disable: this.state.currentQuestionAnswered,
        });
      }
    }
    return answers;
  };

  getAnswerCheckBox = () => {
    // console.log(this.state.selectedMultiAnswer);
    const checkboxGroup = [];
    for (let i = 0; i < 6; i++) {
      if (this.state.questions[this.state.currentQuestion][`A${i}`]) {
        checkboxGroup.push(
          <Checkbox
            onChange={({ detail }) => {
              let preChecked = this.state.checkedAnswer;
              let preSelectedMultiAns = this.state.selectedMultiAnswer;
              preChecked[i] = detail.checked;
              this.setState({ checkedAnswer: preChecked });
              if (detail.checked) {
                preSelectedMultiAns = [...preSelectedMultiAns, i];
              } else {
                preSelectedMultiAns = preSelectedMultiAns.filter(
                  (item) => item != i
                );
              }
              this.setState({ selectedMultiAnswer: preSelectedMultiAns });
            }}
            checked={this.state.checkedAnswer[i]}
            disabled={this.state.currentQuestionAnswered}
          >
            {this.state.questions[this.state.currentQuestion][`A${i}`]}
          </Checkbox>
        );
      }
    }
    return checkboxGroup;
  };

  getCorrectAnswer = () => {
    let j = 0;
    let correctAnswer = [];
    while (j < MAX_ANSWERS) {
      let answer = parseInt(
        this.state.questions[this.state.currentQuestion][`C${j}`]
      );
      if (this.state.questions[this.state.currentQuestion][`C${j}`] !== "") {
        correctAnswer.push(answer);
      }
      j++;
    }
    return correctAnswer;
  };

  checkAnswer = () => {
    if (
      this.state.questions[
        this.state.currentQuestion
      ].Multichoice.localeCompare("1") === 0
    ) {
      let countAnswer = 0;
      const correctAnswer = this.getCorrectAnswer();
      if (this.state.selectedMultiAnswer.length != correctAnswer.length) {
        return false;
      } else {
        for (let i = 0; i < this.state.selectedMultiAnswer.length; i++) {
          if (correctAnswer.includes(this.state.selectedMultiAnswer[i])) {
            countAnswer++;
          }
        }

        if (countAnswer != correctAnswer.length) {
          return false;
        }
      }

      return true;
    } else {
      if (
        this.state.selectedAnswer ===
        parseInt(this.state.questions[this.state.currentQuestion]["C0"])
      ) {
        return true;
      }

      return false;
    }
  };

  componentDidMount() {
    this.convertCSVtoJSON(this.props.url);
    this.props.countView();
  }

  render() {
    const t = this.props.t;
    return (
      <div className="learn-lab-content-container learn-lab-content-container-quiz">
        {/* <div className="learn-lab-content-desc learn-lab-content-quiz">
          {!this.state.quizStarted ? (
            <div className="learn-lab-content-question">{this.props.desc}</div>
          ) : this.state.quizDone ? (
            this.state.quizPassed ? (
              <div className="learn-lab-content-question">
                Congratulation! You passed the quiz.
              </div>
            ) : (
              <div className="learn-lab-content-question">
                Unfortunately you didn't pass. Keep trying!
              </div>
            )
          ) : !this.state.currentQuestionAnswered ? (
            <div>
              <div className="learn-lab-content-question">
                {questions[this.state.currentQuestion].question}
              </div>
              <RadioGroup
                onChange={({ detail }) =>
                  this.setState({ selectedAnswer: detail.value })
                }
                value={this.state.selectedAnswer}
                items={questions[this.state.currentQuestion].answers.map(
                  (answer, index) => {
                    return {
                      value: index,
                      label: answer.text,
                    };
                  }
                )}
              />
            </div>
          ) : (
            <div>
              <Alert
                statusIconAriaLabel="Success"
                type={
                  questions[this.state.currentQuestion].answers[
                    this.state.selectedAnswer
                  ].correct
                    ? "success"
                    : "error"
                }
              >
                {
                  questions[this.state.currentQuestion].answers[
                    this.state.selectedAnswer
                  ].explain
                }
              </Alert>
              <div className="space-20" />
              <div className="learn-lab-content-question">
                {questions[this.state.currentQuestion].question}
              </div>
              <RadioGroup
                onChange={({ detail }) =>
                  this.setState({ selectedAnswer: detail.value })
                }
                value={this.state.selectedAnswer}
                items={questions[this.state.currentQuestion].answers.map(
                  (answer, index) => {
                    return {
                      value: index,
                      label: answer.text,
                      disabled: true,
                    };
                  }
                )}
              />
            </div>
          )}
        </div>
        <div className="learn-lab-quiz-control">
          <div className="learn-lab-quiz-control-left">
            {this.state.quizStarted && !this.state.quizDone
              ? "Question " +
                (this.state.currentQuestion + 1) +
                "/" +
                this.props.questions.length
              : ""}
          </div>
          <div className="learn-lab-quiz-control-right">
            {!this.state.quizStarted ? (
              <Button
                variant="primary"
                className="btn-orange"
                onClick={() =>
                  this.setState({
                    quizStarted: true,
                    quizDone: false,
                    quizPassed: false,
                    currentQuestionAnswered: false,
                    currentQuestion: 0,
                    selectedAnswer: null,
                    correctedAnswer: 0,
                  })
                }
              >
                Start Quiz
              </Button>
            ) : this.state.quizDone ? (
              this.state.quizPassed ? (
                <Button
                  variant="primary"
                  className="btn-orange"
                  onClick={() => {
                    this.props.markLectureCompleted();
                    this.props.nextLecture();
                  }}
                >
                  Finish
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="btn-orange"
                  onClick={() =>
                    this.setState({ quizStarted: false, quizDone: false })
                  }
                >
                  Retry
                </Button>
              )
            ) : !this.state.currentQuestionAnswered ? (
              <Button
                variant="primary"
                className="btn-orange"
                onClick={() => {
                  if (this.state.selectedAnswer !== null)
                    this.setState({ currentQuestionAnswered: true });
                }}
              >
                Answer
              </Button>
            ) : (
              <Button
                variant="primary"
                className="btn-orange"
                onClick={() => {
                  let currentQuestion = this.state.currentQuestion;
                  let nextQuestion = this.state.currentQuestion + 1;
                  let correctedAnswer =
                    this.state.correctedAnswer +
                    (questions[currentQuestion].answers[
                      this.state.selectedAnswer
                    ].correct ===
                      true);

                  this.setState({ correctedAnswer: correctedAnswer });

                  console.log(correctedAnswer);

                  if (nextQuestion >= this.props.questions.length) {
                    this.setState({
                      quizDone: true,
                      quizPassed: correctedAnswer === questions.length,
                    });
                  } else {
                    this.setState({
                      currentQuestion: nextQuestion,
                      currentQuestionAnswered: false,
                      selectedAnswer: null,
                    });
                  }
                }}
              >
                Next
              </Button>
            )}
          </div>
        </div> */}
        <div className="learn-lab-content-desc learn-lab-content-quiz">
          {!this.state.quizStarted ? (
            <div className="learn-lab-content-question">{this.props.desc}</div>
          ) : this.state.quizDone ? (
            this.state.quizPassed ? (
              <div className="learn-lab-content-question">
                {t("learn.pass")}
              </div>
            ) : (
              <div className="learn-lab-content-question">
                {t("learn.fail")}
              </div>
            )
          ) : !this.state.currentQuestionAnswered ? (
            <div>
              <div className="learn-lab-content-question">
                {this.state.questions[this.state.currentQuestion].Question}
              </div>
              {this.state.questions[
                this.state.currentQuestion
              ].Multichoice.localeCompare("1") < 0 ? (
                <div>
                  <RadioGroup
                    onChange={
                      ({ detail }) =>
                        this.setState({ selectedAnswer: detail.value })
                      // console.log(detail.value)
                    }
                    value={this.state.selectedAnswer}
                    // items={this.getAnswerRadio()}
                    items={(() => {
                      let answers = [];
                      for (let i = 0; i < 6; i++) {
                        if (
                          this.state.questions[this.state.currentQuestion][
                            `A${i}`
                          ]
                        ) {
                          answers.push({
                            value: i,
                            label:
                              this.state.questions[this.state.currentQuestion][
                                `A${i}`
                              ],
                          });
                        }
                      }
                      // console.log(answers);
                      return answers;
                    })()}
                  />
                </div>
              ) : (
                this.getAnswerCheckBox()
              )}
            </div>
          ) : (
            <div>
              <Alert
                statusIconAriaLabel="Success"
                type={this.checkAnswer() ? "success" : "error"}
              >
                {this.state.questions[
                  this.state.currentQuestion
                ].Multichoice.localeCompare("1") === 0
                  ? this.state.selectedMultiAnswer.map((ans) => (
                      <div>
                        {
                          this.state.questions[this.state.currentQuestion][
                            `E${ans}`
                          ]
                        }
                      </div>
                    ))
                  : this.state.questions[this.state.currentQuestion][
                      `E${this.state.selectedAnswer}`
                    ]}
              </Alert>
              <div className="space-20" />
              <div className="learn-lab-content-question">
                {this.state.questions[this.state.currentQuestion].Question}
              </div>
              {this.state.questions[
                this.state.currentQuestion
              ].Multichoice.localeCompare("1") < 0 ? (
                <RadioGroup
                  onChange={({ detail }) =>
                    this.setState({ selectedAnswer: detail.value })
                  }
                  value={this.state.selectedAnswer}
                  items={this.getAnswerRadio()}
                />
              ) : (
                this.getAnswerCheckBox()
              )}
            </div>
          )}
        </div>
        <div className="learn-lab-quiz-control">
          <div className="learn-lab-quiz-control-left">
            {this.state.quizStarted && !this.state.quizDone
              ? t("learn.question") +
                (this.state.currentQuestion + 1) +
                "/" +
                this.state.questions.length
              : ""}
          </div>
          <div className="learn-lab-quiz-control-right">
            {!this.state.quizStarted ? (
              <Button
                variant="primary"
                className="btn-orange"
                onClick={() =>
                  this.setState({
                    quizStarted: true,
                    quizDone: false,
                    quizPassed: false,
                    currentQuestionAnswered: false,
                    currentQuestion: 0,
                    selectedAnswer: null,
                    selectedMultiAnswer: [],
                    checkedAnswer: Array(6).fill(false),
                    correctedAnswer: 0,
                  })
                }
              >
                {t("learn.start")}
              </Button>
            ) : this.state.quizDone ? (
              this.state.quizPassed ? (
                <Button
                  variant="primary"
                  className="btn-orange"
                  onClick={() => {
                    this.props.markLectureCompleted();
                    this.props.nextLecture();
                    if (this.props.isLast) {
                      this.setState({ visible: true });
                    }
                  }}
                >
                  {t("learn.finish")}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="btn-orange"
                  onClick={() =>
                    this.setState({ quizStarted: false, quizDone: false })
                  }
                >
                  {t("learn.retry")}
                </Button>
              )
            ) : !this.state.currentQuestionAnswered ? (
              <Button
                variant="primary"
                className="btn-orange"
                onClick={() => {
                  if (
                    this.state.selectedAnswer !== null ||
                    this.state.selectedMultiAnswer.length > 0
                  )
                    this.setState({ currentQuestionAnswered: true });
                }}
              >
                {t("learn.answer")}
              </Button>
            ) : (
              <Button
                variant="primary"
                className="btn-orange"
                onClick={() => {
                  let currentQuestion = this.state.currentQuestion;
                  let nextQuestion = this.state.currentQuestion + 1;
                  let correctedAnswer = this.state.correctedAnswer;
                  correctedAnswer += this.checkAnswer() ? 1 : 0;
                  this.setState({
                    correctedAnswer: correctedAnswer,
                  });

                  console.log(correctedAnswer);

                  if (nextQuestion >= this.state.questions.length) {
                    this.setState({
                      quizDone: true,
                      quizPassed:
                        correctedAnswer === this.state.questions.length,
                    });
                  } else {
                    this.setState({
                      currentQuestion: nextQuestion,
                      currentQuestionAnswered: false,
                      selectedAnswer: null,
                      selectedMultiAnswer: [],
                      checkedAnswer: Array(6).fill(false),
                    });
                  }
                }}
              >
                {t("learn.next")}
              </Button>
            )}
          </div>
        </div>
        <Modal
          onDismiss={() =>
            this.setState({
              visible: false,
              quizStarted: false,
              quizDone: false,
            })
          }
          visible={this.state.visible}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  onClick={() =>
                    this.setState({
                      visible: false,
                      quizStarted: false,
                      quizDone: false,
                    })
                  }
                >
                  {t("common.ok")}
                </Button>
              </SpaceBetween>
            </Box>
          }
          header="Congratulation"
        >
          {t("learn.complete")}
        </Modal>
      </div>
    );
  }
}

// function MainContent(props) {
//   // const handle = useFullScreenHandle();
//   const [fullscreen, setFullscreen] = useState(false);
//   const [autoNext, setAutoNext] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(100);
//   const [updateView, setUpdateView] = useState(false);
//   const uploadingRef = useRef(false);
//   const playerChild = useRef(false);

//   // console.log("updateView", updateView)
//   const countView = async () => {
//     if (!updateView && !uploadingRef.current) {
//       uploadingRef.current = true;
//       let lectureId = props.lecture.lecture.id;
//       const path = lecturePath + lectureId;

//       API.put(apiName, path, { body: {} })
//         .then((response) => {
//           console.log("count view done");
//           setUpdateView(true);
//           uploadingRef.current = false;
//           props.countViewForCourse();
//         })
//         .catch((error) => {
//           uploadingRef.current = false;
//           console.log(error);
//         });
//     }
//   };

//   useEffect(() => {
//     setUpdateView(false);
//   }, [props.lecture]);

//   const changeVideoTime = (startTime) => {
//     playerChild.current.changeVideoTime(startTime);
//   }

//   return (
//     // <FullScreen handle={handle}>
//     <div className="fullscreen">
//       <div
//         className={
//           fullscreen
//             ? "learn-content-parent full-screen"
//             : "learn-content-parent"
//         }
//       >
//         <div className="learn-content-main">
//           {props.loading ? (
//             <ContentLoading />
//           ) : (
//             <LectureContent
//               ref={playerChild}
//               lecture={props.lecture}
//               openLink={(url) => {
//                 setFullscreen(false);
//                 window.open(url, "_blank").focus();
//               }}
//               setTimeLeft={(timeLeft) => {
//                 setTimeLeft(timeLeft);
//               }}
//               handleFullScreen={() => {
//                 // if (fullscreen) handle.exit();
//                 // else handle.enter();
//                 // setFullscreen(!fullscreen);
//               }}
//               handleVideoEnded={() => {
//                 props.markLectureCompleted();
//                 if (autoNext && !props.isLast) {
//                   setTimeLeft(100);
//                   props.nextLecture();
//                 }
//               }}
//               nextLecture={props.nextLecture}
//               markLectureCompleted={props.markLectureCompleted}
//               setQuestionLength={props.setQuestionLength}
//               countView={countView}
//               isLast={props.isLast}
//             />
//           )}
//         </div>
//         <div className="learn-content-control">
//           <div className="learn-content-control-left">
//             {props.isFirst ? (
//               <button
//                 className="learn-content-control-btn content-control-btn-disabled"
//                 disabled
//               >
//                 <IoChevronBack />
//               </button>
//             ) : (
//               <button
//                 className="learn-content-control-btn"
//                 onClick={props.prevLecture}
//               >
//                 <IoChevronBack />
//               </button>
//             )}
//             {props.isLast ? (
//               <button
//                 className="learn-content-control-btn content-control-btn-disabled"
//                 disabled
//               >
//                 <IoChevronForward />
//               </button>
//             ) : (
//               <button
//                 className="learn-content-control-btn"
//                 onClick={props.nextLecture}
//               >
//                 <IoChevronForward />
//               </button>
//             )}
//             <Toggle
//               Todo
//               className="learn-auto-next-control"
//               id="toggle-check"
//               type="checkbox"
//               variant="outline-secondary"
//               checked={autoNext}
//               onChange={(e) => setAutoNext(!autoNext)}
//             >
//               Tự động chuyển bài
//               {autoNext ? (
//                 <IoCheckmarkCircleOutline className="learn-auto-next-control-icon" />
//               ) : (
//                 <IoCloseCircleOutline className="learn-auto-next-control-icon" />
//               )}
//             </Toggle>
//           </div>
//           <div className="learn-content-control-right">
//             {/* <button
//               className="learn-content-control-btn"
//               onClick={() => {
//                 if (fullscreen) handle.exit();
//                 else handle.enter();
//                 setFullscreen(!fullscreen);
//               }}
//             >
//               {isFullscreenEnabled ? <IoContract /> : <IoExpand />}
//             </button> */}
//           </div>
//         </div>
//         {autoNext && !props.isLast && timeLeft !== null && timeLeft <= 5 ? (
//           <div className="learn-next-lecture">
//             <div className="learn-next-lecture-count">{timeLeft}</div>
//             <div className="learn-next-lecture-right">
//               <div>
//                 <div className="learn-next-lecture-header">Next</div>
//                 <button
//                   className="learn-next-lecture-cancel"
//                   onClick={() => {
//                     setAutoNext(false);
//                   }}
//                 >
//                   <IoClose />
//                 </button>
//               </div>
//               <div className="learn-next-lecture-name">
//                 {props.nextLectureName}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <></>
//         )}
//       </div>
//       {/* </FullScreen> */}
//     </div>
//   );
// }

class MainContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fullscreen: false,
      autoNext: true,
      timeLeft: 100,
      updateView: false,
    };
    this.uploadingRef = React.createRef(false);
    this.playerChild = React.createRef();
  }

  countView = async () => {
    if (!this.state.updateView && !this.uploadingRef.current) {
      this.uploadingRef.current = true;
      let lectureId = this.props.lecture.lecture.id;
      const path = lecturePath + lectureId;

      API.put(apiName, path, { body: {} })
        .then((response) => {
          console.log("count view done");
          this.setState({ updateView: true });
          this.uploadingRef.current = false;
          this.props.countViewForCourse();
        })
        .catch((error) => {
          this.uploadingRef.current = false;
          console.log(error);
        });
    }
  };

  static getDerivedStateFromProps(props, state) {
    if (props.lecture !== state.prevPropsLecture) {
      return {
        prevPropsLecture: props.lecture,
        updateView: false,
      };
    }
  }

  changeVideoTime = (startTime) => {
    this.playerChild.current.changeVideoTime(startTime);
  };

  render() {
    const t = this.props.t;
    return (
      <div className="fullscreen">
        <div
          className={
            this.state.fullscreen
              ? "learn-content-parent full-screen"
              : "learn-content-parent"
          }
        >
          <div className="learn-content-main">
            {this.props.loading ? (
              <ContentLoading />
            ) : (
              <LectureContent
                ref={this.playerChild}
                lecture={this.props.lecture}
                openLink={(url) => {
                  this.setState({ fullscreen: false });
                  window.open(url, "_blank").focus();
                }}
                setTimeLeft={(timeLeft) => {
                  this.setState({ timeLeft: timeLeft });
                }}
                handleFullScreen={() => {
                  // if (fullscreen) handle.exit();
                  // else handle.enter();
                  // setFullscreen(!fullscreen);
                }}
                handleVideoEnded={() => {
                  this.props.markLectureCompleted();
                  if (this.state.autoNext && !this.props.isLast) {
                    this.setState({ timeLeft: 100 });
                    this.props.nextLecture();
                  }
                }}
                nextLecture={this.props.nextLecture}
                markLectureCompleted={this.props.markLectureCompleted}
                setQuestionLength={this.props.setQuestionLength}
                countView={this.countView}
                isLast={this.props.isLast}
                setCurrentVideoTime={this.props.setCurrentVideoTime}
                t={this.props.t}
              />
            )}
          </div>
          <div className="learn-content-control">
            <div className="learn-content-control-left">
              {this.props.isFirst ? (
                <button
                  className="learn-content-control-btn content-control-btn-disabled"
                  disabled
                >
                  <IoChevronBack />
                </button>
              ) : (
                <button
                  className="learn-content-control-btn"
                  onClick={this.props.prevLecture}
                >
                  <IoChevronBack />
                </button>
              )}
              {this.props.isLast ? (
                <button
                  className="learn-content-control-btn content-control-btn-disabled"
                  disabled
                >
                  <IoChevronForward />
                </button>
              ) : (
                <button
                  className="learn-content-control-btn"
                  onClick={this.props.nextLecture}
                >
                  <IoChevronForward />
                </button>
              )}
              <Toggle
                Todo
                className="learn-auto-next-control"
                id="toggle-check"
                type="checkbox"
                variant="outline-secondary"
                checked={this.state.autoNext}
                onChange={(e) =>
                  this.setState({ autoNext: !this.state.autoNext })
                }
              >
                {t("learn.autoNext")}
                {this.state.autoNext ? (
                  <IoCheckmarkCircleOutline className="learn-auto-next-control-icon" />
                ) : (
                  <IoCloseCircleOutline className="learn-auto-next-control-icon" />
                )}
              </Toggle>
            </div>
            <div className="learn-content-control-right"></div>
          </div>
          {this.state.autoNext &&
          !this.props.isLast &&
          this.state.timeLeft !== null &&
          this.state.timeLeft <= 5 ? (
            <div className="learn-next-lecture">
              <div className="learn-next-lecture-count">
                {this.state.timeLeft}
              </div>
              <div className="learn-next-lecture-right">
                <div>
                  <div className="learn-next-lecture-header">Next</div>
                  <button
                    className="learn-next-lecture-cancel"
                    onClick={() => {
                      this.setState({ autoNext: false });
                    }}
                  >
                    <IoClose />
                  </button>
                </div>
                <div className="learn-next-lecture-name">
                  {this.props.nextLectureName}
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  }
}

class Learn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: null,
      loading: true,
      course: null,
      lecture: {
        chapterId: 0,
        lectureId: 0,
        lecture: null,
        transcript: null,
      },
      questionsLength: 0,
      nextLectureName: "",
      completedLectures: [],
      currentVideoTime: 0,
      uiSet: null,
    };
    this.playerChild = React.createRef();
    this.wordElement = React.createRef();
    this.transcriptRef = React.createRef();
  }

  getHashParams() {
    return {
      course: window.location.hash.split("/")[2],
      lecture: window.location.hash.split("/")[4],
    };
  }

  setHashParams(course, lecture) {
    if (!lecture) window.location.hash = "/learn/" + course;
    else window.location.hash = "/learn/" + course + "/lecture/" + lecture;
  }

  setLocalStorage(course, lecture) {
    if (!!course) localStorage.setItem("AWSLIBVN_COURSE", course);
    if (!!course && !!lecture)
      localStorage.setItem("AWSLIBVN_LECTURE" + course, lecture);
  }

  getLocalStorage(course) {
    if (!course) course = localStorage.getItem("AWSLIBVN_COURSE");
    return {
      course: course,
      lecture: localStorage.getItem("AWSLIBVN_LECTURE" + course),
    };
  }

  loadLectureById(lectureId) {
    this.state.course.chapters.forEach((chapter, chapterIndex) => {
      chapter.lectures.forEach((lecture, lectureIndex) => {
        if (lecture.lectureId === lectureId) {
          this.loadLecture(chapterIndex, lectureIndex);
        }
      });
    });
  }

  loadLecture(chapterIndex, lectureIndex) {
    let lectureId =
      this.state.course.chapters[chapterIndex].lectures[lectureIndex].lectureId;
    const path = lecturePath + lectureId;
    const init = {};

    this.setState({ loading: true });

    API.get(apiName, path, init)
      .then((response) => {
        this.setState(
          {
            lecture: {
              chapterId: chapterIndex,
              lectureId: lectureIndex,
              lecture: {
                id: response.ID,
                content: response.Content,
                youtubeVideoSrc: response.YoutubeVideoURL,
                desc: response.Desc,
                name: response.Name,
                type: response.Type,
                viewed: response.Viewed,
                questions: response.Questions,
                workshopUrl: response.WorkshopUrl,
                workshopDesc: response.WorkshopDescription,
                referDocs: response.ReferDocs,
                referUrl: response.ReferUrl,
                transcript: response.Transcription,
              },
            },
            loading: false,
            nextLectureName: this.getNextLectureName(
              chapterIndex,
              lectureIndex
            ),
          },
          () => {
            let hashParams = this.getHashParams();
            this.setHashParams(hashParams.course, response.ID);
            this.setLocalStorage(hashParams.course, response.ID);

            if (
              this.state.lecture.lecture.type === "lab" ||
              this.state.lecture.lecture.type === "survey" ||
              this.state.lecture.lecture.type === "document"
            ) {
              this.markLectureCompleted(this.state.lecture.lecture.id);
            }
            this.loadTranscript();
          }
        );
      })
      .catch((error) => {
        console.log(error);
        this.setState({ loading: false });
      });
  }

  loadCourse() {
    let hashParams = this.getHashParams();

    let course = hashParams.course;
    let lecture = hashParams.lecture;
    if (!course) {
      let localParams = this.getLocalStorage();
      course = localParams.course;
      lecture = localParams.lecture;
    } else if (!lecture) {
      let localParams = this.getLocalStorage(course);
      lecture = localParams.lecture;
    }

    if (!course && !DEBUG) {
      window.location.href = landingPageUrl;
    }

    const path = coursePath + course;
    const init = {};

    API.get(apiName, path, init)
      .then((response) => {
        let course = {
          id: response.ID,
          name: response.Name,
          categories: response.Categories,
          tags: response.Tags,
          level: response.Level,
          length: response.Length,
          description: response.Description,
          whatToLearn: response.WhatToLearn,
          requirements: response.Requirements,
          chapters: response.Chapters,
          totalLecture: 0,
        };

        let chapters = course.chapters;
        let firstLectureIndex = 0;
        let hashChapterIndex = -1;
        let hashLectureIndex = -1;
        while (chapters[0].lectures[firstLectureIndex].type === "section")
          firstLectureIndex++;

        for (let i = 0; i < chapters.length; i++) {
          chapters[i].length = 0;
          chapters[i].lectures[0].realIndex = 0;

          if (chapters[i].lectures[0].type !== "section")
            chapters[i].length += chapters[i].lectures[0].length;

          for (let j = 1; j < chapters[i].lectures.length; j++) {
            if (chapters[i].lectures[j - 1].type === "section") {
              chapters[i].lectures[j].realIndex =
                chapters[i].lectures[j - 1].realIndex;
            } else {
              chapters[i].lectures[j].realIndex =
                chapters[i].lectures[j - 1].realIndex + 1;
            }

            if (chapters[i].lectures[j].type !== "section") {
              chapters[i].length += chapters[i].lectures[j].length;
            }
          }
        }

        chapters.forEach((chapter) => {
          chapter.lectures.forEach(
            (lecture) => (course.totalLecture += lecture.type !== "section")
          );
        });

        if (!!lecture)
          for (let i = 0; i < chapters.length; i++) {
            for (let j = 0; j < chapters[i].lectures.length; j++) {
              if (chapters[i].lectures[j].lectureId === lecture) {
                hashChapterIndex = i;
                hashLectureIndex = j;
              }
            }
          }

        this.setState(
          {
            course: {
              id: course.id,
              name: course.name,
              chapters: chapters,
              firstLectureIndex: firstLectureIndex,
              totalLecture: course.totalLecture,
            },
          },
          () => {
            this.loadUserLecture();
            if (hashLectureIndex === -1) this.loadLecture(0, firstLectureIndex);
            else this.loadLecture(hashChapterIndex, hashLectureIndex);
          }
        );
      })
      .catch((error) => {
        console.log(error);
        if (!DEBUG) window.location.href = landingPageUrl;
      });
  }

  loadUserCourse() {
    let hashParams = this.getHashParams();
    let course = hashParams.course;

    API.get(apiName, userCoursePath + course)
      .then((response) => {
        console.log(response);
        if (response.length === 0) {
          const myInit = {
            body: {
              LastAccessed: new Date().getTime(),
              CourseID: course,
              Status: "IN_PROGRESS",
            },
          };

          API.put(apiName, userCoursePath, myInit)
            .then((response) => {})
            .catch((error) => {
              console.log(error.response);
            });
        } else {
          const updateBody = {
            body: { LastAccessed: new Date().getTime() },
          };

          API.put(apiName, userCourseUpdatePath + course, updateBody)
            .then((response) => {})
            .catch((error) => {
              console.log(error.response);
            });
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  loadUserLecture() {
    const path = userLecturePath + this.state.userId;

    API.get(apiName, path)
      .then((response) => {
        let completedLectures = [];
        response.forEach((userLecture) => {
          this.state.course.chapters.forEach((chapter) => {
            if (
              chapter.lectures.filter(
                (lecture) => lecture.lectureId === userLecture.LectureID
              ).length > 0
            ) {
              completedLectures.push(userLecture.LectureID);
            }
          });
        });
        this.setState({
          completedLectures: completedLectures,
        });
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  prevLecture() {
    let chapterId = this.state.lecture.chapterId;
    let lectureId = this.state.lecture.lectureId;

    lectureId--;
    if (lectureId < 0) {
      chapterId--;
      lectureId = this.state.course.chapters[chapterId].lectures.length - 1;
    }

    while (
      this.state.course.chapters[chapterId].lectures[lectureId].type ===
      "section"
    ) {
      lectureId--;
      if (lectureId < 0) {
        chapterId--;
        lectureId = this.state.course.chapters[chapterId].lectures.length - 1;
      }
    }

    this.loadLecture(chapterId, lectureId);
  }

  nextLecture() {
    let chapterId = this.state.lecture.chapterId;
    let lectureId = this.state.lecture.lectureId;
    let isLastLesson = false;

    lectureId++;
    if (lectureId === this.state.course.chapters[chapterId].lectures.length) {
      if (chapterId < this.state.course.chapters.length - 1) {
        chapterId++;
        lectureId = 0;
      } else {
        return;
      }
    }

    while (
      this.state.course.chapters[chapterId].lectures[lectureId].type ===
      "section"
    ) {
      lectureId++;
      if (lectureId === this.state.course.chapters[chapterId].lectures.length) {
        chapterId++;
        lectureId = 0;
      }
    }

    this.loadLecture(chapterId, lectureId);
  }

  getNextLectureName(chapterId, lectureId) {
    lectureId++;
    if (lectureId === this.state.course.chapters[chapterId].lectures.length) {
      chapterId++;
      lectureId = 0;
    }

    while (
      chapterId < this.state.course.chapters.length &&
      this.state.course.chapters[chapterId].lectures[lectureId].type ===
        "section"
    ) {
      lectureId++;
      if (lectureId === this.state.course.chapters[chapterId].lectures.length) {
        chapterId++;
        lectureId = 0;
      }
    }

    return chapterId < this.state.course.chapters.length &&
      lectureId < this.state.course.chapters[chapterId].lectures.length
      ? this.state.course.chapters[chapterId].lectures[lectureId].name
      : "";
  }

  async markLectureCompleted(lectureId) {
    if (!this.state.completedLectures.includes(lectureId)) {
      this.setState((prevState) => {
        if (!prevState.completedLectures.includes(lectureId))
          prevState.completedLectures.push(lectureId);

        const myInit = {
          body: {
            UserID: this.state.userId,
            LectureID: lectureId,
            Status: "COMPLETED",
          },
        };

        API.put(apiName, userLecturePath, myInit)
          .then((response) => {
            // console.log(response);
          })
          .catch((error) => {
            console.log(error.response);
          });
        return prevState;
      });
    }
  }

  async ionViewCanEnter() {
    try {
      await Auth.currentAuthenticatedUser({ bypassCache: false });
      this.setState({
        loggedIn: true,
      });
    } catch {
      this.setState({
        loggedIn: false,
      });
    }
  }

  async loadUserId(callback) {
    let credentials = await Auth.currentUserCredentials();
    this.setState(
      {
        userId: credentials.identityId,
      },
      callback
    );
  }

  componentDidMount() {
    getUISet().then((data) => {
      this.setState({ uiSet: data });
    });
    this.ionViewCanEnter();
    this.loadUserId(() => this.loadCourse());
    // this.loadCourse();
    this.loadUserCourse();
  }

  formatTime(timeInSecond) {
    let minute = Math.floor(timeInSecond / 60);
    let second = timeInSecond % 60;

    if (minute < 10) minute = "0" + minute;
    if (second < 10) second = "0" + second;

    return minute + ":" + second;
  }

  setQuestionLength = (length) => {
    let newLecture = {
      ...this.state.lecture,
      lecture: { ...this.state.lecture.lecture, length: length },
    };
    this.setState({ lecture: newLecture });
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.lecture !== nextState.lecture) {
      this.ionViewCanEnter();
    }
    return true;
  }

  countViewForCourse = () => {
    let courseId = this.state.course.id;
    const path = coursePath + courseId;

    API.put(apiName, path, { body: {} })
      .then((response) => {
        console.log("count view done");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  downloadReferDoc = async (event, name) => {
    const signedURL = await Storage.get(name, { level: "public" });
    const link = document.createElement("a");
    link.href = signedURL;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  changeVideoTime = (startTime) => {
    this.playerChild.current.changeVideoTime(startTime);
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.currentVideoTime !== prevState.currentVideoTime) {
      if (this.wordElement.current) {
        // if (
        //   this.wordElement.current.offsetTop >
        //   document.getElementsByTagName("aside")[0].offsetHeight
        // ) {
        //   document.getElementsByTagName("aside")[0].scrollTop =
        //     this.wordElement.current.offsetTop;
        // }
      }
    }
  }

  loadTranscript = () => {
    let i = 0;
    let trancriptElement = [];
    console.log("load transcript");
    if ( this.state.lecture.lecture.transcript ){
      Storage.get(this.state.lecture.lecture.transcript, {
        level: "public",
      }).then((data) => {
        console.log(data);
        fetch(data)
          .then((response) => response.json())
          .then((json) => {
            console.log(json);
            if (json) {
              while (i < json.results.items.length - 1) {
                let item = JSON.parse(JSON.stringify(json.results.items[i]));
                let content = "";
                if (
                  item.alternatives[0].content === "," ||
                  item.alternatives[0].content === "."
                ) {
                  trancriptElement.push(item);
                  i += 1;
                  continue;
                }
  
                if (
                  json.results.items[i + 1].alternatives[0].content === "," ||
                  json.results.items[i + 1].alternatives[0].content === "."
                ) {
                  trancriptElement.push(item);
                  trancriptElement.push(
                    JSON.parse(JSON.stringify(json.results.items[i + 1]))
                  );
                } else {
                  content = item.alternatives[0].content.concat(
                    " ",
                    json.results.items[i + 1].alternatives[0].content
                  );
                  item.alternatives[0].content = content;
                  item.end_time = json.results.items[i + 1].end_time
                    ? json.results.items[i + 1].end_time
                    : item.end_time;
                  trancriptElement.push(item);
                }
                i += 2;
              }
            }
            this.setState({
              lecture: {
                ...this.state.lecture,
                transcript: trancriptElement,
              },
            });
            // console.log("1808", this.transcriptRef.current)
          })
          .catch((err) => console.error(err));
      });
    }
  };

  setCurrentVideoTime = (time) => {
    this.setState({ currentVideoTime: time });
  };

  render() {
    const { t } = this.props;
    return this.state.loggedIn === false ? (
      <Navigate
        to="/auth"
        state={{ path: "/learn/" + `${window.location.hash.split("/")[2]}` }}
      />
    ) : (
      <div>
        <NavBar
          navigation={this.props.navigation}
          title="Cloud Solutions Journey"
          uiSet={this.state.uiSet}
        />
        <AppLayout
          headerSelector="#h"
          navigationWidth="350"
          navigation={
            <SideNavigation
              activeHref={
                !this.state.lecture || !this.state.lecture.lecture
                  ? ""
                  : this.state.lecture.lecture.id
              }
              header={{
                text: !this.state.course ? "" : this.state.course.name,
              }}
              onFollow={(event) => {
                if (!event.detail.external) {
                  event.preventDefault();
                  if (!!event.detail.href) {
                    if (event.detail.href === "#certificate") {
                      window.open(
                        "/#/cert/" + window.location.hash.split("/")[2],
                        "_blank"
                      );
                    } else {
                      this.loadLectureById(event.detail.href);
                    }
                  }
                }
              }}
              items={
                !this.state.course || !this.state.course.chapters
                  ? []
                  : [
                      {
                        type: "link",
                        href:
                          this.state.completedLectures.length /
                            this.state.course.totalLecture >=
                          0.8
                            ? "#certificate"
                            : "",
                        text:
                          this.state.completedLectures.length /
                            this.state.course.totalLecture >=
                          0.8 ? (
                            <span className="learn-navigation-progress-completed">
                              {t("learn.completeLesson")}{" "}
                              {this.state.completedLectures.length}{" "}
                              {t("learn.outOf")}{" "}
                              {this.state.course.totalLecture}{" "}
                              {t("learn.lectures")} <IoCheckmarkSharp />
                            </span>
                          ) : (
                            <span className="learn-navigation-progress" style={{color: `${this.state.uiSet?.HoverColor}`}}>
                              {t("learn.completeLesson")}{" "}
                              {this.state.completedLectures.length}{" "}
                              {t("learn.outOf")}{" "}
                              {this.state.course.totalLecture}{" "}
                              {t("learn.lectures")}
                            </span>
                          ),
                      },
                    ].concat(
                      this.state.course.chapters.map((chapter) => {
                        let chapterToRender = {
                          type: "section",
                          text: (
                            <div className="learn-navigation-chapter">
                              <div style={{ width: "70%" }}>
                                {chapter.name}{" "}
                              </div>
                              <div className="learn-chapter-time">
                                {chapter.length > 0 ? (
                                  <>
                                    <IoTimeOutline />
                                    {this.formatTime(chapter.length)}
                                  </>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          ),
                          defaultExpanded:
                            !!this.state.lecture &&
                            !!this.state.lecture.lecture &&
                            chapter.lectures.filter(
                              (lecture) =>
                                lecture.lectureId ===
                                this.state.lecture.lecture.id
                            ).length > 0,
                          items: chapter.lectures.map((lecture) => {
                            return {
                              type: "link",
                              text:
                                lecture.type === "section" ? (
                                  <div className="text-bold">
                                    {" "}
                                    {lecture.name.toUpperCase()}{" "}
                                  </div>
                                ) : (
                                  <div className="learn-navigation-lecture">
                                    <div style={{ width: "80%" }}>
                                      {this.state.completedLectures.includes(
                                        lecture.lectureId
                                      ) ? (
                                        <IoEllipseSharp />
                                      ) : (
                                        <IoEllipseSharp
                                          style={{ visibility: "hidden" }}
                                        />
                                      )}
                                      {lecture.name}{" "}
                                    </div>
                                    <span className="learn-navigation-badge">
                                      {lecture.length > 0
                                        ? this.formatTime(lecture.length)
                                        : ""}
                                    </span>
                                  </div>
                                ),
                              href: lecture.lectureId,
                              // info:
                              //   lecture.type === "section" ? (
                              //     ""
                              //   ) : this.state.completedLectures.includes(
                              //       lecture.lectureId
                              //     ) ? (
                              //     <span className="learn-navigation-badge">
                              //       <IoEllipseSharp />
                              //       {lecture.length > 0 ? this.formatTime(lecture.length) : ""}
                              //     </span>
                              //   ) : (
                              //     <span className="learn-navigation-badge">
                              //       {lecture.length > 0 ? this.formatTime(lecture.length) : ""}
                              //     </span>
                              //   ),
                            };
                          }),
                        };
                        return chapterToRender;
                      })
                    )
              }
            />
          }
          breadcrumbs={
            <BreadcrumbGroup
              items={[
                {
                  text: t("breadcrumbs.mylearning"),
                  href: "#/mylearning",
                },
                {
                  text: !this.state.course ? "" : this.state.course.name,
                },
              ]}
              ariaLabel="Breadcrumbs"
            />
          }
          tools={
            <HelpPanel header={<h2>{t("learn.more")}</h2>}>
              {/* <Tabs
                tabs={[
                  {
                    label: "References",
                    id: "refer",
                    content: (
                      <div>
                        <h4>{t("learn.document")}</h4>
                        <ul>
                          {this.state.lecture.lecture ? (
                            this.state.lecture.lecture.referDocs.map((item) => {
                              return (
                                <li
                                  onClick={(e) =>
                                    this.downloadReferDoc(e, item)
                                  }
                                >
                                  {item.split("-")[2]}
                                </li>
                              );
                            })
                          ) : (
                            <></>
                          )}
                        </ul>

                        <h4>{t("learn.docURL")}</h4>
                        <ul>
                          {this.state.lecture.lecture ? (
                            this.state.lecture.lecture.referUrl.map((item) => {
                              return (
                                <li>
                                  <a href={item}>{item}</a>
                                </li>
                              );
                            })
                          ) : (
                            <></>
                          )}
                        </ul>
                      </div>
                    ),
                  },
                  {
                    label: "Transcription",
                    id: "transcript",
                    content: (
                      <>
                        <span className="transcript">
                          {this.state.lecture.transcript
                            ? this.state.lecture.transcript.map(
                                (item, index) => {
                                  return (
                                    <div
                                      ref={
                                        this.state.currentVideoTime >=
                                          item.start_time &&
                                        this.state.currentVideoTime <=
                                          item.end_time
                                          ? this.wordElement
                                          : null
                                      }
                                      key={index}
                                      className="trans-word"
                                      onClick={(e) =>
                                        this.changeVideoTime(item.start_time)
                                      }
                                    >
                                      <span
                                        className={
                                          this.state.currentVideoTime >=
                                            item.start_time &&
                                          this.state.currentVideoTime <=
                                            item.end_time
                                            ? "bg-yellow-500"
                                            : ""
                                        }
                                      >
                                        {item.alternatives[0].content === "," ||
                                        item.alternatives[0].content === "."
                                          ? item.alternatives[0].content
                                          : " " + item.alternatives[0].content}
                                      </span>
                                    </div>
                                  );
                                }
                              )
                            : ""}
                        </span>
                      </>
                    ),
                  },
                  {
                    label: "Third tab label",
                    id: "third",
                    content: "Third tab content area",
                    disabled: true,
                  },
                ]}
              /> */}
              <div>
                <h4>{t("learn.document")}</h4>
                <ul>
                  {this.state.lecture.lecture ? (
                    this.state.lecture.lecture.referDocs.map((item) => {
                      return (
                        <li onClick={(e) => this.downloadReferDoc(e, item)}>
                          {item.split("-")[2]}
                        </li>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </ul>

                <h4>{t("learn.docURL")}</h4>
                <ul>
                  {this.state.lecture.lecture ? (
                    this.state.lecture.lecture.referUrl.map((item) => {
                      return (
                        <li>
                          <a href={item}>{item}</a>
                        </li>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </ul>
              </div>
            </HelpPanel>
          }
          content={
            !this.state.course ? (
              <LoadingContainer />
            ) : (
              <div fluid="true" className="learn-parent-container">
                <PageMetadata courseName={this.state.course.name} />

                <div className="learn-video-player-container">
                  <div className="learn-board">
                    <div className="learn-board-header">
                      {!this.state.lecture.lecture ? (
                        ""
                      ) : (
                        <div>
                          {this.state.lecture.lecture.name}
                          <span className="learn-quiz-length">
                            {this.state.lecture.lecture.type === "quiz"
                              ? " (" +
                                this.state.lecture.lecture.length +
                                " questions)"
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="learn-board-content">
                      <MainContent
                        t={t}
                        ref={this.playerChild}
                        loading={this.state.loading}
                        lecture={this.state.lecture}
                        nextLectureName={this.state.nextLectureName}
                        isFirst={
                          this.state.lecture.chapterId === 0 &&
                          this.state.course.chapters[
                            this.state.lecture.chapterId
                          ].lectures[this.state.lecture.lectureId].realIndex ===
                            0
                        }
                        isLast={
                          this.state.lecture.chapterId ===
                            this.state.course.chapters.length - 1 &&
                          this.state.lecture.lectureId ===
                            this.state.course.chapters[
                              this.state.lecture.chapterId
                            ].lectures.length -
                              1
                        }
                        markLectureCompleted={() => {
                          this.markLectureCompleted(
                            this.state.lecture.lecture.id
                          );
                        }}
                        prevLecture={() => {
                          this.prevLecture();
                        }}
                        nextLecture={() => {
                          this.nextLecture();
                        }}
                        setQuestionLength={this.setQuestionLength}
                        countViewForCourse={this.countViewForCourse}
                        setCurrentVideoTime={this.setCurrentVideoTime}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          disableContentPaddings={true}
        />
      </div>
    );
  }
}

export default withTranslation()(Learn)
