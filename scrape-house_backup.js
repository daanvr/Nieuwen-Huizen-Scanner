const cheerio = require('cheerio')
const Nightmare = require('nightmare');
const fs = require('fs');

let dataBase = loadJsonFile("DB.json");
let readyToSaveQ = true;



website1() // fransmakelaardij.nl
website2() // bieze-makelaars.nl
website3() // getreuer.nl
website4() // thomapost.nl



function website1() {
    openW1()
    function openW1() {
        var nightmare = Nightmare({ show: true });
        nightmare
            .goto('https://www.fransmakelaardij.nl/aanbod/woningaanbod/vestiging-12238/')
            .wait('body')
            //   .scrollTo(25000, 0)
            .evaluate(() => document.querySelector('body').innerHTML)
            .end()
            .then(response => {
                // console.dir(response)
                procesW1(response)
            })
            .catch((e) => { console.dir(e) });
    }

    let procesW1 = html => {
        var adsOnPage = [];
        const $ = cheerio.load(html); // cherio is a jquery like library for node js
        $(".aanbodEntry").each((i, elem) => { // select ads gallery item
            var ad = {};
            var time = new Date();
            ad.url = "https://www.fransmakelaardij.nl" + $(elem).find(".aanbodEntryLink").attr("href");
            ad.straat = $(elem).find(".street-address").text();
            ad.eersteSpot = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes();
            ad.prijs = $(elem).find(".kenmerkValue").text();
            ad.postcode = $(elem).find(".postal-code").text();
            ad.plaats = $(elem).find(".locality").text();
            ad.fotoUrl = $(elem).find(".foto_").attr("src");
            ad.statusVerkoop = $(elem).find(".objectstatusbanner").text();
            adsOnPage.push(ad);
        });
        console.log("W1 has " + Object.keys(adsOnPage).length + " ads.");
        pushToDB(adsOnPage); //procesing extracted Data
    }
}

function website2() {
    openW2()
    function openW2() {
        var nightmare = Nightmare({ show: true });
        nightmare
            .goto('https://www.bieze-makelaars.nl/aanbod/woningaanbod/75000-200000/koop/')
            .wait('body')
            //   .scrollTo(25000, 0)
            .evaluate(() => document.querySelector('body').innerHTML)
            .end()
            .then(response => {
                // console.dir(response)
                procesW2(response)
            })
            .catch((e) => { console.dir(e) });
    }

    let procesW2 = html => {
        var adsOnPage = [];
        const $ = cheerio.load(html); // cherio is a jquery like library for node js
        $(".aanbodEntry").each((i, elem) => { // select ads gallery item
            var ad = {};
            var time = new Date();
            ad.url = "https://www.bieze-makelaars.nl" + $(elem).find(".aanbodEntryLink").attr("href");
            ad.straat = $(elem).find(".street-address").text();
            ad.eersteSpot = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes();
            ad.prijs = $(elem).find(".kenmerkValue").text();
            ad.postcode = $(elem).find(".postal-code").text();
            ad.plaats = $(elem).find(".locality").text();
            ad.fotoUrl = $(elem).find(".foto_").attr("src");
            ad.statusVerkoop = $(elem).find(".objectstatusbanner").text();
            adsOnPage.push(ad);
        });
        console.log("W2 has " + Object.keys(adsOnPage).length + " ads.");
        pushToDB(adsOnPage); //procesing extracted Data
    }
}

function website3() {
    openW3()
    function openW3() {
        var nightmare = Nightmare({ show: true });
        nightmare
            .goto('https://www.getreuer.nl/woningmakelaars/aanbod/')
            .wait('body')
            //   .scrollTo(25000, 0)
            .evaluate(() => document.querySelector('body').innerHTML)
            .end()
            .then(response => {
                // console.dir(response)
                procesW3(response)
            })
            .catch((e) => { console.dir(e) });
    }

    let procesW3 = html => {
        var adsOnPage = [];
        const $ = cheerio.load(html); // cherio is a jquery like library for node js
        $("#sectie-wrap a").each((i, elem) => { // select ads gallery item
            var ad = {};
            var time = new Date();
            ad.url = $(elem).attr("href");
            // #sectie-wrap > a:nth-child(3)
            ad.straat = $(elem).find(".adres").text();
            ad.eersteSpot = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes();
            ad.prijs = $(elem).find(".prijs").text();
            ad.postcode = "";
            ad.plaats = $(elem).find(".plaatsnaam-aanboddetail").text();
            ad.fotoUrl = $(elem).find(".woning_afb img").attr("src");
            ad.statusVerkoop = $(elem).find(".labeltekst").text();
            adsOnPage.push(ad);
        });
        console.log("W3 has " + Object.keys(adsOnPage).length + " ads.");
        pushToDB(adsOnPage); //procesing extracted Data
    }
}

function website4() {
    openW4()
    function openW4() {
        var nightmare = Nightmare({ show: true });
        nightmare
            .goto('https://thomapost.nl/woningen/')
            .wait('body')
            //   .scrollTo(25000, 0)
            .evaluate(() => document.querySelector('body').innerHTML)
            .end()
            .then(response => {
                // console.dir(response)
                procesW4(response)
            })
            .catch((e) => { console.dir(e) });
    }

    let procesW4 = html => {
        var adsOnPage = [];
        const $ = cheerio.load(html); // cherio is a jquery like library for node js
        $(".estate-item").each((i, elem) => { // select ads gallery item
            var ad = {};
            var time = new Date();
            ad.url = $(elem).find("a").attr("href");
            ad.straat = $(elem).find(".address-address").text();
            ad.eersteSpot = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes();
            ad.prijs = $(elem).find(".price").text();
            ad.postcode = "";
            ad.plaats = $(elem).find(".address-town").text();
            ad.fotoUrl = $(elem).find(".estate-image").attr("style");
            ad.statusVerkoop = "";
            adsOnPage.push(ad);
        });
        console.log("W4 has " + Object.keys(adsOnPage).length + " ads.");
        pushToDB(adsOnPage); //procesing extracted Data
    }
}




//ad new ads to Database
function pushToDB(newEntries) {
    //should be useless but in case it is not loaded:
    if (dataBase === undefined) { dataBase = loadJsonFile("DB.json"); }

    for (i in newEntries) {
        if (dataBase[newEntries[i].straat] === undefined) {
            console.dir("Nieuw Huis:");
            console.dir(newEntries[i]);
            dataBase[newEntries[i].straat] = newEntries[i];
        }
    }
    saveJsonFile("DB.json", dataBase);
}

//load Database
function loadJsonFile(fileLocation) {
    return JSON.parse(fs.readFileSync(fileLocation));
}

//Save Database
function saveJsonFile(fileLocation, jsonData) {
    if (readyToSaveQ) {
        fs.writeFile(fileLocation, JSON.stringify(jsonData), function (err) {
            if (err) throw err;
            console.log('DATABASE >>> SAVED');
        });
        readyToSaveQ = false;
        setTimeout(() => {
            readyToSaveQ = true;
        }, 1000);
    } else {
        setTimeout(() => {
            saveJsonFile(fileLocation, jsonData)
        }, 1000);
    }
}