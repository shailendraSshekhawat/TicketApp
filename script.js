let allFilters = document.querySelectorAll('.filter');
let openModal = document.querySelector('.open-modal');
let closeModal = document.querySelector('.close-modal');
let ticketsContainer = document.querySelector('.tickets-container');
let allFilterClasses = [];

for(filter of allFilters) {
    allFilterClasses.push(filter.classList[1]);
}

let myDB = window.localStorage;


// this variable is used to keep track if the modal is open or not
let ticketModalOpen = false;
// this var is used to keep know if any text is typed in ticket-text div or not
let isTextTyped = false;

openModal.addEventListener("click", openTicketModal);
closeModal.addEventListener("click", closeTicketModal);

for(filter of allFilters) {

    filter.addEventListener("click", selectFilter);
}

function selectFilter(e) {

    console.log(e.target);
    if(e.target.classList.contains('active-filter')) {
        e.target.classList.remove('active-filter');
        ticketsContainer.innerHTML="";
        loadTickets();
    }
    else {
        if(document.querySelector('.active-filter')) {
            document.querySelector('.active-filter').classList.remove('active-filter');
        }

        e.target.classList.add('active-filter');
        ticketsContainer.innerHTML="";
        let allTickets = JSON.parse(localStorage.getItem("allTickets"));
        if(!allTickets) {
            return;
        }
        let currentFilter = e.target.classList[1];
        for(let ticket of allTickets) {
            if(ticket.ticketFilter == currentFilter) {
                appendTicket(ticket);
            }
        }
    }
}


function loadTickets() {

    let allTickets = JSON.parse(localStorage.getItem("allTickets"));

    if(!allTickets) return;

    for(let ticket of allTickets) {
        appendTicket(ticket);
    }

}

loadTickets();



function openTicketModal(e) {

    console.log(e.target);
// console.log(allFilterClasses);
    if (ticketModalOpen) return;

    let ticketModal = document.createElement("div");
    ticketModal.classList.add('ticket-modal');
    ticketModal.innerHTML = `
        <div class="ticket-text" contenteditable="true"> Enter Your Text
        </div>

        <div class="ticket-filters">
            <div class="ticket-filter2 red selected-filter"></div>
            <div class="ticket-filter2 blue"></div>
            <div class="ticket-filter2 green"></div>
            <div class="ticket-filter2 yellow"></div>
            <div class="ticket-filter2 black"></div>
        </div>
    `;

    document.querySelector('body').append(ticketModal);
    ticketModalOpen = true;
    isTextTyped = false;

    let ticketTextDiv = ticketModal.querySelector('.ticket-text');
    ticketTextDiv.addEventListener("keypress", handleKeyPress);

    let ticketFilters = ticketModal.querySelectorAll('.ticket-filter2');

    for (let i = 0; i < ticketFilters.length; i++) {

        ticketFilters[i].addEventListener("click", function (e) {
            if (e.target.classList.contains("selected-filter")) {
                return;
            }

            document.querySelector('.selected-filter').classList.remove('selected-filter');
            e.target.classList.add('selected-filter');
        })
    }


}

function handleKeyPress(e) {

    if (e.key == "Enter" && isTextTyped && e.target.textContent) {
        // console.log("inside if");
        let filterSelected = document.querySelector('.selected-filter').classList[1];
        let ticketId = uuid();
        let ticketInfoObject = {
            ticketFilter: filterSelected,
            ticketValue: e.target.textContent,
            ticketId: ticketId
        };
        saveTicketToDb(ticketInfoObject);
        closeModal.click();
        appendTicket(ticketInfoObject);
    }
    if(!isTextTyped) {
        isTextTyped = true;
        e.target.textContent = "";
    }

}

function saveTicketToDb(ticketInfoObject) {

    let allTickets = JSON.parse(myDB.getItem("allTickets"));
    if(allTickets) {
        // allTickets = JSON.parse(allTickets);
        allTickets.push(ticketInfoObject);
    }
    else {
        allTickets = [ticketInfoObject];
    }
    myDB.setItem("allTickets", JSON.stringify(allTickets));
}

function closeTicketModal(e) {

    if (ticketModalOpen) {
        document.querySelector('.ticket-modal').remove();
        ticketModalOpen = false;
    }

}

function appendTicket(ticketInfoObject) {

    let { ticketFilter, ticketValue, ticketId } = ticketInfoObject;
    let ticketDiv = document.createElement("div");
    ticketDiv.classList.add('ticket');
    ticketDiv.innerHTML = `
    <div class="ticket-header ${ticketFilter}"> </div>

    <div class="ticket-content">

        <div class="ticket-info">
            <div class="ticket-id">${ticketId}</div>
            <div class="ticket-delete"><i class="fa-solid fa-trash"></i></div>
        </div>

        <div class="ticket-value">${ticketValue}</div>
    </div>
    `;

    document.querySelector('.tickets-container').append(ticketDiv);


    let ticketHeader = document.querySelector(".ticket-header");

    ticketHeader.addEventListener("click", function(e) {
        let currentFilter = e.target.classList[1];
        let indexOfCurrentFilter = allFilterClasses.indexOf(currentFilter);
        let newIndex = (indexOfCurrentFilter + 1) % (allFilterClasses.length);
        let newFilter = allFilterClasses[newIndex];
        ticketHeader.classList.remove(currentFilter);
        ticketHeader.classList.add(newFilter);

        let allTickets = JSON.parse(myDB.getItem("allTickets"));

        for(let i=0; i<allTickets.length; i++) {
            if(allTickets[i].ticketId == ticketId) {
                allTickets[i].ticketFilter = newFilter;
            }
        }

        myDB.setItem("allTickets", JSON.stringify(allTickets));
    });

    let deleteTicketBtn = ticketDiv.querySelector(".ticket-delete");

    deleteTicketBtn.addEventListener("click", function(e) {

        ticketDiv.remove();
        let allTickets = JSON.parse(myDB.getItem("allTickets"));

        let updatedTicket = allTickets.filter((ticket) => {

            if(ticket.ticketId == ticketId) return false;
            return true;
        });

        myDB.setItem("allTickets", JSON.stringify(updatedTicket));
    })


}

