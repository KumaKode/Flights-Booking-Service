function compareTime(timeSting1, timeSting2) {
  let datetime1 = new Date(timeSting1);
  let datetime2 = new Date(timeSting2);

  return datetime1.getTime() >= datetime2.getTime();
}

module.exports = compareTime;
