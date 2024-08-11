// Utility function to format dates
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US');
};

const htremarkHelper = (score) => {
  if (score <= 100 && score >= 80) {
    return "Wonderful performance. Keep it up.";
  } else {
    if (score < 80 && score >= 70) {
      return "An Amazing Result. Keep it up";
    } else {
      if (score < 70 && score >= 60) {
        return "Good Result. You can do more";
      } else {
        if (score < 60 && score >= 50) {
          return "Satisfactory Result. You can do better.";
        } else {
          if (score < 50 && score >= 40) {
            return "Average Result, Work harder";
          } else if (score < 40 && score >= 0) {
            return "Poor performance. Do better next time.";
          } else {
            return "Your Scores are not within the stipulated range. Form teacher please make corrections";
          }
        }
      }
    }
  }
}

const position_qualifier = (pos) => {
  if (!isNaN(pos)) {
    if (p(pos, 1) || p(pos, 21) || p(pos, 31) || p(pos, 41) || p(pos, 51) || p(pos, 61) || p(pos, 71) || p(pos, 81) || p(pos, 91) || p(pos, 101) || p(pos, 121) || p(pos, 131) || p(pos, 141) || p(pos, 151) || p(pos, 161) || p(pos, 171) || p(pos, 181) || p(pos, 191) || p(pos, 201)) {
      return pos + "st";
    }
    else {
      if (p(pos, 2) || p(pos, 22) || p(pos, 32) || p(pos, 42) || p(pos, 52) || p(pos, 62) || p(pos, 72) || p(pos, 82) || p(pos, 92) || p(pos, 102) || p(pos, 122) || p(pos, 132) || p(pos, 142) || p(pos, 152) || p(pos, 162) || p(pos, 172) || p(pos, 182) || p(pos, 192) || p(pos, 202)) {
        return pos + "nd";
      } else {
        if (p(pos, 3) || p(pos, 23) || p(pos, 33) || p(pos, 43) || p(pos, 53) || p(pos, 63) || p(pos, 73) || p(pos, 83) || p(pos, 93) || p(pos, 103) || p(pos, 123) || p(pos, 133) || p(pos, 143) || p(pos, 153) || p(pos, 163) || p(pos, 173) || p(pos, 183) || p(pos, 193) || p(pos, 203)) {
          return pos + "rd";
        } else {
          if (btw(pos, 4, 20) || btw(pos, 24, 30) || btw(pos, 34, 40) || btw(pos, 44, 50) || btw(pos, 54, 60) || btw(pos, 64, 70) || btw(pos, 74, 80) || btw(pos, 84, 90) || btw(pos, 94, 100) || btw(pos, 104, 120) || btw(pos, 124, 130) || btw(pos, 134, 140) || btw(pos, 144, 150) || btw(pos, 154, 160) || btw(pos, 164, 170) || btw(pos, 174, 180) || btw(pos, 184, 190) || btw(pos, 194, 200)) {
            return pos + "th";
          } else {
            return pos;
          }
        }
      }
    }
  }
  else {
    return ''
  }
}
function p(pos, num) {
  if (pos === num) { return true; } else { return false; }
}
function btw(p, a, b) {
  if (p >= a && p <= b) { return true; } else { return false; }
}

module.exports = {
  formatDate, htremarkHelper, position_qualifier
};
