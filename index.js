let progress = false;
const answer = [];
let seconds = 0;
let timerInterval;
let types = ["s", "d", "h", "c"];
function time() {
    seconds++;
    document.querySelector(".countdown").innerText = timeformat(seconds);
}
function init() {
    const divCountDown = document.querySelector(".countdown");
    divCountDown.innerText = "카운트다운";
    seconds = 0;
    progress = false
    answer.length = 0;
}
function start() {
    init();
    let cardCount = 0;
    let countDown = 3;
    let arr = [];
    const arr1 = [];
    const arr2 = [];
    const board = document.querySelector(".board");
    const divCountDown = document.querySelector(".countdown");
    while (true) {
        cardCount = prompt("게임할 카드 수를 짝수로 입력하세요.");
        if (cardCount == null) {
            return;
        } else if (Number(cardCount) % 2 == 0) {
            break;
        }
    }
    cardCount = Number(cardCount);
    const cardlist = [];
    for (let i = 0; i < cardCount; i++) {
        const card = document.createElement("div");
        card.classList.add("card");
        const back = document.createElement("div");
        back.classList.add("back");
        const front = document.createElement("div");
        front.classList.add("front");
        card.appendChild(back);
        card.appendChild(front);
        cardlist.push(card);
    }
    board.replaceChildren(...cardlist);
    let rows;
    let cols;
    if (cardCount > 10) {
        if (cardCount % 4 == 0) {
            rows = 4;
            cols = cardCount / 4;
        } else if (cardCount % 3 == 0) {
            rows = 3;
            cols = cardCount / 3;
        } else {
            rows = 2;
            cols = cardCount / 2;
        }
    } else {
        rows = 2;
        cols = cardCount / 2;
    }
    const item = document.querySelector(".board .card:first-child");
    board.style.width = `${item.offsetWidth * cols}px`;
    board.style.gridTemplateColumns = `repeat(${cols},1fr)`;
    board.style.gridTemplateRows = `repeat(${rows},1fr)`;
    const cards = document.querySelectorAll(".card");

    for (const card of cards) {
        card.classList.remove("flip");
    }
    while (true) {
        let ran = types[random(4)] + (random(12) + 1);
        if (!arr1.includes(ran)) {
            arr1.push(ran);
            arr2.push(ran);

        };
        if (arr1.length == cards.length / 2) {
            break;
        }
    }
    arr = arr1.concat(arr2);
    for (const card of cards) {
        let ran = random(arr.length);
        card.lastElementChild.data = arr[ran];
        card.lastElementChild.style.backgroundImage = `url("img/card/${arr[ran]}.png")`;
        arr.splice(ran, 1);
        card.classList.add("flip");
    }
    let interval = setInterval(function () {
        if (countDown == 0) {
            countDown = "시작";
            for (const card of cards) {
                card.classList.remove("flip");
                card.addEventListener("click", cardClick, false);
            }
            clearInterval(interval);
            timerInterval = setInterval(time, 1000);
        }
        divCountDown.innerText = countDown;
        countDown--;
    }, 1000);
}

function random(limit) {
    return parseInt(Math.random() * limit);
}

function cardClick(event) {
    const target = event.currentTarget;
    if (answer.length < 2 && !answer.includes(target)) {
        target.classList.toggle("flip");
        answer.push(target);
    }
    if (answer.length == 2 && !progress) {
        progress = true;
        setTimeout(() => {
            if (answer[0].lastElementChild.data != answer[1].lastElementChild.data) {
                answer[0].classList.toggle("flip");
                answer[1].classList.toggle("flip");
                console.log("실패!");
            } else {
                console.log("성공!");
                answer[0].removeEventListener("click", cardClick, false);
                answer[1].removeEventListener("click", cardClick, false);
                //모두다 성공하면 알림창띄우기
                if (document.querySelectorAll(".flip").length == document.querySelectorAll(".card").length) {
                    clearInterval(timerInterval);
                    const name = prompt("이름을 입력하세요.");
                    save(name, document.querySelectorAll(".card").length);
                    if (confirm("게임 종료\n 한번 더?")) {
                        start();
                    }
                }
            }
            answer.length = 0;
            progress = false;
        },1000);
    }
}

function save(name, cardCount) {
    const obj = { name: name, cardcount: cardCount, seconds: seconds };
    let list = JSON.parse(localStorage.getItem("save"));
    if (list == null) {
        list = [];
    }
    list.push(obj);
    localStorage.setItem("save", JSON.stringify(list));
    retrieve();
}

function retrieve() {
    let list = JSON.parse(localStorage.getItem("save"));
    if (list != null) {
        list.sort(function(a,b){
            if(a.cardcount > b.cardcount){
                return 1;
            }else if (a.cardcount == b.cardcount){
                if(a.seconds > b.seconds){
                    return 1;
                }else{
                    return -1;
                }
            }else{
                return -1;
            }
        });
        const ul = document.querySelector("ul")
        const liList = [];
        for (const obj of list) {
            const li = document.createElement("li");
            li.innerText = `${obj.cardcount} / ${obj.name} / ${timeformat(obj.seconds)}`;
            liList.push(li);
        }
        ul.replaceChildren(...liList);
    }
}
retrieve();

function timeformat(seconds) {
    return (parseInt(seconds / 60) < 10 ? "0" + parseInt(seconds / 60) : parseInt(seconds / 60)) + ":" + (seconds % 60 < 10 ? "0" + seconds % 60 : seconds % 60);
}