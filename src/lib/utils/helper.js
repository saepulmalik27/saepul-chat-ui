import moment from "moment";
import "moment-timezone";
export const DATE_FORMAT = "YYYY-MM-DD HH:mm";

/**
 * Disable Scroll
 */
export class disableScroll {
  static on() {
    document.body.style.overflow = "hidden";
    document.body.style.top = `-${window.scrollY}px`;
  }

  static off() {
    document.body.style.overflow = "auto";
    const scrollY = document.body.style.top;
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
  }
}

/**
 * @TODO convert string to date
 */

export const convertStringToDate = (strTime) => {
  let timestamp = Number(strTime) * 1000;
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let timestr = hours + ":" + minutes + " " + ampm;
  return timestr.toString();
};

export const dateValidation = (startTime) => {
  try {
    const duration = moment.duration(moment(startTime).diff(moment.now()));
    const seconds = duration.asSeconds();
    return seconds;
  } catch (error) {
      console.log(error);
  }
};

export const beforeDate = (date) => {
  const start = moment(date, DATE_FORMAT).tz("Asia/Jakarta");
  const current = moment().tz("Asia/Jakarta");
  return current.isBefore(start);
}

export const convertToString = (val) => {
  let data;
  if ( typeof val === "string") {
    data = val;
    console.log(typeof val);
  }else{
   data =  String(val);
   console.log(typeof val);
  }
  return data;
}
