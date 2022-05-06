const express = require('express')
const app = express()
const port = 4000
const fetch = require('node-fetch');
var compression = require('compression');
const res = require('express/lib/response');

app.use(compression()); //use compression to speed things up 

//SWAPI-DEV API
const PEOPLE_URL = "https://swapi.dev/api/people/";
const PLANETS_URL = "https://swapi.dev/api/planets/";
const ALLOWED_REQ1 = "mass";
const ALLOWED_REQ2 = "name";
const ALLOWED_REQ3 = "height";

app.get('/people', async (req, res) => {

  var sortByPassedIn = req.query.sortBy;

  try {
    var peopleResults = await getPeople();
    if (sortByPassedIn !== undefined && sortByPassedIn !== null) {
      sortByPassedIn = sortByPassedIn.toLowerCase();
      if (sortByPassedIn == ALLOWED_REQ1) {
        peopleResults.sort(compareMass);
      }
      else if (sortByPassedIn == ALLOWED_REQ2) {
        peopleResults.sort(compareName);
      }
      else if (sortByPassedIn == ALLOWED_REQ3) {
        peopleResults.sort(compareHeight);
      }
    }
    res.send(peopleResults);
  } catch {
    console.log("FETCH FAILED FOR " + PEOPLE_URL + "::ENDPOINT");
  }

})

app.get('/planets', async (req, res) => {
  try {
    var planetResults = await getPlanets();
    res.send(planetResults)
  } catch {
    console.log("FETCH FAILED FOR " + PLANETS_URL + "::ENDPOINT");
  }

})

app.listen(port, async () => {
  console.log(`Challenge app listening on port ${port}`)
})



async function getPeople() {
  var paginatedResultArray = [];
  var response = await fetch(PEOPLE_URL);
  var data = await response.json();

  for (i = 0; i < Object.keys(data.results).length; i++) {
    let results = Object.values(data.results)[i]
    paginatedResultArray.push(results);

  }

  while (data.next !== undefined && data.next !== null) {
    var response = await fetch(data.next);
    var data = await response.json();
    for (i = 0; i < Object.keys(data.results).length; i++) {
      let results = Object.values(data.results)[i]
      paginatedResultArray.push(results);
    }
  }
  return paginatedResultArray;
}


async function getPlanets() {
  var paginatedResultArray = [];
  var response = await fetch(PLANETS_URL);
  var data = await response.json();

  for (i = 0; i < Object.keys(data.results).length; i++) {
    let nameFoundArray = [];
    let results = Object.values(data.results)[i]
    let residents = results.residents;
    if (residents !== null && residents !== undefined && residents.length != 0) {
      residents = JSON.stringify(residents);
      var myArrayURLs = residents.split(",");
      //save performance to declare loop amount
      looperAmount = myArrayURLs.length;
      for (c = 0; c < looperAmount; c++) {
        var removeQuotes = (myArrayURLs[c].replace(/[\]['"]+/g, ''));
        var response = await fetch(removeQuotes);
        var dataFomURL = await response.json();
        let results = dataFomURL["name"];
        nameFoundArray.push(results);
      }
    }
    results.residents = nameFoundArray;
    paginatedResultArray.push(results);
  }

  while (data.next !== undefined && data.next !== null) {
    var response = await fetch(data.next);
    var dataBottomLoop = await response.json();
    for (i = 0; i < Object.keys(dataBottomLoop.results).length; i++) {
      let nameFoundArray = [];
      let results = Object.values(dataBottomLoop.results)[i]
      let residents = results.residents;
      if (residents !== null && residents !== undefined && residents.length != 0) {
        residents = JSON.stringify(residents);
        var myArrayURLs = residents.split(",");
        //save performance to declare loop amount
        looperAmount = myArrayURLs.length;
        for (a = 0; a < looperAmount; a++) {
          var removeQuotes = (myArrayURLs[a].replace(/[\]['"]+/g, ''));
          var response = await fetch(removeQuotes);
          var dataFomURL = await response.json();
          let results = dataFomURL["name"];
          nameFoundArray.push(results);
        }
      }
      results.residents = nameFoundArray;
      paginatedResultArray.push(results);
      data.next = dataBottomLoop.next;
    }
  }
  return paginatedResultArray;
}

function compareName(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}
function compareHeight(a, b) {
  var newValueA = a.height.replace(/\,/g, '')
  var newValueB = b.height.replace(/\,/g, '')
  if (newValueA == 'unknown') {
    newValueA = 0;
  }
  if (newValueB == 'unknown') {
    newValueB = 0;
  }
  newValueA = parseFloat(newValueA);
  newValueB = parseFloat(newValueB);
  if (newValueA < newValueB) {
    return -1;
  }
  if (newValueA > newValueB) {
    return 1;
  }
  return 0;
}
function compareMass(a, b) {
  var newValueA = a.mass.replace(/\,/g, '')
  var newValueB = b.mass.replace(/\,/g, '')
  if (newValueA == 'unknown') {
    newValueA = 0;
  }
  if (newValueB == 'unknown') {
    newValueB = 0;
  }
  newValueA = parseFloat(newValueA);
  newValueB = parseFloat(newValueB);
  if (newValueA < newValueB) {
    return -1;
  }
  if (newValueA > newValueB) {
    return 1;
  }
  return 0;
}
