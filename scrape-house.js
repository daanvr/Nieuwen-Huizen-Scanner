// dependencies to be instaled in terminal
const cheerio = require('cheerio')
const Nightmare = require('nightmare');
const fs = require('fs');

// Global variables.
let dataBase = loadJsonFile("DB.json"); //Json database based on loaded Json file.
let readyToSaveQ = true; // Status variable that makes sure there is nog save action while an other save action is ongoing.

// Initiation of the different scan actions.
website("https://thomapost.nl/woningen/", "Thoma Post");
website("https://www.fransmakelaardij.nl/aanbod/woningaanbod/vestiging-12238/", "Frans");
website("https://www.bieze-makelaars.nl/aanbod/woningaanbod/75000-200000/koop/", "Bieze");
website("https://www.getreuer.nl/woningmakelaars/aanbod/", "Getreuer");

website("https://www.dwmakelaardij.nl/woningaanbod/koop", "DW");
website("https://www.adfinis.nl/aanbod/woningaanbod/-200000/koop/", "name");
website("https://helderdeventer.nl/makelaars/woningaanbod/", "name");
website("https://www.schipbeekmakelaars.nl/aanbod/woningaanbod/", "name");
website("https://www.vrielinkmakelaars.nl/?city=no-preference&price=no-preference&type=no-preference", "name");
website("https://www.postma.nl/aanbod/woningaanbod/koop/", "name");
website("https://www.briqsmakelaardij.nl/woningaanbod/", "name");
website("https://www.mercuriusmakelaars.nl/woningaanbod/", "name");
website("https://miqa.nl/woningen/", "name");
website("http://www.mastebroekmakelaardij.nl/woningaanbod", "name");
website("https://huispromotie.nl/huisaanbod/", "name");
website("https://www.tenhag.nl/objecten/consument/", "name");
website("https://www.tysma.nl/aanbod/", "name");
website("https://www.go-makelaars.nl/woningaanbod/", "name");
website("https://www.makelaardijdesk.nl/woningaanbod/", "name");
website("https://www.bronsvoordmakelaars.nl/aanbod.html", "name");
website("https://helderdeventer.nl/makelaars/woningaanbod/", "name");
//website("url", "name");







// Webasite scanneing bit
function website(url, name) {
    var nightmare = Nightmare({ show: true });
    // Webpage is opend and loaded.
    nightmare
        .goto(url) 
        .wait('body') //Wait for the body to be ready
        .evaluate(() => document.querySelector('body').innerHTML) //bather all html in the body
        .end() // close website
        .then(response => { procesHtml(response) }) // Proces the html
        .catch((e) => { console.dir(e) }); // Throuw error if error/

    let procesHtml = html => {
        var adsOnPage = []; // new empty array for gathering found hosue ads.
        const $ = cheerio.load(html); // cherio is a jquery like library for node js

        switch (name) { // Based on the loaded website perform the correct acctions to gather the data. This si specific for every website because every website has a different html structure. 
            case "Frans":
                $(".aanbodEntry").each((i, elem) => { // The .each() is performing a loop throug all ellements that it found. This should be the main div/html element that counains one singel ad.
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
                break;

            case "Bieze":
                $(".aanbodEntry").each((i, elem) => {
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
                break;

            case "Getreuer":
                $("#sectie-wrap a").each((i, elem) => {
                    var ad = {};
                    var time = new Date();
                    ad.url = $(elem).attr("href");
                    ad.straat = $(elem).find(".adres").text();
                    ad.eersteSpot = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes();
                    ad.prijs = $(elem).find(".prijs").text();
                    ad.postcode = "";
                    ad.plaats = $(elem).find(".plaatsnaam-aanboddetail").text();
                    ad.fotoUrl = $(elem).find(".woning_afb img").attr("src");
                    ad.statusVerkoop = $(elem).find(".labeltekst").text();
                    adsOnPage.push(ad);
                });
                break;

            case "Thoma Post":
                $(".estate-item").each((i, elem) => {
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
                break;

            case "DW":
                $(".object.clearfix").each((i, elem) => {
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
                break;

            case "":

                break;


                
            // case "name":
            //     console.log("Somethign whent wrong. " + name + " was not scanned. (" + url + ")") // Writting to the console if a website was not processed.
            //     break;
            default:
                console.log("Somethign whent wrong. " + name + " was not scanned. (" + url + ")") // Writting to the console if a website was not processed.
                break;
        }

        console.log(name + " has " + Object.keys(adsOnPage).length + " ads."); // Writing to the console how many ads where founc on the website. This is a KPI (Key Performance Indicator) for the scan of a page.
        pushToDB(adsOnPage); //procesing extracted Data. Writing new data to DB file. Inoring old data
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