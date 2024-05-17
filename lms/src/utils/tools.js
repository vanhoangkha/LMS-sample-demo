import moment from "moment";
import { API } from "aws-amplify";
import { apiName, configUI } from "./api"
import { uiConfigId } from "./uiConfig"

export function transformDateTime(createAt) {
  const date = moment(createAt);
  return date.calendar(null, {
    sameDay: "D MMM YYYY",
    lastDay: "D MMM YYYY",
    lastWeek: "D MMM YYYY",
    sameElse: "D MMM YYYY",
  });
}

export function calcTime(time) {
  let timeString = "";
  if (Math.floor(time / 3600) > 0) {
    timeString = timeString + (Math.floor(time / 3600) + " hours ")
  }
  if( (time % 3600) / 60 > 0 ){
    timeString = timeString + (Math.floor((time % 3600) / 60) + " minutes ")
  }
  if( (time % 3600) % 60 > 0 ){
    timeString = timeString + ((time % 3600) % 60) + " seconds"
  }
  return timeString;
}

export function calcTimeBrief(time, hour, minute) {
  let timeString = "";
  if (Math.floor(time / 3600) > 0) {
    timeString = timeString + (Math.floor(time / 3600) + " " + hour + " ")
  }
  if( (time % 3600) / 60 > 0 ){
    timeString = timeString + (Math.floor((time % 3600) / 60) + " " + minute)
  }
  return timeString;
}

export async function getUISet() {
  let localParams = localStorage.getItem("AWSLIBVN_UISET");
  let data = JSON.parse(localParams)
  if(data){
    return data;
  }else{
    try{
      const uiSet = await API.get(apiName, configUI + uiConfigId);
      if ( uiSet ) {
        localStorage.setItem("AWSLIBVN_UISET", JSON.stringify(uiSet));
        return uiSet;
      }
    }catch(error){
      console.log(error)
      return null;
    }
  }
}
