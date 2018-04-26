const userPass = 'base64 encoded user:pass';
if (location.href.search(/\/anime\/|\/manga\//) > 0)
    retrieveMALURL();
setTimeout(pageObserver, 2000);

/*
Add a page observer to check when the page has changed (i.e; A new anime/manga has been loaded.)
*/
function pageObserver() {
    let handler;
    let observer = new MutationObserver(function (mutations) {
        try {
            if (mutations[0].addedNodes[0].id == 'view' && (location.href.search(
                    /\/anime\/|\/manga\//) > 0)) {
                retrieveMALURL();
            }
        } catch (err) {}
    });
    let config = {
        attributes: true,
        childList: true,
        characterData: true
    };
    observer.observe(document.body, config);
}

/*
Retrieve the corresponding MAL URL of the anime/manga.
*/
function retrieveMALURL() {
    //Retrieve title. If empty/null, try again in 100ms.
    let title = '';
    let tags = document.getElementsByTagName('h1');
    if (tags.length == 0 || !tags[0] || tags[0].innerText == '') {
        return setTimeout(retrieveMALURL, 100);
    } else {
        title = tags[0].innerText.split(/\s+/).join('+');
    }

    //Check whether page is an anime or a manga.
    let type = location.href.search('anime') >= 0 ?
        'anime' : 'manga';

    //Make MAL API request.
    let getMAL = new XMLHttpRequest();
    getMAL.open('GET', `https://myanimelist.net/api/${type}/search.xml?q=${title}`);
    getMAL.setRequestHeader('Authorization', `Basic ${userPass}`);
    getMAL.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            //Parse ID to get MAL link.
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(this.responseText, 'text/html');

            let typeArray = xmlDoc.getElementsByTagName('type');
            let desiredIndex = null; //The index of the desired response (TV type), if matched.
            for (let i = 0; i < typeArray.length; i++) {
                if (typeArray[i].innerText == 'TV' && type == 'anime' || typeArray[i].innerText ==
                    'Manga' && type == 'manga') {
                    desiredIndex = i;
                    break;
                }
            }

            let id = xmlDoc.getElementsByTagName('id')[desiredIndex != null ?
                desiredIndex : 0].innerText; //Use index if found.
            let score = xmlDoc.getElementsByTagName('score')[0].innerText;
            injectMALButton(id, type, score);
        }
    }
    getMAL.send();
}

/*
Injects a MAL link to the corresponding anime/manga on MAL.
*/
function injectMALButton(id, type, score) {
    let malLink = `https://myanimelist.net/${type}/${id}`;

    let nav = document.getElementsByClassName('series__title')[0];

    if (!nav) {
        return setTimeout(injectMALButton(id, type), 50);
    }

    let button = document.createElement('img');
    button.src = chrome.extension.getURL('images/malIcon.png');
    button.className = 'malImage';
    button.alt = 'MAL';

    let scoreText = document.createElement('div');
    scoreText.appendChild(document.createTextNode(score));
    scoreText.className = 'scoreText';

    let link = document.createElement('a');
    link.appendChild(button);
    link.appendChild(scoreText);

    link.href = malLink;
    link.target = '_blank';
    link.className = 'malLink';

    nav.appendChild(link);
}
