import React from 'react';
import { API, Auth } from 'aws-amplify';
import { Navigate } from "react-router-dom";
import { Button, Icon, ProgressBar } from '@cloudscape-design/components';

import loadingGif from '../../assets/images/loading.gif';
import courseDefaultThumbnail from '../../assets/images/course-default-thumbnail.png';
import { calcTime, calcTimeBrief } from "../../utils/tools"
import { withTranslation } from "react-i18next";

class MyLearningCourse extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            redirectToLearn: false,
            redirectToCert: false,
            allCompletedLectures: null,
            completedLectures: null,
            totalLectures: null,
            course: null,
            loading: true,
        };
    }

    loadCourse() {
        // console.log(this.props.courseId)
        const apiName = 'courses';
        const path = '/courses/' + this.props.courseId;
        this.setState({ loading: true })
        API.get(apiName, path)
            .then((response) => {
                let totalLectures = 0;
                response.Chapters.forEach(chapter => totalLectures += chapter.lectures.filter(lecture => lecture.type !== 'section').length);
                this.setState({
                    course: {
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
                    },
                    totalLectures: totalLectures,
                    loading: false,
                }, () => {
                    if (!!this.state.allCompletedLectures)
                        this.calculateProgress();
                });
            })
            .catch((error) => {
                console.log(error);
                this.setState({ loading: false })
            });
    }
    
    async loadUserId(callback) {
        let credentials = await Auth.currentUserCredentials();
        console.log(credentials.identityId)
        this.setState({
            userId: credentials.identityId,
        }, callback)
    }
  
    loadUserLecture() {
        const apiName = 'courses';
        const path = '/users/lectures/' + this.state.userId;
        
        API.get(apiName, path)
            .then((response) => {
                this.setState({
                    allCompletedLectures: response.map(lecture => lecture.LectureID)
                }, () => {
                    if (!!this.state.course)
                        this.calculateProgress();
                });
            })
            .catch((error) => {
                console.log(error.response);
            });
    }

    calculateProgress() {
        let completedLectures = 0;
        this.state.course.chapters.forEach(chapter => {
            completedLectures += chapter.lectures.filter(lecture => this.state.allCompletedLectures.includes(lecture.lectureId)).length;
        })
        this.setState({completedLectures: completedLectures});
    }

    componentDidMount() {
        this.loadCourse();
        this.loadUserId(() => this.loadUserLecture());
    }

    render() {
        let course = this.state.course;
        // const t = this.props.t;
        const { t } = this.props;
        return !!this.state.redirectToCert ? (
          <Navigate to={"/cert/" + course.id} />
        ) : !!this.state.redirectToLearn ? (
          <Navigate to={"/learn/" + course.id} />
        ) : !course ? (
          <div>
            {this.state.loading ? (
              <img
                src={loadingGif}
                alt="loading..."
                className="mylearning-loading-gif"
              />
            ) : (
              <></>
            )}
          </div>
        ) : (
          <div className="mylearning-course">
            <div className="mylearning-course-info">
              <div className="mylearning-course-title">
                {!!course.name ? course.name : ""}
              </div>
              <div className="mylearning-course-property">
                <Icon
                  variant="subtle"
                  name="ticket"
                  className="mylearning-course-property-icon"
                />{" "}
                {t("common.level")} {!!course.level ? course.level : ""}
              </div>
              <div className="mylearning-course-property">
                <Icon
                  variant="subtle"
                  name="check"
                  className="mylearning-course-property-icon"
                />
                {t("common.category")}
                {!!course.categories
                  ? course.categories.map((category, index) => (
                      <span key={index}>
                        {index !== 0 ? ", " : " "}
                        <a href="/#">{category}</a>
                      </span>
                    ))
                  : ""}
              </div>
              <div className="mylearning-course-property">
                <Icon
                  variant="subtle"
                  name="check"
                  className="mylearning-course-property-icon"
                />
                {t("common.tag")}
                {!!course.tags
                  ? course.tags.map((tag, index) => (
                      <span key={index}>
                        {index !== 0 ? ", " : " "}
                        <a href="/#">{tag}</a>
                      </span>
                    ))
                  : ""}
              </div>
              <div className="mylearning-course-property">
                <Icon
                  variant="subtle"
                  name="status-pending"
                  className="mylearning-course-property-icon"
                />
                {calcTimeBrief(course.length, t("common.hour"), t("common.minute"))}
              </div>
              <div className="mylearning-course-desc">
                {!!course.description ? course.description : ""}
              </div>
            </div>
            <div className="mylearning-course-thumbnail">
              <img src={courseDefaultThumbnail} alt="Course Thumbnail" />
            </div>
            <div className="mylearning-course-separator" />
            <div className="mylearning-progress">
              {this.state.completedLectures != null &&
              !!this.state.totalLectures ? (
                <ProgressBar
                  value={
                    (this.state.completedLectures / this.state.totalLectures) *
                    100
                  }
                />
              ) : (
                <img
                  src={loadingGif}
                  alt="loading..."
                  className="mylearning-loading-gif"
                />
              )}
            </div>
            <div className="mylearning-course-action">
              {this.state.completedLectures / this.state.totalLectures >=
              0.8 ? (
                <Button
                  onClick={() => this.setState({ redirectToCert: course.id })}
                >
                  {t("mylearning.cert")} <Icon name="file" />
                </Button>
              ) : (
                ""
              )}
              {/* <Button
                variant="primary"
                className="btn-orange mylearning-continue-btn"
                onClick={() => this.setState({ redirectToLearn: course.id })}
              >
                Continue <Icon name="arrow-left" className="rotate-180" />
              </Button> */}
              <button
                variant="primary"
                className="btn-normal"
                style={{
                  background: `${this.props.uiSet?.MainColor}`,
                  borderColor: `${this.props.uiSet?.MainColor}`,
                  color: `${this.props.uiSet?.TextColor}`,
                }}
                onClick={() => this.setState({ redirectToLearn: true})}
              >
                <span>
                  {t("mylearning.continue")} <Icon name="arrow-left" className="rotate-180" />
                </span>
              </button>
            </div>
          </div>
        );
    };
}

export default withTranslation()(MyLearningCourse)