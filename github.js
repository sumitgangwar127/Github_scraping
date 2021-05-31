const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

let data = {};

request("https://github.com/topics", callback);

function callback(error,response,html){
    if(!error) {
        const manipulationTool = cheerio.load(html);

        let topicname =manipulationTool(".no-underline.d-flex.flex-column");
            for(let i =0 ; i<topicname.length;i++){
                let name = manipulationTool(manipulationTool(topicname[i]).find("p")[0]).text().trim();
                let url = "https://github.com/" + manipulationTool(topicname[i]).attr("href");
                // console.log(name);
                // console.log(url);
                // console.log("--------------");

                topicProcessor(url,name);
            }
    }


    function topicProcessor(url,ProjectName){
        request(url, function(error,response,html){
            if(!error){
                const manipulationTool = cheerio.load(html);
                let allTopics = manipulationTool(".f3.color-text-secondary.text-normal.lh-condensed");
                
                allTopics = manipulationTool(allTopics).slice(0,5);
                for(let i = 0 ; i < allTopics.length; i++){
                    let topicnames = manipulationTool(manipulationTool(allTopics[i]).find("a")[1]).text().trim();
                    let attributeURL = manipulationTool(manipulationTool(allTopics[i]).find("a")[1]).attr("href");
                    // console.log(topicnames);
                    // console.log("https://github.com/" + attributeURL);
                    // console.log("-----------------");
                    if(!data[ProjectName]){
                        data[ProjectName]=[];
                        data[ProjectName].push({
                            name: topicnames
                        })
                    }
                    else{
                        data[ProjectName].push({
                            name: topicnames
                        })
                    }
                    //fs.writeFileSync("data.json", JSON.stringify(data));

                    ProjectProcessor(attributeURL,topicnames,ProjectName)

                    
                }
            }
        });

    }

    function ProjectProcessor(projectURL, topicname, ProjectName){
        projectURL = projectURL + "/issues"
        request(projectURL, function(error,response,html){
            if(!error){
                const manipulationTool= cheerio.load(html);

                let allAnchors =  manipulationTool(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title")

                index = -1;
                for(let i = 0 ; i < data[topicname].length; i++){
                    if(data[topicname][i].name== ProjectName){
                        index = i ;
                        break;
                    }
                }

                allAnchors = allAnchors.slice(0,5);
                for(let i = 0 ; i<allAnchors.length();i++){
                    let link = "https://github.com/" + manipulationTool(allAnchors[i]).attr("href");
                    let name =  manipulationTool(allAnchors[i]);

                    if(!data[topicname][index].issues){
                        data[topicname][index].issues = [];
                        data[topicname][index].issues.push({name, link});

                    }
                    else{
                        data[topicname][index].issues.push({name, link});
                    }
                }
                fs.writeFileSync("data.json",JSON.stringify(Data))
               
                
            }
        });
    }

}