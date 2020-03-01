document.addEventListener("DOMContentLoaded", start);

const template = document.querySelector("template");
const single = document.querySelector("#singleView");
const main = document.querySelector("#studentList");
var studentList;

var singleOpen = false;

const settings = {
  filter: null,
  sortBy: null,
  sortDir: "asc"
};

// student prototype
const Student = {
  fullName: "",
  gender: "",
  house: ""
};

function start() {
  loadJson();
}

async function loadJson() {
  const jsonData = await fetch(
    "https://petlatkea.dk/2020/hogwarts/students.json "
  );
  studentList = await jsonData.json();

  ShowList();

  single.addEventListener("click", () => {
    if (singleOpen) {
      single.style.display = "none";
      singleOpen = false;
    }
  });
}

function PrepareObjects() {}

function ShowList() {
  studentList.forEach(student => {
    console.log(student.fullname);
    let clone = template.cloneNode(true).content;

    clone.querySelector(".name").textContent = student.fullname;
    clone.querySelector(".house").textContent = student.house;

    main.appendChild(clone);
    main.lastElementChild.addEventListener("click", () => {
      // show more info
      if (singleOpen == false) {
        single.style.display = "block";
        singleOpen = true;
        single.querySelector(".name").textContent = student.fullname;
        single.querySelector(".house").textContent = student.house;
      }
    });
  });
}
