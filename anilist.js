const userPass = 'bXlhbmlsaXN0VXNlcjpteWFuaWxpc3QyMTkzODEyMDk1Nw==';
retrieveMALURL();
setTimeout(pageObserver, 2000);

/*
Add a page observer to check when the page has changed (i.e; A new anime/manga has been loaded.)
*/
function pageObserver() {
    var handler;
    var observer = new MutationObserver(function (mutations) {
        try {
            if (mutations[0].addedNodes[0].id == 'view') {
                retrieveMALURL();
            }
        } catch (err) {}
    });
    var config = {
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
    //Retrieve title. If empty/null, try again in 50ms.
    var title = document.getElementsByTagName('h1')[0];
    if (!title || title.innerText == '') {
        return setTimeout(retrieveMALURL, 50);
    } else {
        title = title.innerText.split(/\s+/).join('+');
    }

    //Check whether page is an anime or a manga.
    var type = location.href.search('anime') >= 0
        ? 'anime'
        : 'manga';

    //Make MAL API request.
    var getMAL = new XMLHttpRequest();
    getMAL.open('GET', `https://myanimelist.net/api/${type}/search.xml?q=${title}`);
    getMAL.setRequestHeader('Authorization', `Basic ${userPass}`);
    getMAL.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //Parse ID to get MAL link.
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, 'text/html');
            var id = xmlDoc.getElementsByTagName('id')[0].innerText;
            injectMALButton(id, type);
        }
    }
    getMAL.send();
}

/*
Injects a MAL link to the corresponding anime/manga on MAL.
*/
function injectMALButton(id, type) {
    var malLink = `https://myanimelist.net/${type}/${id}`;

    var nav = document.getElementsByClassName('series__title')[0];

    var button = document.createElement('img');
    button.src = chrome.extension.getURL('images/malIcon.png');
    button.className = 'malLink';
    button.alt = 'MAL';

    var link = document.createElement('a');
    link.appendChild(button);
    link.href = malLink;

    nav.appendChild(link);
}
