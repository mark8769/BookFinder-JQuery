/*
Mark Ortega-Ponce
3/24/23
scripts.js
Purpose: BookFinder functions.
*/

/* Wait for html to load, then call main. */
window.addEventListener("DOMContentLoaded", main);

/* 
Main entry point of program. 
*/
function main(){
    // Remove any book specific information from inputs.
    resetPage();
    // Add default books to navbar.
    addDefaultInfo();
    addListeners();
}
/* 
Function to add event listeners to buttons, and nav divs. 
*/
function addListeners(){
    $("#edit").click(edit);
    $("#add").click(add);
    let $divs = $("#sideNav > div");
    $divs.click(showInfo);
    $divs.click(apiRequest);
}
/*
Add new books to navigation bar and save to local storage.
*/
function add(){

    let editButton = document.getElementById("edit");
    let heading = document.getElementById("addHeading");
    let titleNode = document.getElementById("title");

    if (this.textContent == "Add"){
        this.textContent = "Save";
        disableInputs();
        this.classList.toggle("button");
        editButton.setAttribute("disabled", "");
        let selected = document.getElementsByClassName("selected");
        for (let s of selected){
            s.classList.toggle("selected");
        }
        resetPage();
        heading.removeAttribute("hidden");
    }else{
        this.textContent = "Add";
        enableInputs();
        this.classList.toggle("button");
        editButton.removeAttribute("disabled");
        heading.setAttribute("hidden", "");
        if (titleNode.value != ""){
            let newTitle = titleNode.value;
            let author = document.getElementById("author").value;
            let copyrightDate = document.getElementById("copyrightDate").value;
            let numberOfPages = document.getElementById("numberOfPages").value;
            let book = {
                title: newTitle,
                author: author,
                copyrightDate: copyrightDate,
                numberOfPages: numberOfPages,
                coverURL: ""
            }
            localStorage.setItem(titleNode.value, JSON.stringify(book));
            let div = document.createElement("div");
            let sideNav = document.getElementById("sideNav");
            div.id = newTitle;
            div.innerHTML = newTitle;
            div.addEventListener("click", showInfo);
            div.addEventListener("click", apiRequest);
            sideNav.appendChild(div);
            // Click new div, to show info and retrive image.
            div.click();
        }else{
            console.log("Saved nothing");
        }
    }
}
function edit(){

    let currEntry = document.getElementsByClassName("selected")[0];
    // If no items selected, then can't edit page.
    if (currEntry == null){
        alert("No entry selected.");
        return;
    }
    // If were editing, we want current entry.
    if (this.textContent == "Edit"){
        this.textContent = "Save";
        disableInputs();
        // Toggle if we pass initial check.
        this.classList.toggle("button")
        // Remove event listeners from all buttons, add to save button.
        let addButton = document.getElementById("add");
        addButton.setAttribute("disabled", "");
        addButton.removeEventListener("click", add);
    }else{
        this.textContent = "Edit";
        enableInputs();
        let title = document.getElementById("title").value;
        let author = document.getElementById("author").value;
        let copyrightDate = document.getElementById("copyrightDate").value;
        let numberOfPages = document.getElementById("numberOfPages").value;
        // Get id(title) for currently selected div.
        let currTitle = document.getElementsByClassName("selected")[0].id;
        let storedObject = localStorage.getItem(currTitle);
        let storedJson = JSON.parse(storedObject);
        // Update div name in navbar.
        let currDiv = document.getElementsByClassName("selected")[0]
        currDiv.id = title;
        currDiv.innerHTML = title;

        // Store any new information.
        if (storedJson.title != title){
            // Remove old cover.
            // Should a user be able to change the title?
            console.log("title changed");
            storedJson.coverURL = "";
            let currDiv = document.getElementsByClassName("selected")[0];
            console.log(currDiv);
            // get new image if any.
            currDiv.click();
        }
        storedJson.title = title;
        storedJson.author = author;
        storedJson.copyrightDate = copyrightDate;
        storedJson.numberOfPages = numberOfPages;
        // Remove old key(using title) from local storage.
        // If same then nothing changes.
        localStorage.removeItem(currTitle);
        // Set new key value, along with any other changes.
        localStorage.setItem(title, JSON.stringify(storedJson));
        let editButton = document.getElementById("edit");
        let addButton = document.getElementById("add");
        editButton.classList.toggle("button");
        addButton.addEventListener("click", add);
        addButton.removeAttribute("disabled");
    }
}
/*
Api request for when nav item is clicked. Makes a
request to retrieve the book titles isbn value to then
get the image url.
*/
function apiRequest(){
    // Grab id value from div.
    let title = this.id;
    let storedObject = JSON.parse(localStorage.getItem(title));
    if (storedObject != null & storedObject.coverURL !== ""){
        console.log("Already have an image, if title changed consider adding a new entry.");
        return
    }
    let cleanedTitle = title.toLowerCase();
    cleanedTitle = cleanedTitle.replace(" ", "+");
    // Start connection, and send API request.
    let requestor = new XMLHttpRequest();
    // https://openlibrary.org/dev/docs/api/search
    let endpoint = "https://openlibrary.org/search.json?title="
    requestor.addEventListener("load", requestHandler);
    requestor.open("GET", endpoint + cleanedTitle);
    requestor.send();
}
/*
Handles any requests that are made. If response if ok, 
retrive the image url if any and add it to local storage for future use.
*/
function requestHandler(){

    if (this.status !== 200){
        alert("Request failed");
    }
    let resp = JSON.parse(this.response);
    console.log(resp);
    try{
        isbn = resp.docs[0].isbn[0];
        var url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
    }catch (TypeError){
        console.log("No ISBN value for title");
        // Maybe set to a default no image?
        var url = "";
    }
    // Get div id to access local storage by key.
    let key = document.getElementsByClassName("selected")[0].id;
    let json = JSON.parse(localStorage.getItem(key));
    json.coverURL = url;
    // Store newly retrieved information.
    localStorage.setItem(key, JSON.stringify(json));
    document.getElementById("bookCover").src = url;
}
/* Show book info from local storage when div is clicked. */
function showInfo(){
    // Get id(title) from clicked div.
    console.log(showInfo);
    let storedObject = localStorage.getItem(this.id);
    // Divs to fill in info to.
    let divTitle = document.getElementById("title");
    let divAuthor = document.getElementById("author");
    let divCopyright = document.getElementById("copyrightDate");
    let divPages = document.getElementById("numberOfPages");
    // Unlikely but check anyway.
    if (storedObject !== null){
        //console.log(storedObject);
        // Parse stored object back into json.
        let book = JSON.parse(storedObject);
        divTitle.value = book.title;
        divAuthor.value = book.author;
        divCopyright.value = book.copyrightDate;
        divPages.value = book.numberOfPages;
        let img = document.getElementById("bookCover");
        img.src = book.coverURL;
        img.setAttribute("alt", `Book image of ${book.title}`)
    }
    let currSelected = document.getElementsByClassName("selected");
    // Turn of any selected elements (1).
    for (let selected of currSelected){
        selected.classList.toggle("selected");
    }
    // Add selected to div that was clicked.
    this.classList.add("selected");
}
function addDefaultInfo(){
    let books = [{
        title:"Fahrenheit 451",
        author:"",
        copyrightDate:"",
        numberOfPages:"",
        coverURL: ""
    },{
        title:"The Universal Computer",
        author:"",
        copyrightDate:"",
        numberOfPages:"",
        coverURL: ""
    },{
        title:"American Psycho",
        author:"",
        copyrightDate:"",
        numberOfPages:"",
        coverURL: ""
    }] 
    // Put books items in sidenav.
    let sideNav = document.getElementById("sideNav");

    for (let book of books){
        //console.log("storing" + book.title);
        localStorage.setItem(book.title, JSON.stringify(book));
        let div = document.createElement("div");
        div.id = book.title;
        div.innerHTML = book.title;
        sideNav.appendChild(div);
    }
}
/* 
Remove book specific information
when page is reloaded or add button is pressed.
*/
function resetPage(){
    $("#title")[0].value = "";
    $("#author")[0].value = "";
    $("#copyrightDate")[0].value = "";
    $("#numberOfPages")[0].value = "";
    let $img = $("#bookCover")[0];
    console.log($img);
    $img.src = "";
    $img.alt = "";
}
/* Disable inputs when in add or edit mode. */
function disableInputs(){
    $(".mainContent input").removeAttr("readOnly");
    // https://www.delftstack.com/howto/jquery/jquery-remove-event-listener/
    $divs = $("#sideNav > div").unbind("click");
}
/* Enable inputs and listeners when done with adding or editing. */
function enableInputs(){
    
    let inputs = document.querySelectorAll(".mainContent input");
    for (let input of inputs){
        input.setAttribute("readonly", "");
    }
    let divs = document.querySelectorAll("#sideNav > div");
    for (let div of divs){
        div.addEventListener("click", showInfo);
        div.addEventListener("click", apiRequest);
    }
}