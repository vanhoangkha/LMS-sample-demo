import React from 'react';
import './Course.css';
import { Navigate } from "react-router-dom";
import { API } from 'aws-amplify';
import { withTranslation } from "react-i18next";
import { Grid, Button, Icon, ExpandableSection } from '@cloudscape-design/components';
import courseDefaultThumbnail from '../../assets/images/course-default-thumbnail.png';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
import loadingGif from '../../assets/images/loading.gif';
import { calcTimeBrief, getUISet } from "../../utils/tools";

class Course extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            course: null,
            redirectToLearn: false,
            loading: true,
            uiSet: null,
        };
    }

    async getCourse() {
        this.setState({ loading: true });

        const apiName = 'courses';
        const path = '/courses/' + window.location.hash.split('/')[2];
        
        API.get(apiName, path)
        .then((response) => {
            this.setState({course: {
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
            },
            loading: false});
        })
        .catch((error) => {
            console.log(error.response);
            this.setState({ loading: false });
        });
    }

    componentDidMount() {
        getUISet().then((data) => {
            this.setState({ uiSet: data})
        });
        this.getCourse();
    }

    openLearn() {
        this.setState({
            redirectToLearn: true
        })
    }

    render() {
        const { t } = this.props;
        let course = this.state.course;
        let chapters = [];
        let videoCount = 0;
        let labCount = 0;
        let quiz = 0;
        if (!!course) {
            chapters = course.chapters;
            chapters.forEach(chapter => {
                chapter.lectures.forEach(lecture => {
                    switch(lecture.type) {
                        case 'Video':
                            videoCount++;
                            return;
                        case 'Workshop':
                            labCount++;
                            return;
                        case 'Quiz':
                            quiz++;
                            return;
                        default:
                            return;
                    }
                })
            })
        }

        return this.state.redirectToLearn ?
            <Navigate to={'/learn/' + course.id} /> :
            <div>
                <NavBar navigation={this.props.navigation} title="Cloud Solutions Journey"/>
                {this.state.loading ? <div className='course-main'>
                    <img src={loadingGif} alt="loading..." className='course-loading-gif' />
                </div>
                : <div className='course-main'>
                    <div className='course-info'>
                            <div className='course-title'>
                            {course.name}
                        </div>
                        <div className='course-property'>
                            <Icon variant='subtle' name='ticket' className='course-property-icon'/>{t("course.level")} {course.level}
                        </div>
                        <div className='course-property'>
                            <Icon variant='subtle' name='check' className='course-property-icon'/> 
                            {t("course.category")} 
                            {course.categories.map((category, index) => <span key={index}>{index !== 0 ? ', ' : ' '}<a href='/#'>{category}</a></span>)}
                        </div>
                        {/* <div className='course-property'>
                            <Icon variant='subtle' name='check' className='course-property-icon'/> 
                            Tag:
                            {course.tags && course.tags.map((tag, index) => <span key={index}>{index !== 0 ? ', ' : ' '}<a href='/#'>{tag}</a></span>)}
                        </div> */}
                        <div className='course-property'>
                            <Icon variant='subtle' name='status-pending' className='course-property-icon'/> 
                            {calcTimeBrief(course.length)}
                        </div>
                        <div className='course-desc'>
                            {course.description}
                        </div>
                    </div>
                    <div className='course-thumbnail'>
                        <img src={courseDefaultThumbnail} alt='Course Thumbnail'/>
                    </div>

                    <div className='course-separator' />

                    <div className='course-bottom'>
                        <Grid
                            gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                            >
                            <div>
                                <div className='course-what-to-learn-title'>
                                    {t("course.benefit")}
                                </div>
                                {course.whatToLearn.map((item, index) => <div key={index} className='course-what-to-learn-item'>
                                    <Icon variant='subtle'
                                        svg={
                                            <svg
                                              viewBox="0 0 16 16"
                                              xmlns="http://www.w3.org/2000/svg"
                                              focusable="false"
                                              aria-hidden="true"
                                              style={{color: `${this.state.uiSet?.MainColor}`}}
                                            >
                                              <path d="m14.254 4.254-8.25 8.25L6 12.5l-.004.004-4.25-4.25.008-.008L6 12.493l8.246-8.247.008.008Z"></path>
                                            </svg>
                                        }
                                    /> 
                                    <div>{item}</div>
                                </div>)}
                            </div>
                            <div>
                                <div className='board'>
                                    <div className='board-header'>
                                        {t("course.summerize.title")}
                                    </div>
                                    <div className='board-content'>
                                        <div className='course-what-to-learn-item'>
                                            <Icon 
                                                variant='subtle'
                                                svg={
                                                    <svg 
                                                        viewBox="0 0 16 16" 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        focusable="false" 
                                                        aria-hidden="true"
                                                        style={{color: `${this.state.uiSet?.MainColor}`}}
                                                    >
                                                            <path class="stroke-linejoin-round" d="M11 5H1v7h10V5Z"></path>
                                                            <path class="stroke-linejoin-round" d="M11 8.229h4v-7H5V5M1 15h10M6 15v-3"></path>
                                                    </svg>
                                                }
                                            
                                            /> 
                                            <div>{videoCount} {t("course.summerize.video")}</div>
                                        </div>
                                        { labCount > 0 ? <div className='course-what-to-learn-item'>
                                            <Icon
                                                svg={
                                                    <svg viewBox="0 0 16 16" 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        focusable="false" 
                                                        style={{color: `${this.state.uiSet?.MainColor}`}}
                                                        aria-hidden="true">
                                                        <path d="M7.981 1.047a.02.02 0 0 1 .038 0l1.96 4.973 4.974 1.961a.02.02 0 0 1 0 .038L9.98 9.979l-1.961 4.974a.02.02 0 0 1-.038 0L6.021 9.98 1.046 8.019a.02.02 0 0 1 0-.038l4.973-1.96 1.961-4.974Z"></path>
                                                        <path d="m2.5 2.65.045-.095.095-.045-.095-.045L2.5 2.37l-.045.095-.095.045.095.045.045.095Z" class="filled"></path>
                                                    </svg>
                                                }
                                            />
                                            <div>{labCount} {t("course.summerize.lab")}</div>
                                        </div> : <></> }
                                        {/* <div className='course-what-to-learn-item'>
                                            <Icon variant='subtle' name='calendar'/>
                                            <div>{quiz} quizzes</div>
                                        </div> */}
                                    </div>
                                    <div className='board-footer'>
                                        {/* <Button variant='primary' className='btn-orange' onClick={() => this.openLearn()}>
                                            Start Course
                                        </Button> */}
                                        <button 
                                            className='btn-normal' 
                                            style={{background: `${this.state.uiSet.MainColor}`, 
                                                    borderColor: `${this.state.uiSet.MainColor}`, 
                                                    color: `${this.state.uiSet.TextColor}`}} 
                                            onClick={() => this.openLearn()}
                                        >
                                            {t("course.start")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Grid>
                        
                        <div className='space-20' />

                        <div className='board'>
                            <div className='board-header'>
                                {t("course.content")}
                            </div>
                            <div className='board-content'>
                                {course.chapters.map((chapter, index) => <ExpandableSection key={index} className='course-lectures' headerText={chapter.name}>
                                    {chapter.lectures.map((lecture, index) => <div key={index} className='course-lecture-item'>
                                        {lecture.type === 'video' 
                                            ? <Icon name='audio-full' className='course-property-icon'/>
                                            : <Icon name='check' className='course-property-icon'/>}
                                        {lecture.name}
                                    </div>)}
                                </ExpandableSection>)}
                            </div>
                        </div>
                        
                        <div className='space-40' />

                        <div className='board'>
                            <div className='board-header'>
                                {t("course.requirement")}
                            </div>
                            <div className='board-content'>
                                {course.requirements.map((requirement, index) => <ul key={index}>
                                    <li>{requirement}</li>
                                </ul>)}
                            </div>
                        </div>
                        
                        <div className='space-40' />
                    </div>
                </div>}
                <Footer />
            </div>;
    }
}

export default withTranslation()(Course)