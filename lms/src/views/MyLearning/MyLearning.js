import './MyLearning.css';
import React from 'react';
import { API } from 'aws-amplify';
import NavBar from '../../components/NavBar/NavBar';

import Footer from '../../components/Footer/Footer';
import MyLearningCourse from './MyLearningCourse';

import loadingGif from '../../assets/images/loading.gif';
import { apiName, myLearningPath } from "../../utils/api";
import { withTranslation } from "react-i18next";
import { getUISet } from "../../utils/tools";

class MyLearning extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            loading: false,
            courseToRedirect: null,
            mostRecentCourse: null,
            assignedCourses: [],
            selfEnrolledCourses: [],
            uiSet: {},
        };
    }

    componentDidMount() {
        this.loadUserCourses();

        getUISet().then((data) => {
            this.setState({ uiSet: data, loading: false });
          }).catch(() => this.setState({ loading: false }));
    }

    loadUserCourses() {
        this.setState({ loading: true });
        API.get(apiName, myLearningPath)
            .then((response) => {
                let mostRecentCourse;
                let assignedCourses = [];
                let selfEnrolledCourses = [];
                console.log(response)
                response.forEach(course => {
                    let transformedCourse = {
                        id: course.CourseID,
                        lastAccessed: course.LastAccessed,
                        assigned: course.Assign,
                    }

                    if (!!transformedCourse.assigned) {
                        assignedCourses.push(transformedCourse.id);
                    } else {
                        selfEnrolledCourses.push(transformedCourse.id);
                    }

                    if (!!transformedCourse.lastAccessed) {
                        if (!mostRecentCourse || mostRecentCourse.lastAccessed < transformedCourse.lastAccessed) {
                            mostRecentCourse = transformedCourse;
                        }
                    }
                });
                this.setState({
                    mostRecentCourse: mostRecentCourse.id,
                    assignedCourses: assignedCourses,
                    selfEnrolledCourses: selfEnrolledCourses,
                    // loading: false,
                });
            })
            .catch((error) => {
                console.log(error.response);
                // this.setState({ loading: false });
            });
    }

    render() {
        const { t } = this.props;
        return <div>
            <NavBar navigation={this.props.navigation} href="/mylearning"/>
            <div className='mylearning-wrapper'>
                {this.state.loading 
                    ? <div className='mylearning-main-container-loading'>
                        <img src={loadingGif} alt="loading..." className='mylearning-loading-gif-parent' />
                    </div> 
                    : <div className='mylearning-main-container'>
                        {!this.state.mostRecentCourse ? "" : <div>
                            <p className='mylearning-courses-header'>{t("mylearning.recent")}</p>
                            <div className='mylearning-courses-header-decor' style={{borderTop: `solid 3px ${this.state.uiSet?.MainColor || "#EC7211"}`}}/>
                            <MyLearningCourse courseId={this.state.mostRecentCourse} uiSet={this.state.uiSet}/>
                        </div>}
                        <div>
                            <p className='mylearning-courses-header'>{t("mylearning.assign")}</p>
                            <div className='mylearning-courses-header-decor' style={{borderTop: `solid 3px ${this.state.uiSet?.MainColor || "#EC7211"}`}}/>
                            {this.state.assignedCourses.length === 0
                                ? <div>{t("mylearning.notice")}</div>
                                : this.state.assignedCourses.map((course, index) => <MyLearningCourse key={index} courseId={course} uiSet={this.state.uiSet}/>)
                            }
                        </div>
                        <div>
                            <p className='mylearning-courses-header'>{t("mylearning.self_enroll")}</p>
                            <div className='mylearning-courses-header-decor' style={{borderTop: `solid 3px ${this.state.uiSet?.MainColor || "#EC7211"}`}}/>
                            {console.log(this.state.selfEnrolledCourses)}
                            {this.state.selfEnrolledCourses.length === 0
                                ? <div>
                                    {t("mylearning.notice")}
                                    <div className='space-40'/>
                                </div>
                                : this.state.selfEnrolledCourses.map((course, index) => <MyLearningCourse key={index} courseId={course} uiSet={this.state.uiSet}/>)
                            }
                        </div>
                    </div>}
            </div>
            <Footer />
        </div>;
    }
}

export default withTranslation()(MyLearning)