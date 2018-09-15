let currentPage = window.location.href;
if (window.location.href.search(/\/anime\/|\/manga\//) > 0) {
    retrieveMALURL();
}

/**
 * Check for page change every 50ms.
 */
setInterval(() => {
    if (currentPage != window.location.href &&
        window.location.href.search(/\/anime\/|\/manga\//) > 0) {
        currentPage = window.location.href;
        retrieveMALURL();
    }
}, 100);
/*
Retrieve the corresponding MAL URL of the anime/manga.
*/
function retrieveMALURL() {
    //Get page type (anime/manga) and Anilist id.
    const type = location.href.indexOf('anime') >= 0 ?
        'anime' : 'manga';
    const id = parseInt(location.href.match(/\d+/)[0]);

    //Construct query.
    const query =
        `
        query ($id: Int) {
            Media (id: $id) {
               idMal
            }
        }
        `;
    const variables = { id };

    //Call Anilist API to get MAL id of anime/manga.
    fetch(`https://graphql.anilist.co/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ query, variables })
        })
        .then(resp => resp.json())
        .then(resp => {
            const malId = resp.data.Media.idMal;
            injectMALButton(malId, type);
        })
        .catch(error => {
            console.log(error);
        })
}

/**
 * Injects a link on the Anilist page to the corresponding media on MAL.
 * @param id {Number} the mal id of the anime/manga.
 * @param type {String} the type of media.
 */
function injectMALButton(id, type) {
    let malLink = `https://myanimelist.net/${type}/${id}`;

    let nav = document.getElementsByClassName('actions')[0];

    if (!nav) {
        return setTimeout(injectMALButton(id, type), 100);
    }

    //Clear old button.
    let malLinks = document.getElementsByClassName('malLink');
    if (malLinks.length) {
        nav.removeChild(malLinks[0]);
    }

    //Set actions column to 3 and repad buttons.
    nav.style['grid-template-columns'] = 'auto 35px 35px';
    nav.children[0].children[0].style['padding-left'] = '0px';
    nav.children[0].children[0].style['font-size'] = '.95em';

    //Create new button.
    let button = document.createElement('img');
    button.src = chrome.extension.getURL('images/malIcon.png');
    button.className = 'malImage';
    button.alt = 'MAL';

    let link = document.createElement('a');
    link.appendChild(button);

    link.href = malLink;
    link.target = '_blank';
    link.className = 'malLink';

    nav.appendChild(link);
}
