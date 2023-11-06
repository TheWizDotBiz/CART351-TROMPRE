let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='; //returns a json of search result of whatever is after search
let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles='; //loads a json of the content in the article named after title

let userInput;
let searchButton;

function setup(){
    console.log("setup complete");
    userInput = document.getElementById('userInput');
    searchButton = document.getElementById('searchButton');
}

function searchWiki(){
    userInput = document.getElementById('userInput');
    let term = userInput.value;
    console.log("search for " + term);
    let url = searchUrl + term + '&origin=*'; //adding the &origin=* parameter fixes a CORS error, whatever that means.
    console.log(url);
   // loadJSON(url, gotData); //thats p5js lol
   fetch(url).then(response => response.json()).then(data => gotData(data)); //the thing from the JSON class we had
}

function gotData(data){
    console.log(data);
    console.log("first returned article is " + data[1][0]);
    console.log("url is " + data[3][0]);

    //load title;
    let title = data[1][0];

    //create an h2 with the article title
    let para = document.createElement("a");
    para.innerText = "Article: " + title;
    para.href = data[3][0];
    document.body.appendChild(para);

    //load article content
    title = title.replace(/s\+/g, '_'); //replaces spaces with underscores, dont even try and ask me what the fuck this is.
    let url = contentUrl + title + '&origin=*';
    fetch(url).then(response => response.json()).then(data => gotContent(data)); 
}

function gotContent(data){
    console.log(data);
    let page = data.query.pages;
    let pageId = Object.keys(data.query.pages)[0];
    let content = page[pageId].revisions[0]['*'];
  //  console.log(content);
    let para = document.createElement('p');
    para.innerText = content;
   // document.body.appendChild(para);
    isThisRelatedToMichaelJackson(content);
}

function isThisRelatedToMichaelJackson(content){
    console.log(content.search("Michael Jackson"));
    var heeHee = false;
    if(content.search("Michael Jackson") != -1){
        console.log("this contains michael jackson");
        heeHee = true;
    }else{
        console.log("this does not contain michael jackson");
        heeHee = false;
    }

    let txt;
    let para = document.createElement('h2');
    if(heeHee){
        txt = 'This contains Michael Jackson!';
        para.style = "color:green";
    }else{
        txt = 'This does NOT contain Michael Jackson';
        para.style = "color:red";
    }
    
    para.innerHTML = txt;
    document.body.appendChild(para);
}