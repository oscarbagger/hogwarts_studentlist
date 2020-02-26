document.addEventListener("DOMContentLoaded", GetJson);

const template=document.querySelector("template");
const single=document.querySelector("#singleView");
const main=document.querySelector("#studentList");
var studentList;

var singleOpen=false;

async function GetJson()
{
    const jsonData = await fetch("https://oscarbagger.com/kea/studentlist/students1991.json");
    studentList=await jsonData.json();
    console.log(studentList);
    ShowList();
    single.addEventListener("click", ()=> {
        if (singleOpen) {
            single.style.display="none";
            singleOpen=false;
        }
    })
}

function ShowList()
{
    studentList.forEach(student => {
        console.log(student.fullname);
        let clone=template.cloneNode(true).content;
        
        clone.querySelector(".name").textContent=student.fullname;
        clone.querySelector(".house").textContent=student.house;
        
        main.appendChild(clone);
        main.lastElementChild.addEventListener("click",() => {
            // show more info
            if(singleOpen==false)  {
                single.style.display="block";
                singleOpen=true;
                single.querySelector(".name").textContent=student.fullname;
                single.querySelector(".house").textContent=student.house;
                }
        });
    })
}