// Requiring cheerio, request and fs modules
const request = require("request");
const cheerio = require("cheerio");
let fs = require("fs");
// Creating a global data object to store topicProcessor,projects and their issues. Will be used later to create a json file
let data = {};

//First request sent to topics page of github.
request("https://github.com/topics", callback);

//After response from first request is provided this function runs.
//This function creates a manipulationTool with the html in the response
//Then it finds the topic names and their url.
//After that it calls topicProcessor function and give them topicName and its url
function callback(error, response, html) {
  if (!error) {
    let manipulationTool = cheerio.load(html);
    let allAnchors = manipulationTool(".no-underline.d-flex.flex-column");

    for (let i = 0; i < allAnchors.length; i++) {
      topicProcessor(
        "https://github.com/" + manipulationTool(allAnchors[i]).attr("href"),
        manipulationTool(manipulationTool(allAnchors[i]).find("p")[0])
          .text()
          .trim()
      );
    }
  }
}

//This function sends a request to a topic url and create a manipulationTool with cheerio and html provided in the response from topic page request
//Then it finds all heading where the project names are mentioned
//From those headings it gets the required project name and its url of top 5 projects, then it stores the project name in global data object
//Also it calls the function projectProcessor and passes the project url to it along with topic and project name
function topicProcessor(url, topicName) {
  request(url, function (err, res, html) {
    let mt = cheerio.load(html);
    let allHeadings = mt(".f3.color-text-secondary.text-normal.lh-condensed");
    allHeadings = allHeadings.slice(0, 5);
    for (let i = 0; i < allHeadings.length; i++) {
      if (!data[topicName]) {
        data[topicName] = [];
        data[topicName].push({
          name: mt(mt(allHeadings[i]).find("a")[1]).text().trim(),
        });
      } else {
        data[topicName].push({
          name: mt(mt(allHeadings[i]).find("a")[1]).text().trim(),
        });
      }
      projectProcessor(
        "https://github.com/" +
          mt(mt(allHeadings[i]).find("a")[1]).attr("href"),
        topicName,
        mt(mt(allHeadings[i]).find("a")[1]).text().trim()
      );
    }
  });
}

//This function sends a request to a given project issues page by adding /issues to given project url
// Like all the above functions it also create a manipulation tool with help of response html
//Using that tool it select all the issues. Then get the top 5 issues from it. For a particular issue it fetches its heading and its url. Saves the heading and url to the appropriate project object in the global data object
//finally creates a json file after updating the global object
function projectProcessor(projectUrl, topicName, projectName) {
  projectUrl = projectUrl + "/issues";
  request(projectUrl, function (err, res, html) {
    let mt = cheerio.load(html);
    let allAnchors = mt(
      ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"
    );

    //We have topicName and global data object. Using which we find the array in global data object corresponding to topicName. This array will containe 5 project objects. Now in this function we need to update 1 of those 5 project objects with its issues.
    //To do so we need to find which project object needs updating in the extracted array above.
    // So we create a variable called index and make it equal to -1.
    //Then we loop in a topic array and match the name inside project objects with the projectName given to this function in arguments. Once both values matches we store the matched object position using index variable.
    // Then  we use this index together with topic array to insert the issues in the required project object.


    // data[topicName]  => this is topic array 
    //data[topicName][index] => this is project object whose issues we are scrapping
    //data[topicName][index].issues => here we are accessing issues key in a project object, which is an element in topic array

    let index = -1;
    for (let j = 0; j < data[topicName].length; j++) {
      if (data[topicName][j].name == projectName) {
        index = j;
        break;
      }
    }

    allAnchors = allAnchors.slice(0, 5);
    for (let i = 0; i < allAnchors.length; i++) {
      let link = "https://github.com/" + mt(allAnchors[i]).attr("href");
      let name = mt(allAnchors[i]).text();

      if (!data[topicName][index].issues) {
        data[topicName][index].issues = [];
        data[topicName][index].issues.push({ name, link });
      } else {
        data[topicName][index].issues.push({ name, link });
      }
    }
    fs.writeFileSync("data.json", JSON.stringify(data));
  });
}