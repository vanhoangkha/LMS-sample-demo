import axios from 'axios'

export const apiName = "lmsStudio";
export const lecturePath = "/lectures";
export const lecturePublicPath = "/lectures/public";
export const batchWriteLecturePath = "/lectures/batchWrite";
export const myLecturePath = "/lectures/myLectures";
export const lectureTopViewPath = "/topViews";
export const coursePath = "/courses";
export const batchWriteCoursePath = "/courses/batchWrite";
export const courseTopViewPath = "/topViews";
export const addAccessCode = "/addAc";
export const userOverview = "/userOverview";
export const userCourse = "/usercourse";
export const accessCodePath = "/accessCode";
export const courseCodePath = "/courseCode/"
export const uiConfigPath = "/configUI";
export const userPath = "/users";
export const byUserName = "/byUserName";
export const contributorPath = "/contributor";
export const topContributorPath = "/topContributor";
export const courseOppPath = "/courseOpp";
export const topOppValuePath = "/topOppValue";
export const secretKeyPath = "/secretKey";

const api = axios.create({
  baseURL: 'https://ax8w57g1dk.execute-api.ap-southeast-1.amazonaws.com/newenv'
})

export default api