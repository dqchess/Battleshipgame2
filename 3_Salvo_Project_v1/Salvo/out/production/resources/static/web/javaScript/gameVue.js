let salvo = new Vue({
    el: "#app",

    mounted() {
            this.getUrlVars(),
            this.getData()

            // this.declareShips()
    },

    data: {
        //those are for security check (making sure the proper player access the data)
        gamePlayerURL: [],
        connectedPlayer: [],
        connectedUsername: [],
        loadOccurence: 0,


        //those are for creating the page
        gpData: [],
        shipsName: [],
        currentGP: [],
        mySalvoes: [],
        salvoesHits: [],
        hisSalvoes: [],
        search: [],
        gameState: "placingShips",
        gpShips: [
        { "type": "Carrier", "location": ["A5", "B5", "C5", "D5", "E5"], "amountOfHits" : 0},
        { "type": "Submarine", "location": ["D1", "E1", "F1"], "amountOfHits" : 0 },
        { "type": "Battleship", "location": ["G3", "G4", "G5", "G6"], "amountOfHits" : 0 },
        { "type": "Destroyer", "location": ["C8", "C9", "C10"], "amountOfHits" : 0 },
        { "type": "Patrol_Boat", "location": ["I5", "I6"], "amountOfHits" : 0 }],
        damagedBoats: [],

        //drag and drop variables:
        draggingItem: [],
        ships: [],
        allIDs: [],
        boatVertical: true,
        currentMovingBoat: [],
        newAllIDs: [],
        witness: 0,


        //for out of the grid drag and drop
        occurence: 0,
        hasBeenDone: false,


        //for dragging and dropping all part of the boat
        allLocations: [],
        currentPosition: [],
        currentPositionIndex: [],
    },

    methods: {
        getUrlVars() {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                vars = value;

                //vars[key] = value; this prevent us to have directly the number of game player, 
                //...instead we have GP=1
            });
            this.gamePlayerURL = vars.substr(0, 2);


           
        },
        getData() {

            let url = "/api/game_view/" + this.gamePlayerURL;
            const urlGames = "/api/games2";


            //the first fecth provide me the data from the "gamplayer"API, which will afterward 
            //.. be used to populate the table and the ships and salvo withins
            Promise.all([

                fetch(url, {
                    mode: "cors"
                })
                    .then(function (response) {
                        return response.json()
                    })
                    .then(function (gameJson) {
                        if (gameJson.hasOwnProperty("error")) {
                            alert(gameJson.error)
                            history.go(-1);
                        }

                        salvo.gpData = gameJson;
                        salvo.currentGP = gameJson.game.gamePlayer
                        salvo.mySalvoes = gameJson.game.mySalvoes
                        salvo.hisSalvoes = gameJson.game.hisSalvoes
                        salvo.salvoesHits = gameJson.game.Hits

                        if(gameJson.game.ships.length != 0){
                            
                            salvo.gameState = "gameStarted";
                            salvo.gpShips = gameJson.game.ships
                           
                        }

                        salvo.populateTable("tableA");
                        salvo.populateTable("tableB");

                        salvo.colorizeGrid();

                    
                        if(gameJson.game.mySalvoes.length != 0){
                            salvo.manageSalvoes(salvo.mySalvoes, "tableB", "mySalvoes");
                        }

                        if(gameJson.game.hisSalvoes != undefined && gameJson.game.hisSalvoes.length != 0){
                         salvo.manageSalvoes(salvo.hisSalvoes, "tableA", "hisSalvoes");
                        } 
                    })
                    .catch(error => console.log(error)),

 //the second fetch will make sure the data can be accessed, hence will get and isolate the username of the 
 //... current player, afterward a function will be use to make sure this page is accessed by the proper person

                setTimeout(function () {
                    fetch(urlGames, {
                        mode: "cors"
                    })
                        .then(function (response) {
                            return response.json()
                        })
                        .then(function (response) {
                            salvo.connectedPlayer = response.player
                        })
                        .then(function (response) {
                            salvo.connectedUsername = salvo.connectedPlayer.username;
                            salvo.playersVs();
                        })
                        .catch(error => console.log(error));
                }, 50)
            ]);
        },
        populateTable(tableHTML) {

                    let body = document.getElementById("body")

            const column = ["", "", "", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "", ""]
            const see = document.getElementById(tableHTML);
            const table = document.createElement("table");
            const tbody = document.createElement("tbody");

            //the element above will be use later

            table.appendChild(tbody);

            //bind the tbody  to the table element, the tbody will be then build with the 2 loops below

            for (let i = 0; i < 15; i++) {

                var tr = document.createElement("tr");
                tbody.appendChild(tr);

                //bind the tr element to the tbody, the tr will be built below: 

                  for (var j = 0; j < 15; j++) {

                    var td = document.createElement("td");

                    if(tableHTML == "tableB"){
                    
                    if(j >= 3 && i >= 3 && salvo.gameState != "placingShips"){
                        td.addEventListener('click', this.gatheringSalvoes)
                    }}

                    if (i == 2 && j > 2 && j < 13) {
                        td.textContent = j - 2;
                        td.setAttribute("id", column[i] + j + tableHTML);
                    } //this will add the content of the first row(the numbers)

                    if (i > 2 && j == 2) {
                        k = j-2
                        td.textContent = column[i];
                        td.setAttribute("id", column[i] + k + tableHTML);
                    } //this will add the content of the first columnthe letter)

                   if (i > 2 && j > 2 && i < 13 && j < 13)  {

                    k = j-2

                        td.setAttribute("id", column[i] + k + tableHTML);

                        //this will add an ID to match each cell (eg: cell A1 will have the ID="A1" )
                        td.setAttribute("class", "empty")
                    }

                    tr.appendChild(td);
                    //this bind the builded cells to the rows, whichare themselves built at the first loop

                 if (i == 1 || i == 13){
                     td.setAttribute("class", "outbound")
                 }
                if(j == 1 || j == 13){
                    td.setAttribute("class", "outbound")

                } //this in order to prevent ship to go outside the grid

                
                if (i == 0 || i == 14){
                    td.setAttribute("class", "outbound2")
                }

               if(j == 14 || j == 0){
                   td.setAttribute("class", "outbound2")

                     } //this in order to prevent ship to go outside the grid
                }
            }

            see.appendChild(table);
          document.addEventListener("drop", this.dragDrop)
            //td bind to  tr
            //tr bind to tbody & thead
            //tbody bind to table
            // and now, we are pushing the table to the body , which is the ID of the div in HTMl page

            if(this.gameState == "placingShips"){

                    body.addEventListener("dragover", this.dragOver);
                    body.addEventListener("dragenter", this.dragEnter);
                    body.addEventListener("dragleave", this.dragLeave);
                    body.addEventListener("drop", this.dragDrop)
                }

        },
        colorizeGrid() {    

            let myShips = this.gpShips;

            //this loops added My ships in the tableA and isolate their location in a variable to be compared 
            // the salvo of the opponents
            for (let i = 0; i < myShips.length; i++) {
                let locs = myShips[i].location;
                let types = myShips[i].type;

                let frontShip = locs[0];
                let backShip = locs[locs.length - 1];


                for (let j = 0; j < locs.length; j++) {

                    let bob = document.getElementById(locs[j] + "tableA")

                    document.getElementById(locs[0] + "tableA").classList.add("switchOrientation")
    
                  
                    bob.classList.add("shipColor");
                    bob.classList.add(types);
                    bob.setAttribute('data-shipLength', locs.length);
                    
                    bob.setAttribute('data-shipType', types);


                    if(this.gameState == "placingShips"){
                    bob.setAttribute("draggable", "true");}


                    if (bob.classList.contains("shipColor")) {
                        bob.classList.remove("empty");
                    }
                    let empties = document.getElementsByClassName("empty");
                    let filled = document.getElementsByClassName("shipColor");

                    for (let empty of empties) {
                             if(this.gameState == "placingShips"){
                                    empty.addEventListener("dragover", this.dragOver);
                                    empty.addEventListener("dragenter", this.dragEnter);
                                    empty.addEventListener("dragleave", this.dragLeave);
                                    empty.addEventListener("drop", this.dragDrop);
                        }
                    }

               
                    
                    for (let fill of filled) {
                        if(this.gameState == "placingShips"){
                                fill.addEventListener("dragstart", this.dragStart);
                                fill.addEventListener("dragend", this.dragEnd);
                        }
                    }
                }
            }

           

            this.addSwitchOrientation()

        },
        playersVs() {

            let players = document.getElementById("gamers")

            if (this.gpData.game.gamePlayer.length == 1) {

                let gamer1 = this.currentGP[0].player.username;

                players.textContent = gamer1 + "(you) VS awaiting his opponent ";

            } else {

                let gamer1 = this.currentGP[0].player.username;
                let gamer2 = this.currentGP[1].player.username;

                let connectedPlayer = this.connectedUsername

                if (gamer1 == connectedPlayer) {
                    players.textContent = gamer1 + " (you) " + "VS" + " " + gamer2;
                } else {
                    players.textContent = gamer2 + " (you)" + "VS" + " " + gamer1;
                }

            }

        },
        showShips() {

           // console.log("ici");

            let ships = tableA.shipLocs;
            for (let i = 0; i < ships.length; i++) {
                let locs = ships[i].location;
                let types = ships[i].type;


                for (let j = 0; j < locs.length; j++) {

                   
                    //                    document.getElementById(locs[j]).style.backgroundColor = "red";
                    document.getElementById(locs[j]).classList.add("shipColor");
                    document.getElementById(locs[j]).setAttribute('data-shipLength', locs.length);
                    document.getElementById(locs[j]).setAttribute('data-shipType', types);
                    if (j == 0 && this.gameState == "placingShips") {
                        document.getElementById(locs[j]).setAttribute("draggable", "true");
                    }
                    if (document.getElementById(locs[j]).classList.contains("shipColor")) {
                        document.getElementById(locs[j]).classList.remove("empty");
                    }
                    let empties = document.getElementsByClassName("empty");
                    let filled = document.getElementsByClassName("shipColor");
                    for (let empty of empties) {
                        empty.addEventListener("dragover", this.dragOver);
                        empty.addEventListener("dragenter", this.dragEnter);
                        empty.addEventListener("dragleave", this.dragLeave);
                        empty.addEventListener("drop", this.dragDrop);
                    }
                    for (let fill of filled) {
                        fill.addEventListener("dragstart", this.dragStart);
                        fill.addEventListener("dragend", this.dragEnd);
                    }
                }
            }
        },
        updateShipsPosition(){

            
        //1: define new positions of ships


                let updatedShips = this.gpShips;

            
            let url = "/api/games/players/"+ this.gamePlayerURL + "/ships"

            let myInit = {

                method: 'POST',
                mode: 'cors',
                cache: 'default',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedShips)

            };

            fetch(url, myInit)
                .then(function (response) {
                    return response.json()
                })
                .then(function (gameJson) {
                    if (!window.location.hash) {
                        window.location = window.location + '#loaded';
                        window.location.reload();
                    }
                })
                .catch(function (error) {

                    //  console.log("Request failed: " + error.message);
                    // console.log(error)
                });
        },
        //DRAG AND DROP STARTS HERE
        dragStart(e) {


                //get all the element in the array:
                let me = e.target.id;
                let type = document.getElementById(e.target.id).getAttribute("data-shipType");
                let locPerType = document.getElementsByClassName(type);
                let idPerType = [];

                for(let b=0; b < locPerType.length; b++){

                    bob = locPerType[b].getAttribute("id")

                    idPerType.push(bob)
                }
            

                //check position of the dragged box in the boat
                let indexDraggedEl = idPerType.indexOf(me)


                //putting everything above to be reused by drop
                this.allLocations = idPerType;
                this.currentPosition = me;
                this.currentPositionIndex = indexDraggedEl;


         //to prevent the alert "out of grid" to be triggered several times, these need to be reset
         //... cf dragEnter for more info
            this.occurence = 0;
            this.hasBeenDone = false

            
            // the following is to avoid conflict between "1" and "10"
            let letter = e.target.id.substr(0, 1);

            let test1 = (e.target.id).split("");
            let test2 = (letter+"tableA").split("");

                        for (let x =0; x < test1.length; x++) {
                           for (let c = 0; c < test2.length; c++){
                                if (test1[x] == test2[c]){
                                    test1.splice(x, 1); 
                                       }
                                  }
                            }

            let number = test1.join("");
          
            this.shipLength = document.getElementById(e.target.id).getAttribute("data-shipLength");
            this.shipType = document.getElementById(e.target.id).getAttribute("data-shipType");
            this.currentMovingBoat = document.getElementById(e.target.id).getAttribute("data-shipType");


            //check if vertical or horizontal
            let boatByType = [];
            let stupidDomEl = document.getElementsByClassName(this.shipType);

            for (let k = 0; k < stupidDomEl.length; k++) {
                boatByType.push(stupidDomEl[k].id);
            }
            for (let l = 0; l < boatByType.length - 1; l++) {
                if (boatByType[l][0] != boatByType[l + 1][0]) {
                    salvo.boatVertical = true;
                } else {
                    salvo.boatVertical = false;
                }
            }

            //rebuilt the ship from his origin point:
            if (this.boatVertical == true) {
                for (let i = 0; i < this.shipLength; i++) {
                    let newID = salvo.incrementingLetter(letter, i) + number;
                    salvo.allIDs.push(newID);
                }

            } else {
                for (let i = 0; i < this.shipLength; i++) {
                    let newID = letter + (Number(number) + i);
                    salvo.allIDs.push(newID);
                }
            }

           // console.log(salvo.allIDs)

            this.removeStuff(idPerType);
            
        },
        dragEnd(e) {
   // console.log("END", e.target.id);
        },
        dragOver(e) {
            // console.log("OVER", e.target.getAttribute("class"))
            //dragOver is necessary otherwise the ship goes back to its original place
             e.preventDefault();
        },
        dragEnter(e) {

         // console.log("ENTER", e.target.id)
        // console.log("ENTER", e.target.classList)
       // console.log("putain")
           
            let outbound = e.target.getAttribute("class");
            
                 if (outbound == "outbound" || outbound == "outbound3"){

                        if(this.hasBeenDone == false && this.occurence < 1){

                            //console.log("if")
                            this.refillGrid(this.allIDs);
                            alert("dont go outside the grid!")

                            this.occurence++;
                            this.hasBeenDone = true
                }
            }
        e.preventDefault();    
        },
        dragLeave(e) {
            // console.log("LEAVE", e.target.getAttribute("class"))
        },
        dragDrop(e) {

               console.log("DROP", e.target.getAttribute("id"))

    let shipCellID = e.target.id;
            
    let types = salvo.gpShips;
    let letter = shipCellID.substr(0, 1);
    let startingPoint = salvo.allIDs;



            //this part is for  the "all box draggable"
            //VERY HARD TO MAKE; BUT NOT IMPOSSIBLE!!!!!
// console.log(this.allLocations)
// console.log(this.currentPosition)
// console.log(shipCellID)            
// console.log(this.currentPositionIndex)
// console.log(this.allLocations.length)


//             let allDraggable = this.allLocations;
//             let allDraggableOrigin = this.currentPosition;
//             let AllDraggableShipLenght = (this.allLocations).length

//             for(let b=0; b < allDraggable.length; b++){

//                 if(allDraggableOrigin == allDraggable[b]){

//                     console.log(allDraggable[b])
                
//                     let matchingPoint = allDraggable.indexOf(allDraggable[b]);

//                     console.log(matchingPoint)

//                         for (let d = 0; d < AllDraggableShipLenght; d++){



//                         }
//                 }
                
//             }
            //this part is for  the "all box draggable"
            //VERY HARD TO MAKE; BUT NOT IMPOSSIBLE!!!!!
            
            
//this allow to use 10 as a number : 
    let numberbis = shipCellID.split("");
    let numbertris = (letter+"tableA").split("");

    for (let x =0; x < numberbis.length; x++) {
        for (let c = 0; c < numbertris.length; c++){
            if (numberbis[x] == numbertris[c]){
                numberbis.splice(x, 1);
            }
        }
    }
    let numberquis = numberbis.join("")


    if (this.boatVertical == true) {

        for (let i = 0; i < this.shipLength; i++) {

            let newID = salvo.incrementingLetter(letter, i) + numberquis;

            salvo.newAllIDs.push(newID)

        }

    } else {

        for (let m = 0; m < this.shipLength; m++) {

            let newID = letter + (Number(numberquis) +m)

            salvo.newAllIDs.push(newID)

        }
    }

    //console.log(salvo.newAllIDs)
// let last_step = [];

//     for (let z = 0; z < this.allLocations.length; z++){

//         last_step.push(this.allLocations[z] + "tableA")
//     }


    //here we prevent the ship to collide inside the grid
        let locsOutGrid = [];
        let allCellsClear =  [];
    

        for (let a = 0; a < salvo.newAllIDs.length; a++) {
            
            locsOutGrid.push(document.getElementById(salvo.newAllIDs[a] + "tableA")); 
            } 
            
            if(!locsOutGrid.includes(null)) {
            for (let y = 0; y < locsOutGrid.length; y++){

                    if(locsOutGrid[y].classList.contains("empty") == true)
                    {  allCellsClear.push(true)}
                    else
                    { allCellsClear.push(false)}
            }
        }


        if (locsOutGrid.includes(null) || allCellsClear.includes(false)) {

           //console.log("1")
            salvo.refillGridPreviousLoc(this.allLocations)
            

        } else {
           //console.log("2")
            salvo.refillGrid(salvo.newAllIDs);
        }
    
            salvo.newAllIDs = [];
           
        }, 
        addSwitchOrientation(){
            
           let domForButton = document.getElementsByClassName("switchOrientation");

          // console.log(domForButton.getAttribute("id"))
           
           for (let i = 0; i < domForButton.length; i++){

            let data_shipTypeValue = domForButton[i].getAttribute("data-shipType");
            let idValue = domForButton[i].getAttribute("id")

           // console.log(domForButton[i].getAttribute("id"))


           if(this.gameState == "placingShips"){

            domForButton[i].innerHTML = "<img src=./images/switchOrientation.png width=\'10px\' height=\'10px\' draggable=false data-shipType="+ data_shipTypeValue + " id="+idValue+">";
            domForButton[i].addEventListener('click', this.switchOrientation);}

            
           }
        },
        switchOrientation(e){
            
            //console.log(e.target.id);

            // to isolate the numbers and letters: 
            let shipCellID = e.target.id;
            let letter = shipCellID.substr(0, 1);

            this.currentMovingBoat = document.getElementById(e.target.id).getAttribute("data-shipType");
           //this allow to use 10 as a number : 
            let numberbis = shipCellID.split("");
            let numbertris = (letter+"tableA").split("");
        
            for (let x =0; x < numberbis.length; x++) {
                for (let c = 0; c < numbertris.length; c++){
                    if (numberbis[x] == numbertris[c]){
                        numberbis.splice(x, 1); 
                    }
                }
            }
            let number = numberbis.join("")

           // console.log(letter, number)


            //to check if vertical or not: 
            let isThisBoatVertical_Now = Boolean;
            let boatByType = [];

         //   console.log(document.getElementById(e.target.id))

            let TargetedBoatType = document.getElementById(e.target.id).getAttribute("data-shipType")
            let stupidDomEl = document.getElementsByClassName(TargetedBoatType);

            for (let k = 0; k < stupidDomEl.length; k++) {
                boatByType.push(stupidDomEl[k].id);
            }
            for (let l = 0; l < boatByType.length - 1; l++) {
                if (boatByType[l][0] != boatByType[l + 1][0]) {
                    isThisBoatVertical_Now = true;
                } else {
                    isThisBoatVertical_Now = false;
                }
            }


            //rebuilt the ship locations:
            let shipLength = boatByType.length;
            let newIDs = []

            if (isThisBoatVertical_Now == false) {

                  for (let i = 0; i < shipLength; i++) {

                         let newID = salvo.incrementingLetter(letter, i) + number;

                         newIDs.push(newID)
                            }

                             } else {
                    for (let i = 0; i < shipLength; i++) {

                         let newID = letter + (Number(number) + i)

                         newIDs.push(newID)
                            }
                        }
                            
                   // console.log(newIDs);
                        

                //make sure the newly oriented boat dont overlap another or get out of the grid
           let locsOutGrid = [];
           let allCellsClear =  [];
       
           for (let a = 0; a < shipLength; a++) {
               locsOutGrid.push(document.getElementById(newIDs[a] + "tableA")); 
               } 

              // console.log(locsOutGrid)

               if(!locsOutGrid.includes(null)) {
   
               for (let m = 1; m < shipLength; m++){ // i had to start at 1 and not zero, as the boat rotate to himself
                       if(locsOutGrid[m].classList.contains("empty") == false)
   
                       {  allCellsClear.push(false)}
   
                       else
                       { allCellsClear.push(true)}
               }
           }
         //  console.log(allCellsClear)


           //repopulate the table accordingly or make it move to show it wont work
           if (locsOutGrid.includes(null) || allCellsClear.includes(false)) {

            //console.log("1")
           // salvo.fillGridAfterReorientation(boatByType)

           for (let t = 0; t < boatByType.length; t++){

           let bob = document.getElementById(boatByType[t]);
            bob.classList.add("face")
           }

           setTimeout(function() {
                        for (let g = 0; g < boatByType.length; g++){
                            bob = document.getElementById(boatByType[g])
                            bob.classList.remove("face")
                        }}, 1000)
 
         } else {
             salvo.removeStuff(boatByType)
            //  salvo.fillGridAfterReorientation(TargetedBoatType, newIDs);
             salvo.refillGrid(newIDs)
         }

        },
        removeStuff(oldShipIDs){

            for (let a = 0; a < oldShipIDs.length; a++) {

                const bob = document.getElementById(oldShipIDs[a]);
                const bob2 = document.getElementById(oldShipIDs[0])

                bob2.classList.remove("switchOrientation")
                bob2.removeEventListener('click', this.switchOrientation)
                bob2.innerHTML = "";
                
                bob.removeAttribute("draggable"); 
                bob.removeAttribute("class");  
                bob.removeAttribute("data-shipLength"); 
                bob.removeAttribute("data-shipType");

                bob.classList.add("empty");   

             }
        },
        refillGrid(shipIDs){

            //console.log("do I?")

           //console.log(shipIDs)

        for (let i = 0; i < shipIDs.length; i++) {

        let bob = document.getElementById(shipIDs[i] + "tableA");
        let bob2 = document.getElementById(shipIDs[i]);

        // if (bob.classList.contains("empty")) {

            if(this.gameState == "placingShips"){

               
                bob.setAttribute("draggable", "true");   
                bob.addEventListener("dragstart", this.dragStart); }

              

           
           
            document.getElementById(shipIDs[0]+ "tableA").classList.add("switchOrientation")

            bob.classList.add("shipColor")
            bob.classList.add(this.currentMovingBoat);
            bob.classList.remove("empty");
            bob.setAttribute("data-shipLength", shipIDs.length);
            bob.setAttribute('data-shipType', this.currentMovingBoat);


            
            for (let z = 0; z < shipIDs.length; z++) {
                for(let x =0; x < salvo.gpShips.length; x++){
                    if (this.currentMovingBoat == this.gpShips[x].type){
                        this.gpShips[x].location = shipIDs;
                    }
                }
            }

            salvo.allIDs = [];
            salvo.newAllIDs = [];
            this.allLocations = [];

            this.addSwitchOrientation();
        
             }
        },
        refillGridPreviousLoc(shipIDs){

            //console.log("do I?")

        //   console.log(shipIDs)

        for (let i = 0; i < shipIDs.length; i++) {

        let bob = document.getElementById(shipIDs[i]);
        let bob2 = document.getElementById(shipIDs[i]);

        if(this.gameState == "placingShips"){
            
        bob.setAttribute("draggable", "true");
        bob.addEventListener("dragstart", this.dragStart);}

     
            
            document.getElementById(shipIDs[0]).classList.add("switchOrientation")

            bob.classList.add("shipColor")
            bob.classList.add(this.currentMovingBoat);
            bob.classList.remove("empty");
            bob.setAttribute("data-shipLength", shipIDs.length);
            bob.setAttribute('data-shipType', this.currentMovingBoat);

            salvo.allIDs = [];
            salvo.newAllIDs = [];
            this.allLocations = [];

            bob.classList.add("face")
           

            setTimeout(function() {
                         for (let g = 0; g < shipIDs.length; g++){
                             bob = document.getElementById(shipIDs[g])
                             bob.classList.remove("face")
                         }}, 1000)

            this.addSwitchOrientation();
        
             }
        },
        //DRAG AND DROP ENDS HERE
        //SALVO MANAGEMENT STARTS HERE
        gatheringSalvoes(e){

            let shipCellID = e.target.id;
            let bob = document.getElementById(shipCellID);
            let bob2 = document.getElementsByClassName("mysalvoes")

            if(!bob.classList.contains("mysalvoes")){
                if(bob2.length <= 4){ 
                    bob.classList.add("mysalvoes")
                }} else {bob.classList.remove("mysalvoes")
            }
        },
        sendSalvoes(){

            let salvoes = document.getElementsByClassName("mysalvoes");

            if(salvoes.length == 5){

            let cleanLocations = this.cleanIDsForLocations(salvoes, "tableB");
            let url = "/api/games/players/"+ this.gamePlayerURL + "/salvoes"

            let myInit = {

                method: 'POST',     
                mode: 'cors',
                cache: 'default',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cleanLocations)

            };

            fetch(url, myInit)
                .then(function (response) {
                    return response.json()
                })
                .then(function (gameJson) {
                    // if (!window.location.hash) {
                        window.location = window.location + '#loaded';
                        window.location.reload();
                    // }
                })
                .catch(error => console.log(error));

            }else{alert("you can send up to 5 salvoes at once!")}
            
        },
        manageSalvoes(targetedcells, tableHTML, indicator){

            //first we define and colorize MY SALVOES
            let step1 = targetedcells;
            let matchFromBackend_MFB = salvo.salvoesHits;
            let listOfBoats = ["Carrier", "Submarine", "Battleship", "Destroyer", "Patrol_Boat"];
            let damagedBoats = [];
            let redList = [];

            //lots of loops because of the nested Json, but nothing complex in the end:

            if(indicator === "mySalvoes"){

            for(let i=0; i < step1.length; i++){
                 let step2 = step1[i].location;
                 let step3 = step1[i].turn;

                for(let k=0; k < step2.length; k++){
                    for (let n=0; n < matchFromBackend_MFB.length; n++){
                            MFB_step1 = matchFromBackend_MFB[n]
                        for(let p=0; p < MFB_step1.length; p++){  7
                            let bob = document.getElementById(step2[k] + tableHTML); 
                                      if (step2[k] == MFB_step1[p]){
                                        bob.style.backgroundColor = "red"
                                        bob.textContent = step3
                                        bob.removeEventListener('click', this.gatheringSalvoes)
                                         redList.push(step2[k])
                                     } if (!redList.includes(step2[k])){
                                        bob.style.backgroundColor = "green"
                                        bob.textContent = step3
                                        bob.removeEventListener('click', this.gatheringSalvoes)
                                        }
                                        for(let o=0; o < listOfBoats.length; o++){
                                            if(listOfBoats[o] === MFB_step1[p] && !damagedBoats.includes(listOfBoats[o])){
                                                  damagedBoats.push(listOfBoats[o])
                                            
                                    }
                                }     
                            }       
                        }
                    }
                }
                salvo.damagedBoats = damagedBoats
            }

             //this loops added the salvo of the oppponent and set up color if they hit or miss, accordingly with
            // the array set up on the previous loop
        
            let step4 = targetedcells;
            let myShipsLocations = document.getElementsByClassName("shipColor");
            let myShipsLocations_cleaned = this.cleanIDsForLocations(myShipsLocations, "tableA");
            
            if (indicator === "hisSalvoes"){
                for (let l = 0; l < step4.length; l++) {
                        let step5 = step4[l].location;
                        let step6 = step4[l].turn;
                    for (let m = 0; m < step5.length; m++) {

                        if (myShipsLocations_cleaned.includes(step5[m])) {

                            document.getElementById(step5[m] + "tableA").textContent = step6

                            document.getElementById(step5[m] + "tableA").style.backgroundColor = "red"
                        } else {
                            document.getElementById(step5[m] + "tableA").style.backgroundColor = "green"
                            document.getElementById(step5[m] + "tableA").textContent = step6
                        }
                    }
                }
            }
        },
        //SALVO MANAGEMENT ENDS HERE
        //UTILITY METHODS STARTS HERExº
        cleanIDsForLocations(domElements, tableID){

            //as the "domElements" part from the method manageSalvoes() is an HTML collection, domElements.lenght == 0
            //... as this function is also use for other purposes, I added a conditional to manage this particular issue
            // ... "lenght_for_manageSalvoes = 100" as they are 100 cells max per table

            let cleanLocations = []; 
            let lenght_for_manageSalvoes = 100;

            if(domElements.length == 0){

                for(let i = 0 ; i < lenght_for_manageSalvoes; i++) {

                    let step0  = domElements.item(i);
                    letter = step0.substr(0, 1);
    
                    let step1 = step0.split("");
                    let step2 = (letter + tableID).split("");
    
                        for (let j = 0; j < step1.length; j++){
                            for (let k=0; k < step2.length; k++){
                                if(step1[j] == step2[k]){
                                    step1.splice(j, 1);
                                }
                            }
                        }
    
                        let step3 = step1.join("");
                        let step4 = letter + step3
    
                        cleanLocations.push(step4)
                }

            } else {
            
            for(let l = 0 ; l < domElements.length; l++) {

                let step0  = domElements[l].getAttribute("id");
                letter = step0.substr(0, 1);

                let step1 = step0.split("");
                let step2 = (letter + tableID).split("");

                    for (let m = 0; m < step1.length; m++){
                        for (let k=0; k < step2.length; k++){
                            if(step1[m] == step2[k]){
                                step1.splice(m, 1);
                            }
                        }
                    }

                    let step3 = step1.join("");
                    let step4 = letter + step3

                    cleanLocations.push(step4)
            }
        }
            
                return cleanLocations;
        },
        incrementingLetter(letter, occurence){

            let alphabet = ("ABCDEFGHIJ").split("");
        
            for (let i = 0; i < alphabet.length; i++) {
        
                if (letter == alphabet[i]) {
        
                    let k = i + occurence;
        
                    return alphabet[k];
        
                }
            }
        }
        //UTILITY METHODS ENDS HERE
    }
})