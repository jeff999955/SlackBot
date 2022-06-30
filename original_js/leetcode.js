const axios = require("axios");

const leetcodeAPIEndpoint = "https://leetcode.com/api/problems/algorithms/";
const leetcodeBaseURL = "https://leetcode.com/problems/";

const getAllLeetcodeProblems = async () => {
  const ret = [];
  const leetcodeData = await axios.get(leetcodeAPIEndpoint);
  const problems = leetcodeData.data.stat_status_pairs;
  for (var i = 0; i < problems.length; i++) {
    const problem = problems[i];
    if (problem.paid_only) continue;
    ret.push(problem);
  }
  return ret;
};

module.exports = getAllLeetcodeProblems;
