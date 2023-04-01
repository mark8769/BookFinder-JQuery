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
    $("#remove").click(remove);
    let $divs = $("#sideNav > div");
    $divs.click(showInfo);
    $divs.click(apiRequest);
}
/*
Add new books to navigation bar and save to local storage.
*/
function add(){
    // Don't index, or attr functions wont work.
    let $editButton = $("#edit");
    let $heading = $("#addHeading");
    let $titleNode = $("#title")[0]

    if (this.textContent == "Add"){
        this.textContent = "Save";
        disableInputs();
        this.classList.toggle("button");
        $editButton.attr("disabled", "");
        let $selected = $(".selected");
        for (let s of $selected){
            s.classList.toggle("selected");
        }
        resetPage();
        $heading.removeAttr("hidden");
        $("#remove").attr("hidden", "");
    }else{
        this.textContent = "Add";
        enableInputs();
        this.classList.toggle("button");
        $editButton.removeAttr("disabled");
        $heading.attr("hidden", "");
        if ($titleNode.value != ""){
            let newTitle = $titleNode.value;
            console.log(newTitle);
            let $author = $("#author")[0].value;
            let $copyrightDate = $("#copyrightDate")[0].value;
            let $numberOfPages = $("#numberOfPages")[0].value;
            let book = {
                title: newTitle,
                author: $author,
                copyrightDate: $copyrightDate,
                numberOfPages: $numberOfPages,
                coverURL: ""
            }
            console.log(book);
            localStorage.setItem(newTitle, JSON.stringify(book));
            let $newDiv = $("<div>");
            $newDiv.attr("id", newTitle);
            $newDiv.html(newTitle);
            $newDiv.click(showInfo);
            $newDiv.click(apiRequest);
            $("#sideNav").append($newDiv[0]);
            // Click new div, to show info and retrive image.
            $newDiv.click();
            $("#remove").removeAttr("hidden");
        }else{
            console.log("Saved nothing");
        }
    }
}
/*
Saves new information from edited book content.
Disables all inputs besides edit, and reenables on save.
*/
function edit(){

    let $currEntry = $(".selected")[0];
    //console.log($currEntry)
    // If no items selected, then can't edit page.
    if ($currEntry == null){
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
        let $addButton = $("#add")
        //let addButton = document.getElementById("add");
        $addButton.attr("disabled", "");
        $addButton.unbind("click");
    }else{
        this.textContent = "Edit";
        enableInputs();
        let title = $("#title")[0].value;
        let author = $("#author")[0].value;
        let copyrightDate = $("#copyrightDate")[0].value;
        let numberOfPages = $("#numberOfPages")[0].value;
        // Get id(title) for currently selected div.
        let $currDiv = $(".selected");
        let currTitle = $currDiv[0].id;
        let storedObject = localStorage.getItem(currTitle);
        let storedJson = JSON.parse(storedObject);
        // Update div name in navbar.
        $currDiv.attr("id", title);
        $currDiv.html(title);

        // Store any new information.
        if (storedJson.title != title){
            // Remove old cover.
            // Should a user be able to change the title?
            console.log("title changed");
            storedJson.coverURL = "";
            // get new image if any.
            $currDiv[0].click();
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
        $("#edit")[0].classList.toggle("button");
        let $addButton = $("#add");
        $addButton.click(add);
        $addButton.removeAttr("disabled");
    }
}
/*
Function to remove dom element from side navigation bar.
*/
function remove(){
    let $selected = $(".selected");
    if (typeof $selected[0] !== 'undefined'){
        resetPage();
        let key = $selected[0].id;
        localStorage.removeItem(key);
        $selected.remove();
    }else{
        console.log("Nothing to remove.");
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

    let request = {title: cleanedTitle};
    $.ajax({
        url: "https://openlibrary.org/search.json?",
        data: request,
        method: "GET",
        dataType: "json"
    }).done(requestHandler).fail(requestFail);
    // weird syntax
}
/*
Handles any requests that are made. If response if ok, 
retrive the image url if any and add it to local storage for future use.
*/
function requestHandler(returnedData){

    let resp = returnedData;
    try{
        isbn = resp.docs[0].isbn[0];
        var url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
    }catch (TypeError){
        console.log("No ISBN value for title");
        // Maybe set to a default no image?
        var url = "";
    }
    // Get div id to access local storage by key.
    let key = $(".selected")[0].id;
    //let key = document.getElementsByClassName("selected")[0].id;
    let json = JSON.parse(localStorage.getItem(key));
    json.coverURL = url;
    // Store newly retrieved information.
    localStorage.setItem(key, JSON.stringify(json));
    //document.getElementById("bookCover").src = url;
    $("#bookCover").attr("src", url);
}
/*
Function to handle failed api request.
*/
function requestFail(xhr, status, errorThrown){
    //https://learn.jquery.com/ajax/jquery-ajax-methods/
    alert( "Sorry, there was a problem!" );
    console.log( "Error: " + errorThrown );
    console.log( "Status: " + status );
    console.dir( xhr );
}
/* 
Shows book info from local storage when div is clicked. 
*/
function showInfo(){
    // Get id(title) from clicked div.
    // Parse stored object back into json.
    let storedObject = localStorage.getItem(this.id);
    let book = JSON.parse(storedObject);
    // Get field inputs, and fill in with stored information for book.
    $("#title")[0].value = book.title;
    $("#author")[0].value = book.author;
    $("#copyrightDate")[0].value = book.copyrightDate;
    $("#numberOfPages")[0].value = book.numberOfPages;
    let $img = $("#bookCover");
    $img.attr("src", book.coverURL);
    $img.attr("alt", `Book image of ${book.title}`);

    // Turn of any selected elements (1).
    let $currSelected = $(".selected");
    for (let selected of $currSelected){
        selected.classList.toggle("selected");
    }
    // Add selected to div that was clicked.
    this.classList.add("selected");
    $("#remove").removeAttr("hidden", "");
}
/*
Function to add default books to page as side nav links.
*/
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
    let $sideNav = $("#sideNav")[0];
    for (let book of books){
        localStorage.setItem(book.title, JSON.stringify(book));
        let $newDiv = $("<div>");
        $newDiv.attr("id", book.title);
        $newDiv.html(book.title);
        //console.log($newDiv); Still have to access by index.
        // https://api.jquery.com/append/
        $sideNav.append($newDiv[0]);
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
    $("#remove").attr("hidden", "");
    let $img = $("#bookCover")[0];
    $img.src = "";
    $img.alt = "";
}
/* Disable inputs when in add or edit mode. */
function disableInputs(){
    $(".mainContent input").removeAttr("readOnly");
    // https://www.delftstack.com/howto/jquery/jquery-remove-event-listener/
    $divs = $("#sideNav > div").unbind("click");
    $("#remove").unbind("click");
}
/* 
Enable inputs and listeners when done with adding or editing. 
*/
function enableInputs(){
    $(".mainContent input").attr("readOnly", "");
    let $navDivs = $("#sideNav > div");
    $navDivs.click(showInfo);
    $navDivs.click(apiRequest);
    $("#remove").click(remove);
}