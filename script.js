const allPersons = document.getElementById("persons");
const personNames = Array.from(allPersons.options).map(option => option.value).slice(1);

console.log(personNames);

const busyTimings = {
    "john": {
        "2024-02-16": ["10am", "11am", "1pm", "2pm"],
        "2024-02-17": ["5am", "9am", "7pm", "10pm"],
        "2024-02-18": ["6am", "11am", "12pm", "1pm"]
    },
    "alice": {
        "2024-02-16": ["10am", "11am", "3pm"],
        "2024-02-17": ["8am", "1pm", "3pm"],
        "2024-02-18": ["10am", "12pm", "2pm"]
    },
    "bob": {
        "2024-02-16": ["12pm", "1pm", "2pm"],
        "2024-02-17": ["4am", "6am", "8pm"],
        "2024-02-18": ["9am", "10am", "11am"]
    },
    "jack": {
        "2024-02-16": ["11pm", "5pm", "9pm"],
        "2024-02-17": ["7am", "11am", "4pm"],
        "2024-02-18": ["11am", "4pm", "6pm"]
    }
};

console.log(Object.keys(busyTimings));
console.log(busyTimings["john"]);
console.log(busyTimings.hasOwnProperty("john"));
console.log(busyTimings["john"].hasOwnProperty("2024-02-16"));
console.log(busyTimings["john"]["2024-02-16"].includes("9am"));


var allTasks = JSON.parse(localStorage.getItem("allTasks")) || [];
allTasks.forEach(task => displayTaskAsCard(task));

console.log(allTasks);

document.querySelector(".category").addEventListener("click", function(event) {

    const groups=document.querySelectorAll(".group1");
    if (event.target.tagName === "INPUT" && event.target.value === "remainders") {
        groups.forEach(group =>
            group.style.display="flex"
        );

    } else {
        groups.forEach(group =>
            group.style.display="none"
        );
    }
});

document.querySelector(".clear-form").addEventListener("click",function(){
    document.getElementById("myForm").reset();
});

document.querySelector(".clear-btn").addEventListener("click", function() {
    const taskList = document.querySelector(".display-box");
    taskList.innerHTML = "";
    localStorage.clear();
    allTasks=[];
});


document.getElementById("myForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const inputBox = document.querySelector(".task-title input");
    const textAreaa = document.querySelector(".task-description textarea");
    if (inputBox.value.trim() === "") {
        alert("Title cant be blank...");
        return;
    }

    if(inputBox.value.trim().length>25){
        alert("Title cant be soo long...");
        return;
    }

    if (textAreaa.value.trim() === "") {
        alert("Add description too...");
        return;
    }

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    const category = data.category;

    console.log(data.date);

    if (!category) {
        alert("Select the category...");
        return;
    }

    if (category === "notes") {

        const task = {
            title: data.title,
            description: data.description,
            category: category,
            completed: false
        };

        allTasks.push(task);
        displayTaskAsCard(task);
    } else if (category === "remainders") {

        const persons = Array.from(formData.getAll("persons"));
        console.log(persons);


        if (!data.meeting) {
            alert("Select the meeting type...");
            return;
        }

        if (data.meeting == "personal" && persons.length == 0) {
            alert("Select the person as well..");
            return;
        }

        if(data.meeting == "personal" && persons.length>1){
            alert("Personal Meeting is for only person, select Group Meeting for multiple persons...");
            return;
        }

        if (data.meeting == "group" && persons.length <= 1) {
            alert("Select at least 2 persons...");
            return;
        }

        if (!data.date) {
            alert("Select the date...");
            return;
        }

        if (!data.time) {
            alert("Select the time too..");
            return;
        }
        if (!data["am-pm"]) {
            alert("Select if its AM or PM");
            return;
        }

        const hour = data.time;
        const timeType=data["am-pm"];
        const timeTypeL = timeType.toLowerCase();
        const mergedTime=hour+""+timeTypeL;
        const dateS=data.date.toString();
        const arrayNames =  [];
        persons.forEach(person => {
            arrayNames.push(person.toLowerCase());
        });

        console.log(typeof mergedTime);



        let busyPeople=[];
        for(let i=0;i<persons.length;i++){
            
            let name=persons[i].toLowerCase();
            console.log(name);
            console.log(busyTimings[name].hasOwnProperty(dateS) && busyTimings[name][dateS].includes(mergedTime));

            console.log(mergedTime);
            if(busyTimings[name].hasOwnProperty(dateS) && busyTimings[name][dateS].includes(mergedTime)){
                busyPeople.push(persons[i]);
            }

        }
        console.log(persons);
        console.log(busyPeople);

        if(busyPeople.length>0){
            const busyName=busyPeople[0].toLowerCase();
            alert("Oops... "+busyPeople+" is busy at the selected time slot");
            const availabilityList=document.querySelector(".avail-list");
            availabilityList.innerHTML='';
            const ourBusyTimings=[];
            const personBusyTimings=busyTimings[busyName][dateS];
            allTasks.forEach(task=> {
                if(task.date===data.date){
                    const tempTime=task.time.split(" ");
                    const tempHours=parseInt(tempTime[0],10);
                    ourBusyTimings.push(tempHours+""+task.timeType.toLowerCase());
                }
            });
            console.log(ourBusyTimings);
            console.log(personBusyTimings);

            const allTimeSlots = [];
            for (let hour = 4; hour <= 12; hour++) {
                allTimeSlots.push(hour + "am");
            }
            for (let hour = 1; hour <= 10; hour++) {
                allTimeSlots.push(hour + "pm");
            }

            const excludedTimings = [...ourBusyTimings, ...personBusyTimings];

            const freeTimings = allTimeSlots.filter(timeSlot => !excludedTimings.includes(timeSlot));
            console.log("Free Timings:", freeTimings);

            const displayDiv=document.createElement("div");
            displayDiv.innerHTML=`<h3>Timings at both you and ${busyName} are free: </h3><br><p>${freeTimings.join(", ")}</p>`;
            availabilityList.appendChild(displayDiv);

            return;
        }

        const people=[];

        
        const overlappingTask = allTasks.find(task => {
            if (task.category === "remainders" && task.date === data.date) {
                
                const taskTimeParts = task.time.split(":");
                const taskHour = parseInt(taskTimeParts[0], 10);
                const tasktimeType = task.timeType;


                console.log(typeof taskHour);
                console.log(typeof hour);
                console.log(typeof timeType);
                console.log(typeof tasktimeType);

                console.log((taskHour == hour) && timeType===tasktimeType);
                
                if((taskHour == hour) && timeType===tasktimeType){

                    people.push(task.persons);
                }
                
                return (taskHour == hour) && timeType===tasktimeType;
            }
            return false;
        });

        console.log(overlappingTask);

        console.log(people);

        if (overlappingTask) {
            const allPeople=people.join(",");
            alert("Another meeting is already scheduled for the same time on this date for "+allPeople);
            return;
        }



        const task = {
            title: data.title,
            description: data.description,
            category: category,
            meeting: data.meeting,
            date: data.date,
            time: data.time + " " + data["am-pm"],
            timeType:data["am-pm"],
            persons: persons,
            completed: false
        };

        allTasks.push(task);
        displayTaskAsCard(task);
    }
    this.reset();
    storeTasks();
});

function storeTasks() {
    localStorage.setItem("allTasks", JSON.stringify(allTasks));
}


function displayTaskAsCard(task) {
    const card = document.createElement("li");
    card.classList.add("check");
    card.innerHTML = `
        <input type="checkbox">
        <div class="box-div">
            <h3>${task.title}</h3>
            <br>
            <p><b>Description : </b>${task.description}</p>
            ${task.category === "remainders" ? `
                    <p><b>Type : </b>${task.meeting} Meeting</p>
                    <p><b>Date: </b>${task.date}</p>
                    <p><b>Time: </b>${task.time}</p>
                    <p><b>Persons: </b>${task.persons.join(", ")}</p>
                ` : ''}
        </div>
        <span class="remove-task">❌</span>
    `;
    const checkbox = card.querySelector("input[type='checkbox']");
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", function(event) {
        const taskIndex = Array.from(event.target.closest(".check").parentElement.children).indexOf(event.target.closest(".check"));
        allTasks[taskIndex].completed = event.target.checked;
        console.log(event.target.checked);
        if(event.target.checked){
            card.querySelector(".box-div").style.backgroundColor = "#d5fed1";
        }
        else{
            card.querySelector(".box-div").style.backgroundColor = "#f3bfbf";
        }
        storeTasks();
    });
    
    if (task.completed) {
        card.querySelector(".box-div").style.backgroundColor = "#d5fed1";
    } else {
        card.querySelector(".box-div").style.backgroundColor = "#ff9999";
    }
    document.querySelector(".display-box").appendChild(card);
}

document.querySelector(".display-box").addEventListener("click", function(event) {   // ----------------->>> when hit cross
    if (event.target.classList.contains("remove-task")) {
        const taskIndex = Array.from(event.target.closest(".check").parentElement.children).indexOf(event.target.closest(".check"));
        event.target.parentElement.remove();
        allTasks.splice(taskIndex,1);
        storeTasks();
    }
});


document.querySelector(".filters").addEventListener("click", function(event) {
    if (event.target.tagName === "SPAN") {
        document.querySelectorAll(".filters span").forEach(span => span.classList.remove("active"));
        event.target.classList.add("active");
        filterTasks(event.target.id);
    }
});

function filterTasks(filter) { //ok
    const tasks = document.querySelectorAll(".display-box li");
    tasks.forEach(task => {
        switch (filter) {
            case "upcoming":
                task.style.display = task.querySelector("input").checked ? "none" : "flex";
                break;
            case "completed":
                task.style.display = task.querySelector("input").checked ? "flex" : "none";
                break;
            default:
                task.style.display = "flex";
        }
    });
}



document.addEventListener("DOMContentLoaded", function() {
    const dtToday = new Date();
    const month = (dtToday.getMonth() + 1).toString().padStart(2, '0');
    const day = dtToday.getDate().toString().padStart(2, '0');
    const year = dtToday.getFullYear();

    const maxDate = `${year}-${month}-${day}`;

    const dateInput = document.getElementById('date');
    dateInput.setAttribute('min', maxDate);
});