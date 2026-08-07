const stats = [
    "Power",
    "Agility",
    "Dexterity",
    "Stamina",
    "Endurance"
];


// Get elements
const currentOVR = document.getElementById("currentOVR");
const targetOVR = document.getElementById("targetOVR");
const xpFill = document.getElementById("xpFill");
const neededOVR = document.getElementById("neededOVR");
const statGain = document.getElementById("statGain");


// Calculate required stats
function calculateOVR() {

    let current = Number(currentOVR.value);
    let target = Number(targetOVR.value);


    if (target < current) {
        target = current;
        targetOVR.value = current;
    }


    if (target > 120) {
        target = 120;
        targetOVR.value = 120;
    }


    let needed = target - current;

    // Every +1 OVR requires +10 stats
    let requiredStats = needed * 10;


    neededOVR.textContent = needed;
    statGain.textContent = requiredStats;


    let progress = (current / target) * 100;

    xpFill.style.width = progress + "%";
}



// Inputs update
currentOVR.addEventListener("input", calculateOVR);
targetOVR.addEventListener("input", calculateOVR);



// =======================
// COMPARE STATS
// =======================

const compareBtn = document.getElementById("compareBtn");
const compareResults = document.getElementById("compareResults");


compareBtn.addEventListener("click", () => {


    let statA = statASelect.value;
    let statB = statBSelect.value;


    let a = Number(prompt(`Enter ${statA} value:`));
    let b = Number(prompt(`Enter ${statB} value:`));


    if (isNaN(a) || isNaN(b)) {
        compareResults.innerHTML =
        "<p>Invalid stats</p>";
        return;
    }


    let result = "";


    if (a > b) {
        result = `${statA} is stronger by ${a-b} points`;
    }
    else if (b > a) {
        result = `${statB} is stronger by ${b-a} points`;
    }
    else {
        result = "Both stats are equal";
    }


    compareResults.innerHTML =
    `
    <div class="compare-card">
        <div class="cname">${statA} VS ${statB}</div>
        <div class="cfinal">${result}</div>
    </div>
    `;

});



// =======================
// SAVE BUILDS
// =======================

const saveBtn = document.getElementById("saveBuildBtn");
const buildName = document.getElementById("buildNameInput");
const historyList = document.getElementById("historyList");


function getHistory(){

    return JSON.parse(
        localStorage.getItem("fighterBuilds")
    ) || [];

}



function saveBuild(){


    let builds = getHistory();


    builds.push({

        name:
        buildName.value || "Unnamed Build",

        current:
        currentOVR.value,

        target:
        targetOVR.value,

        date:
        new Date().toLocaleString()

    });


    localStorage.setItem(
        "fighterBuilds",
        JSON.stringify(builds)
    );


    loadHistory();

    buildName.value="";

}



function loadHistory(){


    let builds = getHistory();


    if(builds.length === 0){

        historyList.innerHTML =
        `
        <div class="placeholder-note">
        No builds saved yet.
        </div>
        `;

        return;
    }


    historyList.innerHTML="";


    builds.forEach((build,index)=>{


        historyList.innerHTML +=

        `
        <div class="history-item">

            <div class="history-top">

                <div class="history-name">
                ${build.name}
                </div>

                <div class="history-time">
                ${build.date}
                </div>

            </div>


            <div class="history-detail">

            OVR:
            <b>${build.current}</b>
            →
            <b>${build.target}</b>

            </div>


            <div class="history-actions">

                <button onclick="deleteBuild(${index})"
                class="del-btn">
                Delete
                </button>

            </div>

        </div>
        `;


    });

}



function deleteBuild(index){

    let builds=getHistory();

    builds.splice(index,1);


    localStorage.setItem(
        "fighterBuilds",
        JSON.stringify(builds)
    );


    loadHistory();

}



saveBtn.addEventListener(
"click",
saveBuild
);



// Start
calculateOVR();
loadHistory();
