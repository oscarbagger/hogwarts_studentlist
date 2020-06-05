document.addEventListener("DOMContentLoaded", start);

const bloodData = "https://petlatkea.dk/2020/hogwarts/families.json";
const studentData = "https://petlatkea.dk/2020/hogwarts/students.json";

let studentList = [];
let bloodList = [];
let expelledList = [];
let showExpelled = false;

let systemHacked = false;
let removalTimer = 5000;
let pureBloods = [];

let activeInList = [];
let notActiveInList = [];

const settings = {
  filter: [],
  sortBy: null,
  sortDir: "asc",
};

const StudentObj = {
  DomElement: "",
  listname: "",
  firstname: "",
  lastname: "",
  middlename: "",
  nickname: "",
  image: "",
  gender: "",
  house: "",
  blood: "",
  prefect: false,
  inquisitor: false,
  expelled: false,
};

const MeObj = {
  DomElement: "",
  listname: "Oscar Bagger",
  firstname: "Oscar",
  lastname: "Bagger",
  middlename: "Nielsen",
  nickname: "",
  image: "bagger_o.png",
  gender: "Boy",
  house: "Slytherin",
  blood: "Pure-blood",
  prefect: false,
  inquisitor: false,
  expelled: false,
};

const template = document.querySelector("#templateStudent");
const singletemplate = document.querySelector("#templateSingle");
const main = document.querySelector("#studentList");
const tableInfo = document.querySelector("#tableInfo");
const sortButtons = document.querySelectorAll(".sortOption");
const filterPrefect = document.querySelector("#filters #prefect");
const filterInquisitor = document.querySelector("#filters #inquisitor");
const filterButtons = [filterPrefect, filterInquisitor];
const expelButton = document.querySelector("#filters #expelled");
const searchBar = document.querySelector("#searchBar input");
const houseFilter = document.querySelector("#filters #house");
const bloodFilter = document.querySelector("#filters #blood");
const genderFilter = document.querySelector("#filters #gender");
const filterSelectors = [houseFilter, bloodFilter, genderFilter];

let singleOpen = false;
// text in the searchbar
let searchInput = "";

function start() {
  loadJson();

  sortButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateSortType(this.dataset.sort);
      sortList();
    });
  });
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateFilter(this.value);
      updateList();
    });
  });
  expelButton.addEventListener("click", function () {
    showExpelled ? (showExpelled = false) : (showExpelled = true);
    console.log(showExpelled);
    updateList();
  });
  filterSelectors.forEach((f) => {
    f.addEventListener("change", function () {
      let val = this.options[this.selectedIndex].value;
      updateFilter(val);
      updateList();
    });
  });
  searchBar.addEventListener("input", function () {
    searchInput = searchBar.value.toLowerCase();
    updateList();
  });
}

async function loadJson() {
  const jsonData = await fetch(studentData);
  studentList = await jsonData.json();
  const JsonFamilyData = await fetch(bloodData);
  bloodList = await JsonFamilyData.json();
  prepareObjects(studentList);
}

function prepareObjects(jsonData) {
  studentList = jsonData.map(prepareObject);
  activeInList = studentList.slice(0);
  prepareImages();
  // save a list of pure bloods for later hacking
  pureBloods = studentList.filter((s) => s.blood == "Pure-blood");
  makeList();
}

function prepareImages() {
  studentList.forEach((student) => {
    student.image = getStudentImage(student.firstname, student.lastname);
  });
}

function prepareObject(jsonObject) {
  let student = Object.create(StudentObj);

  let nameArr = jsonObject.fullname.trim().split(" ");

  // set first name and remove from array
  student.firstname = capitalizeText(nameArr[0]);
  nameArr.shift();
  // set last name  and remove from array
  if (nameArr.length > 0) {
    student.lastname = capitalizeText(nameArr[nameArr.length - 1]);
    nameArr.pop();
  }
  // look for nickname and remove from array
  if (nameArr.length > 0) {
    nameArr.forEach((n) => {
      if (n.includes('"')) {
        student.nickname = capitalizeText(n);
        let index = nameArr.indexOf(n);
        nameArr.splice(index, 1);
      }
    });
  }
  // look for middle names and remove from array
  if (nameArr.length > 0) {
    let midName = "";
    nameArr.forEach((n) => {
      midName += n;
    });
    student.middlename = midName;
  }
  student.listname = student.firstname + " " + student.lastname;
  student.house = capitalizeText(jsonObject.house);
  student.gender = capitalizeText(jsonObject.gender);
  student.blood = getBloodStatus(student.lastname);
  return student;
}

function getStudentImage(firstName, lastName) {
  let lastNamePart = lastName;
  let firstNamePart = firstName.charAt(0).toLowerCase();
  // if you dont have a last name then fuck off Leanne, your picture isnt there anyway
  if (lastName == "") {
    return "";
  }
  // last name not unique, modify firstnamepart
  let uniqueLastNames = [];
  let notUniqueLastnames = [];
  studentList.forEach((s) => {
    if (uniqueLastNames.includes(s.lastname)) {
      notUniqueLastnames.push(s.lastname);
    } else {
      uniqueLastNames.push(s.lastname);
    }
  });
  if (notUniqueLastnames.includes(lastName)) {
    firstNamePart = firstName.toLowerCase();
  }
  // if name includes hyphen modify lastnamepart
  if (lastName.includes("-")) {
    let hyphenPlacement = lastName.indexOf("-");
    lastNamePart = lastName.toLowerCase().slice(hyphenPlacement + 1);
  }
  // standard name
  let imgName = lastNamePart.toLowerCase() + "_" + firstNamePart + ".png";

  return imgName;
}

function getBloodStatus(name) {
  if (bloodList.half.includes(name)) {
    return "Half-blood";
  } else if (bloodList.pure.includes(name)) {
    return "Pure-blood";
  } else {
    return "Muggle";
  }
}

function capitalizeText(myString) {
  let string = myString.toLowerCase().trim().replace(/"/g, "");
  if (string.includes("-")) {
    let hyphenPlacement = string.indexOf("-");
    return (
      string.charAt(0).toUpperCase() +
      string.slice(1, hyphenPlacement) +
      "-" +
      string.charAt(hyphenPlacement + 1).toUpperCase() +
      string.slice(hyphenPlacement + 2)
    );
  } else {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

function makeList() {
  main.innerHTML = "";
  activeInList.forEach((s) => {
    makeStudentElement(s);
  });
  updatetableInfo();
}

function combineName(student) {
  let nameCombine =
    student.firstname +
    " " +
    student.middlename +
    " " +
    '"' +
    student.nickname +
    '"' +
    " " +
    student.lastname;
  return nameCombine.replace(/  /g, " ").replace(/""/g, "");
}

function makeSingle(student) {
  if (singleOpen == false) {
    singleOpen = true;
    let clone = singletemplate.cloneNode(true).content;
    clone.querySelector(".name").textContent = combineName(student);
    clone.querySelector(".picture").src = "images/" + student.image;
    clone.querySelector(".house").src = "images/" + student.house + ".jpg";
    clone.querySelector(".gender").textContent = student.gender;
    clone.querySelector(".blood").textContent = student.blood;

    clone.querySelector("#singleContent").dataset.house = student.house;
    if (student.inquisitor) {
      clone.querySelector("#inquisitorButton").value = "Remove inquisitor";
      clone.querySelector(".inquisitor").textContent = "Inquisitor";
    } else {
      clone.querySelector("#inquisitorButton").value = "Make inquisitor";
    }
    if (student.prefect) {
      clone.querySelector("#prefectButton").value = "Remove prefect";
      clone.querySelector(".prefect").textContent = "Prefect";
    } else {
      clone.querySelector("#prefectButton").value = "Make prefect";
    }
    document.querySelector("main").appendChild(clone);
    let el = document.querySelector("main").lastElementChild;

    el.querySelector("#singleClose").addEventListener("click", function () {
      singleOpen = false;
      el.remove();
    });
    // remove action buttons if student is expelled
    if (student.expelled) {
      el.querySelector("#prefectButton").remove();
      el.querySelector("#inquisitorButton").remove();
      el.querySelector("#expelButton").remove();
      el.querySelector("#isExpelled").textContent = "Student has been expelled";
    } else {
      el.querySelector("#prefectButton").addEventListener("click", () => {
        if (student.prefect) {
          changePrefectStatus(student);
          el.querySelector("#prefectButton").value = "Make prefect";
          el.querySelector(".prefect").textContent = "";
        } else {
          if (canBecomePrefect(student)) {
            changePrefectStatus(student);
            el.querySelector("#prefectButton").value = "Remove prefect";
            el.querySelector(".prefect").textContent = "Prefect";
          } else {
            el.querySelector(".prefectError").textContent = "Too many prefects";
          }
        }
      });
      if (student.house == "Slytherin" || student.blood == "Pure-blood") {
        el.querySelector("#inquisitorButton").addEventListener("click", () => {
          if (changeInquisitorStatus(student)) {
            el.querySelector("#inquisitorButton").value = "Remove inquisitor";
            el.querySelector(".inquisitor").textContent = "Inquisitor";
            if (systemHacked) {
              setInquisitorTimer(student);
            }
          } else {
            el.querySelector("#inquisitorButton").value = "Make inquisitor";
            el.querySelector(".inquisitor").textContent = "";
          }
        });
      } else {
        el.querySelector("#inquisitorButton").remove();
        el.querySelector(".inquisitorError").remove();
      }

      el.querySelector("#expelButton").addEventListener("click", function () {
        if (student.expelled == false && student.listname != "Oscar Bagger") {
          expelStudent(student);
          singleOpen = false;
          el.remove();
        } else {
          el.querySelector(".expelError").textContent = "Cant expel me!";
        }
      });
    }
  }
}

function makeStudentElement(student) {
  let clone = template.cloneNode(true).content;

  clone.querySelector(".studentItem").dataset.name = student.listname;
  clone.querySelector(".firstname").textContent = student.firstname;
  clone.querySelector(".lastname").textContent = student.lastname;
  clone.querySelector(".gender").textContent = student.gender;
  clone.querySelector(".house").textContent = student.house;
  clone.querySelector(".blood").textContent = student.blood;
  if (student.prefect) {
    clone.querySelector(".prefect").textContent = "✓";
  }
  if (student.inquisitor) {
    clone.querySelector(".inquisitor").textContent = "✓";
  }
  if (student.image != undefined) {
    clone.querySelector(".picture").src = "images/" + student.image;
  }
  main.appendChild(clone);
  student.DomElement = main.lastElementChild;
  main.lastElementChild.addEventListener("click", function () {
    makeSingle(student);
  });
}

function matchesSearch(student) {
  let nameSearch = student.listname.toLowerCase();
  if (nameSearch.includes(searchInput)) {
    return true;
  } else return false;
}

function updateSortType(type) {
  if (settings.sortBy == type) {
    if (settings.sortDir == "asc") {
      settings.sortDir = "desc";
    } else {
      settings.sortDir = "asc";
    }
  } else {
    settings.sortDir = "asc";
  }
  settings.sortBy = type;
}

function removeHouseFilters() {
  if (settings.filter.includes("gryffindor")) {
    let i = settings.filter.indexOf("gryffindor");
    settings.filter.splice(i, 1);
  }
  if (settings.filter.includes("hufflepuff")) {
    let i = settings.filter.indexOf("hufflepuff");
    settings.filter.splice(i, 1);
  }
  if (settings.filter.includes("ravenclaw")) {
    let i = settings.filter.indexOf("ravenclaw");
    settings.filter.splice(i, 1);
  }
  if (settings.filter.includes("slytherin")) {
    let i = settings.filter.indexOf("slytherin");
    settings.filter.splice(i, 1);
  }
}
function removeBloodFilters() {
  if (settings.filter.includes("pure-blood")) {
    let i = settings.filter.indexOf("pure-blood");
    settings.filter.splice(i, 1);
  }
  if (settings.filter.includes("half-blood")) {
    let i = settings.filter.indexOf("half-blood");
    settings.filter.splice(i, 1);
  }
  if (settings.filter.includes("muggle")) {
    let i = settings.filter.indexOf("muggle");
    settings.filter.splice(i, 1);
  }
}
function removeGenderFilters() {
  if (settings.filter.includes("boy")) {
    let i = settings.filter.indexOf("boy");
    settings.filter.splice(i, 1);
  }
  if (settings.filter.includes("girl")) {
    let i = settings.filter.indexOf("girl");
    settings.filter.splice(i, 1);
  }
}

function updateFilter(type) {
  // removing house type filter
  if (type == "house-all") {
    removeHouseFilters();
    return;
  }
  // removing blood type filter
  if (type == "blood-all") {
    removeBloodFilters();
    return;
  }
  // removing blood type filter
  if (type == "gender-all") {
    removeGenderFilters();
    return;
  }
  // changing house type filter
  if (
    type == "gryffindor" ||
    type == "hufflepuff" ||
    type == "ravenclaw" ||
    type == "slytherin"
  ) {
    removeHouseFilters();
    settings.filter.push(type);
    return;
  }
  // changing blood type filter
  if (type == "pure-blood" || type == "half-blood" || type == "muggle") {
    removeBloodFilters();
    settings.filter.push(type);
    return;
  }
  // changing gender type filter
  if (type == "boy" || type == "girl") {
    removeGenderFilters();
    settings.filter.push(type);
    return;
  }
  // if filter empty, add type to filter
  if (settings.filter.length == 0) {
    settings.filter.push(type);
  }
  // if type is already in filter, remove it
  else if (settings.filter.includes(type)) {
    let i = settings.filter.indexOf(type);
    settings.filter.splice(i, 1);
  }
  //if type is not in filter then add it
  else {
    settings.filter.push(type);
  }
}

function updateList() {
  while (activeInList.length > 0) {
    activeInList.pop();
  }
  let filteringList = [];
  if (showExpelled) {
    filteringList = expelledList.slice(0);
  } else {
    filteringList = studentList.slice(0);
  }

  // push student to the active list of they match filter criteria
  filteringList.forEach((s) => {
    if (passFilterCriteria(s)) {
      activeInList.push(s);
    }
  });
  // filter by searchinput
  activeInList = activeInList.filter(matchesSearch);
  // make the new list and update its info
  makeList();
}

function dynamicSort(property) {
  return function (a, b) {
    // if boolean, then reverse the process to make true come first in the list
    if (typeof a[property] == "boolean") {
      var result =
        a[property] > b[property] ? -1 : a[property] < b[property] ? 1 : 0;
      return result;
    } else {
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result;
    }
  };
}

function sortList() {
  if (systemHacked) {
    randomizePureBloods();
  }
  activeInList.sort(dynamicSort(settings.sortBy));
  // reverse it afterwards if descending
  if (settings.sortDir == "desc") {
    activeInList.reverse();
  }
  makeList();
}

function updatetableInfo() {
  let studentItems = main.querySelectorAll(".studentItem");
  if (showExpelled) {
    tableInfo.querySelector(".studentNumbers").textContent =
      activeInList.length + "/" + expelledList.length + " student(s) shown";
  } else {
    tableInfo.querySelector(".studentNumbers").textContent =
      activeInList.length + "/" + studentList.length + " student(s) shown";
  }
  tableInfo.querySelector(".expelledNumbers").textContent =
    expelledList.length + " student(s) expelled";
  let gryffindor = 0;
  let hufflepuff = 0;
  let ravenclaw = 0;
  let slytherin = 0;
  studentList.forEach((s) => {
    switch (s.house) {
      case "Gryffindor":
        gryffindor++;
        break;
      case "Hufflepuff":
        hufflepuff++;
        break;
      case "Ravenclaw":
        ravenclaw++;
        break;
      case "Slytherin":
        slytherin++;
        break;
      default:
        break;
    }
  });
  tableInfo.querySelector(".houseNumbers").textContent =
    "Gryffindor: " +
    gryffindor +
    ", Hufflepuff: " +
    hufflepuff +
    ", Ravenclaw: " +
    ravenclaw +
    ", Slytherin: " +
    slytherin;
}

function passFilterCriteria(student) {
  if (settings.filter.length == 0) {
    return true;
  }
  let matches = 0;
  // how many filters it needs to match with
  let matchesNeeded = settings.filter.length;

  if (settings.filter.includes("gryffindor") && student.house == "Gryffindor") {
    matches++;
  }
  if (settings.filter.includes("hufflepuff") && student.house == "Hufflepuff") {
    matches++;
  }
  if (settings.filter.includes("ravenclaw") && student.house == "Ravenclaw") {
    matches++;
  }
  if (settings.filter.includes("slytherin") && student.house == "Slytherin") {
    matches++;
  }
  if (settings.filter.includes("pure-blood") && student.blood == "Pure-blood") {
    matches++;
  }
  if (settings.filter.includes("half-blood") && student.blood == "Half-blood") {
    matches++;
  }
  if (settings.filter.includes("muggle") && student.blood == "Muggle") {
    matches++;
  }
  if (settings.filter.includes("boy") && student.gender == "Boy") {
    matches++;
  }
  if (settings.filter.includes("girl") && student.gender == "Girl") {
    matches++;
  }
  if (settings.filter.includes("prefect") && student.prefect == true) {
    matches++;
  }
  if (settings.filter.includes("inquisitor") && student.inquisitor == true) {
    matches++;
  }
  // if all values of the filter has matched with a value from student, return true
  if (matches == matchesNeeded) {
    return true;
  } else {
    return false;
  }
}

function canBecomePrefect(student) {
  let prefectList = studentList.filter((s) => s.prefect);
  let sameHousePrefects = 0;
  prefectList.forEach((s) => {
    if (student.house == s.house) {
      sameHousePrefects++;
    }
  });
  return sameHousePrefects < 2 ? true : false;
}

function changePrefectStatus(student) {
  if (student.prefect) {
    student.prefect = false;
    student.DomElement.querySelector(".prefect").textContent = "";
    return false;
  } else {
    student.prefect = true;
    student.DomElement.querySelector(".prefect").textContent = "✓";
    return true;
  }
  return false;
}

function changeInquisitorStatus(student) {
  if (student.inquisitor) {
    student.inquisitor = false;
    student.DomElement.querySelector(".inquisitor").textContent = "";
    return false;
  } else {
    student.inquisitor = true;
    student.DomElement.querySelector(".inquisitor").textContent = "✓";
    return true;
  }
  return false;
}

function expelStudent(student) {
  student.expelled = true;
  student.inquisitor = false;
  student.prefect = false;
  let index = studentList.indexOf(student);
  studentList.splice(index, 1);
  let activeIndex = activeInList.indexOf(student);
  activeInList.splice(activeIndex, 1);

  expelledList.push(student);
  student.DomElement.classList.add("minimize");
  student.DomElement.addEventListener("animationend", () => {
    student.DomElement.remove();
  });
  updatetableInfo();
}

function hackTheSystem() {
  if (systemHacked == false) {
    let me = Object.create(MeObj);
    studentList.push(me);
    studentList.forEach((s) => {
      if (s.inquisitor) {
        setInquisitorTimer(s);
      }
    });
    hackBloodStatus();
    updateList();
    systemHacked = true;
  } else {
    console.log("System has already been hacked");
  }
}

function hackBloodStatus() {
  studentList.forEach((s) => {
    if (s.blood != "Pure-blood") {
      s.blood = "Pure-blood";
    }
  });
  randomizePureBloods();
}

function randomizePureBloods() {
  activeInList.forEach((p) => {
    if (pureBloods.includes(p)) {
      let randomize = Math.floor(Math.random() * 3);
      switch (randomize) {
        case 0:
          p.blood = "Muggle";
          break;
        case 1:
          p.blood = "Half-blood";
          break;
        case 2:
          p.blood = "Pure-blood";
          break;
      }
    }
  });
}

function setInquisitorTimer(s) {
  setTimeout(() => {
    s.inquisitor = false;
    s.DomElement.querySelector(".inquisitor").textContent = "";
    s.DomElement.classList.add("shake");
  }, removalTimer);
}
