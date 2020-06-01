document.addEventListener("DOMContentLoaded", start);

const bloodData = "https://petlatkea.dk/2020/hogwarts/families.json";
const studentData = "https://petlatkea.dk/2020/hogwarts/students.json";

let studentList = [];
let bloodList = [];
let expelledList = [];

let activeInList = [];
let notActiveInList = [];

const settings = {
  filter: null,
  sortBy: null,
  sortDir: "asc",
};

// student prototype
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
  inqiusitor: false,
  expelled: false,
};

const template = document.querySelector("template");
const single = document.querySelector("#singleView");
const main = document.querySelector("#studentList");
const tableInfo = document.querySelector("#tableInfo");
const searchBar = document.querySelector("#searchBar input");

let singleOpen = false;
// text in the searchbar
let searchInput = "";

function start() {
  loadJson();
  /* single.addEventListener("click", () => {
    if (singleOpen == true) {
      single.style.display = "none";
      singleOpen = false;
    }
  }); */
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
  prepareImages();
  console.log(studentList);
  ShowList();
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
    firstNamePart = firstName;
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

function ShowList() {
  studentList.forEach((s) => {
    makeStudentElement(s);
  });
  updatetableInfo();
}

function showSingle(student) {
  if (singleOpen == false) {
    single.style.display = "block";
    singleOpen = true;
    single.querySelector(".picture").src = "/images/" + student.image;
    single.querySelector(".name").textContent = student.listname;
    single.querySelector(".house").textContent = student.house;
    single.querySelector(".gender").textContent = student.gender;
    single.querySelector(".blood").textContent = student.blood;
    single.querySelector(".prefect").textContent = student.prefect;
    single.querySelector(".inquisitor").textContent = student.inqiusitor;
    single.querySelector("#singleContent").dataset.house = student.house;
  }
}

function makeStudentElement(student) {
  activeInList.push(student);
  let clone = template.cloneNode(true).content;

  clone.querySelector(".studentItem").dataset.name = student.listname;
  clone.querySelector(".name").textContent = student.listname;
  clone.querySelector(".gender").textContent = student.gender;
  clone.querySelector(".house").textContent = student.house;
  clone.querySelector(".blood").textContent = student.blood;
  clone.querySelector(".prefect").textContent = student.prefect;
  clone.querySelector(".inquisitor").textContent = student.inqiusitor;
  if (student.image != undefined) {
    clone.querySelector(".picture").src = "/images/" + student.image;
  }
  main.appendChild(clone);
  student.DomElement = main.lastElementChild;
  main.lastElementChild.addEventListener("click", function () {
    showSingle(student);
  });
}

function matchesSearch(student) {
  let nameSearch = student.listname.toLowerCase();
  if (nameSearch.includes(searchInput)) {
    return true;
  } else return false;
}

function updateList() {
  let removeFromList = [];
  let addToList = [];

  // filter by searchinput

  activeInList = activeInList.filter(matchesSearch);

  // remove students from list
  removeFromList.forEach((s) => {
    s.DomElement.classList.add("minimize");
    s.DomElement.addEventListener("animationend", () => {
      s.DomElement.remove();
    });
  });
  // add students to list
  addToList.forEach((s) => {
    makeStudentElement(s);
  });
  updatetableInfo();
}

function updatetableInfo() {
  tableInfo.querySelector(".studentNumbers").textContent =
    activeInList.length + "/" + studentList.length + " students shown";
  tableInfo.querySelector(".expelledNumbers").textContent =
    expelledList.length + " students expelled";
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
