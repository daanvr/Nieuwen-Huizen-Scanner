const cheerio = require('cheerio')
const Nightmare = require('nightmare');
const fs = require('fs');

let dataBase;
let readyToSaveQ = true;


function openMarktplaatsForNewAdsAllPages(url) {
  var nightmare = Nightmare({ show: true });
  nightmare
    .goto(url)
    .wait('body')
    .scrollTo(25000, 0)
    .evaluate(() => document.querySelector('body').innerHTML)
    .end()
    .then(response => { procesMarkplaatsSearchHtml(response) })
    .catch((e) => { console.dir(e) });
}

let procesMarkplaatsSearchHtml = html => {
  var adsOnPage = [];
  const $ = cheerio.load(html); // cherio is a jquery like library for node js
  $(".mp-Listing").each((i, elem) => { // select ads gallery item
    adsOnPage.push("https://www.marktplaats.nl" + $(elem).find("a").attr("href"));
  });

  addNewAdsToDB(adsOnPage); //procesing extracted Data

  // Show sample to know if it works
  console.log("Sample: " + adsOnPage[0]);

  // if there is a "next" page go and scrape that too
  if ($("#content > div.mp-Page-element.mp-Page-element--main > div.mp-PaginationControls > nav > a:nth-child(4)").attr("href") != undefined) {
    var nextUrl = "https://www.marktplaats.nl" + $("#content > div.mp-Page-element.mp-Page-element--main > div.mp-PaginationControls > nav > a:nth-child(4)").attr("href");
    openMarktplaatsForNewAdsAllPages(nextUrl)
    console.log("To next page of Marktplaats.");
  }
}

let simultaniousQueries = 0;

function openMarkplaatsAdForScraping(url) {
  var nightmare = Nightmare({ show: false });
  nightmare
    .goto(url)
    .wait('body')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .click('#vip-carousel > button.mp-Button.mp-Button--secondary.carousel-button.carousel-button-next')
    .scrollTo(25000, 0)
    .evaluate(() => document.querySelector('body').innerHTML)
    .end()
    .then((response) => {
      procesMarkplaatsAdHtml(response, url);
      simultaniousQueries--
      loopThrougAdQueue();
    })
    .catch((e) => {
      if (e.url != null && e.url != undefined) {
        dataBase.queue.marktplaats.push(e.url);
        console.log("Pushed back into queue: " + e.url);
      }
      console.dir(e);
    });
}

// Testing:
openMarkplaatsAdForScraping("https://www.marktplaats.nl/a/auto-s/bestelauto-s/m1543281571-volkswagen-transporter-bestel-1-9-tdi-63kw-dc-2006.html?c=1f6123406d618e4dfc07bc3e0818a26e&previousPage=lr")

let procesMarkplaatsAdHtml = (html, url) => {
  var car = {};
  const $ = cheerio.load(html); // cherio is a jquery like library for node js
  var keys = [];
  var values = [];

  // Spec categorie
  $("#car-attributes > div.car-feature-table.spec-table.spec-table_flex > div > span:nth-child(1)").each((i, data) => {
    keys.push(data.children[0].data)
  });

  // Spec Value
  $("#car-attributes > div.car-feature-table.spec-table.spec-table_flex > div > span:nth-child(2)").each((i, data) => {
    if (data.attribs["data-model-binding"] == "options") { } else { values.push(data.children[0].data) }
  });

  // Car options
  $("#car-attributes > div.car-feature-table.spec-table.spec-table_flex > div.spec-table-item.spec-table-item--fullwidth > span.value > ul > li").each((i, data) => {
    car[data.children[0].children[0].data] = true;
  });

  car.description = $("#vip-ad-description").html();
  car.views = $("#content > section > section.listing.mp-Card.mp-Card--rounded > section.l-top-content.mp-Card-block > section.header.clear-fix.container-view-desktop > div.stats > span:nth-child(1) > span:nth-child(3)").text();
  car.saved = $("#content > section > section.listing.mp-Card.mp-Card--rounded > section.l-top-content.mp-Card-block > section.header.clear-fix.container-view-desktop > div.stats > span:nth-child(2) > span:nth-child(3)").text();
  car.pubishedOn = $("#displayed-since > span:nth-child(3)").text();
  car.location = $("#vip-map-show").text().replace("\n", "").replace("                            ", "").replace("\n", "").replace("                    ", "");
  if (car.location === "") { car.location = $("#vip-seller-location > h3 > span").text() }
  car.lng = $("#vip-map-show").attr("long");
  car.lat = $("#vip-map-show").attr("lat");
  car.SellersName = $("#vip-seller > div.info-block > div > div > div.top-info > a > h2").attr("title");
  car.url = url;
  car.shareUrl = $("#content > section > section.listing.mp-Card.mp-Card--rounded > section.bottom-actions.mp-Card-block.mp-Card-block--highlight > div.short-link > input").attr("value");
  car.imgs = [];

  // All car images
  $("#vip-image-viewer > div > img").each((i, data) => {
    car.imgs.push(data.attribs.src.replace("//", ""));
  });

  // Joining Categorie and value of car specs
  for (i in keys) {
    keys[i] = keys[i].replace(":", ""); // clean string
    car[keys[i]] = values[i];
  }

  // cleaning data to get an array of numbers. This helps the data procesing lateron.
  if (car.Kilometerstand != undefined) { car.Kilometerstand = car.Kilometerstand.replace(" km", "").replace(".", "") }
  if (car.Prijs != undefined) { car.Prijs = car.Prijs.replace("€ ", "").replace(",00", "").replace(".", "") }
  if (car.Vermogen != undefined) { car.Vermogen = car.Vermogen.replace(" pk", "") }

  newCarData(car)
}

async function addNewAdsToDB(newAds) {
  await generateFreshCarUrlIndex()
  if (dataBase === undefined) { dataBase = loadJsonFile("DB.json"); }
  for (na in newAds) {
    if (dataBase.index.url[newAds[na]] === undefined) {
      dataBase.queue.marktplaats.push(newAds[na]);
      console.log("Nieuwe advertentie")
    }
  }
  saveJsonFile("DB.json", dataBase);
}

async function generateFreshCarUrlIndex() {
  if (dataBase === undefined) { dataBase = loadJsonFile("DB.json"); } // make sure to load database

  dataBase.index.url = {}; // empty existing url index
  let arrayOfArrays = ["potential", "noGo", "toExpensive", "toManyKms", "duplicates", "toLitleWindows"]
  for (a in arrayOfArrays) {// generate car url index
    for (i in dataBase.cars[arrayOfArrays[a]]) {
      dataBase.index.url[dataBase.cars[arrayOfArrays[a]][i].url] = "" + [arrayOfArrays[a]] + "";
    }
  }
  dataBase.index.kenteken = {}; // empty existing kenteken index
  for (a in arrayOfArrays) {// generate car kenteken index
    for (i in dataBase.cars[arrayOfArrays[a]]) {
      dataBase.index.kenteken[dataBase.cars[arrayOfArrays[a]][i].Kenteken] = "" + [arrayOfArrays[a]] + "";
    }
  }
  return;
}

function removeDuble() {
  //Does it remove both versions of the duplicat? maybe not because of the splice removind the fire found duplicat from the array.
  // All scripts with Splice in a forloop must run several times until it has no matches anumore. Splice removes the one from the array but the for loop does not redo that nbr "i"
  if (dataBase === undefined) { dataBase = loadJsonFile("DB.json"); }
  let arrayOfArrays = ["noGo", "toExpensive", "toManyKms"]
  for (a in arrayOfArrays) {
    console.log(arrayOfArrays[a] + ": " + dataBase.cars[arrayOfArrays[a]].length);
    let duplicatCounter = 0;
    for (i in dataBase.cars[arrayOfArrays[a]]) {
      for (o in dataBase.cars[arrayOfArrays[a]]) {
        if (i == o) { continue; }
        if (dataBase.cars[arrayOfArrays[a]][i].url == dataBase.cars[arrayOfArrays[a]][o].url) {
          // console.log(i + " - " + o);
          console.log("A: " + dataBase.cars[arrayOfArrays[a]][i].url);
          console.log("B: " + dataBase.cars[arrayOfArrays[a]][o].url);
          dataBase.cars[arrayOfArrays[a]][o].url
          let removed = dataBase.cars[arrayOfArrays[a]].splice(o, 1);
          console.log("duplicat found: " + removed[0].Kenteken);
          duplicatCounter++
        }
      }
    }
    console.log(arrayOfArrays[a] + ": " + dataBase.cars[arrayOfArrays[a]].length);
    console.log("dubplicat removed: " + duplicatCounter);
  }
  saveJsonFile("DB.json", dataBase);
}

let fisrtTime = true;
let runAmount;
function loopThrougAdQueue() {
  if (fisrtTime) {
    if (dataBase === undefined) { dataBase = loadJsonFile("DB.json"); }
    runAmount = dataBase.queue.marktplaats.length;
    var nextCar = dataBase.queue.marktplaats.pop();
    if (nextCar != undefined) {
      openMarkplaatsAdForScraping(nextCar)
    } else { console.log("- END OF QUEUE -") }
    fisrtTime = false;
  } else {
    console.log(dataBase.queue.marktplaats.length + " left in queue")
    runAmount--
    if (runAmount > 0) {
      while (simultaniousQueries < 10) {
        console.log("go for next add");
        var nextCar = dataBase.queue.marktplaats.pop();
        if (nextCar != undefined) {
          openMarkplaatsAdForScraping(nextCar);
        } else { console.log("- END OF QUEUE -") }
        simultaniousQueries++
      }
    } else if (runAmount == 0) {
      saveJsonFile("DB.json", dataBase);
    }
  }
}

function loadJsonFile(fileLocation) {
  return JSON.parse(fs.readFileSync(fileLocation));
}

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

function newCarData(car) {
  if (dataBase === undefined) { dataBase = loadJsonFile("DB.json"); }
  dataBase.cars.potential.push(car);
  if (car.Kenteken != undefined) {
    console.log(car.Kenteken);
  } else {
    console.log(car.url);
  }
  dataBase.index.url[car.url] = true;
  saveJsonFile("DB.json", dataBase);
}

console.log("=================>>>"); // indicates start of script
loopThrougAdQueue() // execute on queue