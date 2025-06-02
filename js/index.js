//slide
let slideInterval= null;
function moveSlide(event){
    if(slideInterval){
        clearInterval(slideInterval);
    }
    const nodeList = $(".slide .slide-wrapper .dot-wrapper li");
    $(".slide .slide-wrapper .dot-wrapper li .dot.current").classList.remove("current");
    event.currentTarget.classList.add("current");
    const idx = Array.from(nodeList).indexOf(event.currentTarget.closest("li"));
    const targetLocation = -800 * idx;
    slideInterval = setInterval(function(){
        const left = Number($(".slide .slide-wrapper .item-wrapper").style.marginLeft.replace("px",""));
        $(".slide .slide-wrapper .item-wrapper").style.marginLeft = (left + (targetLocation - left) * 0.1) +"px";
        if(Math.abs(targetLocation - left) < 5){
            $(".slide .slide-wrapper .item-wrapper").style.marginLeft = targetLocation+"px";
            clearInterval(slideInterval);
            slideInterval = null;
        }
    },30);
}

// diary
let currentYear;
let currentMonth;
function initSchedule() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    setDiary(year, month);
}

function setDiary(year, month) {
    $("#selYear").value = year;
    $("#selMonth").value = month + 1;

    const today = new Date();
    const dt = new Date(year, month, 1);
    const yyyy = dt.getFullYear();
    const mm = dt.getMonth();
    currentYear = yyyy;
    currentMonth = mm;
    const day = dt.getDay();
    const dd = dt.getDate();
    const firstDay = new Date(yyyy, mm, 1).getDay();
    let lastDd = new Date(yyyy, mm + 1, 0).getDate();
    if ((firstDay + lastDd) % 7 != 0) {
        lastDd += 7 - (firstDay + lastDd) % 7;
    }
    const divDays = [];
    for (let i = -firstDay + 1; i <= lastDd; i++) {
        const divDay = document.createElement("div");
        const divHead = document.createElement("div");
        const divDt = new Date(yyyy, mm, i);
        divHead.classList.add("day-head");
        divHead.dataset.year = divDt.getFullYear();
        divHead.dataset.month = divDt.getMonth() + 1 < 10 ? "0" + (divDt.getMonth() + 1) : (divDt.getMonth() + 1);
        divHead.dataset.date = divDt.getDate() < 10 ? "0" + divDt.getDate() : divDt.getDate();
        divHead.addEventListener("click", (e) => {
            openScheduleForm();
            regSchduleForm.date.value = e.currentTarget.dataset.year + "-" + e.currentTarget.dataset.month + "-" + e.currentTarget.dataset.date;
        });
        divDay.classList.add("day");
        if (divDt.getFullYear() == yyyy && divDt.getMonth() == mm) {
            divDay.classList.add("active");
        }
        if (today.getFullYear() == divDt.getFullYear() && today.getMonth() == divDt.getMonth() && today.getDate() == divDt.getDate()) {
            divDay.classList.add("today");
        }
        divHead.innerText = divDt.toLocaleDateString();
        const list = retrieveScheduleData(divDt.getFullYear(), divDt.getMonth(), divDt.getDate());
        divDay.appendChild(divHead);
        if (list) {
            divHead.innerText += "(" + list.length + ")";
            for (const data of list) {
                const dateSchedule = document.createElement("div");
                dateSchedule.innerText = data.title;
                dateSchedule.classList.add("date-schedule");
                dateSchedule.addEventListener("click", () => {
                    openScheduleForm(data);
                });
                divDay.appendChild(dateSchedule);
            }
        }
        divDays.push(divDay);
    }
    $(".diary").replaceChildren(...divDays);
}

function registerSchedule() {
    if (!regSchduleForm.date.value) {
        alert("날짜를 선택하세요.");
        regSchduleForm.date.focus();
        return;
    }
    if (!regSchduleForm.title.value) {
        alert("제목을 입력하세요.");
        regSchduleForm.title.focus();
        return;
    }
    if (!regSchduleForm.content.value) {
        alert("내용을 입력하세요.");
        regSchduleForm.content.focus();
        return;
    }

    const formData = new FormData(regSchduleForm);
    const data = {};
    formData.forEach(function (val, key) {
        data[key] = val;
    });
    registerScheduleData(data);
    alert("등록되었습니다.");

    const date = new Date(regSchduleForm.date.value);
    setDiary(date.getFullYear(), date.getMonth());
    closeScheduleForm();
}

function registerScheduleData(data) {
    let schedule = JSON.parse(localStorage.getItem("schedule"));
    if (schedule == null) {
        schedule = {};
    }
    let dateSchedule = schedule[data.date];
    if (dateSchedule == null) {
        dateSchedule = [];
    }
    if (data.seq) {
        for (let idx in dateSchedule) {
            if (dateSchedule[idx].seq == data.seq) {
                dateSchedule[idx] = data;
            }
        }
    } else {
        data.seq = getScheduleSeq();
        data.createDate = new Date().toLocaleDateString();
        dateSchedule.push(data);
    }
    schedule[data.date] = dateSchedule;
    localStorage.setItem("schedule", JSON.stringify(schedule));
}

function deleteSchedule() {
    if (confirm("정말 삭제하시겠습니까?")) {
        const seq = regSchduleForm.seq.value;
        const date = regSchduleForm.date.value;
        let schedule = JSON.parse(localStorage.getItem("schedule"));
        let dateSchedule = schedule[date];
        for (let idx in dateSchedule) {
            if (dateSchedule[idx].seq == seq) {
                dateSchedule.splice(idx, 1);
                break;
            }
        }
        if (dateSchedule.length == 0) {
            delete schedule[date];
        } else {
            schedule[date] = dateSchedule;
        }
        localStorage.setItem("schedule", JSON.stringify(schedule));
        setDiary(currentYear, currentMonth);
        closeScheduleForm();
        alert("삭제되었습니다.");
    }
}

function retrieveScheduleData(yyyy, mm, dd) {
    let schedule = JSON.parse(localStorage.getItem("schedule"));
    if (schedule == null) {
        return null;
    }
    mm++;
    if (mm < 10) {
        mm = "0" + mm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    return schedule[yyyy + "-" + mm + "-" + dd];
}

function moveDiary() {
    const year = $("#selYear").value;
    const month = $("#selMonth").value;
    setDiary(year, month - 1);
}

function openScheduleForm(data) {
    $(".schedule .register").classList.add("open");
    if (data) {
        regSchduleForm.seq.value = data.seq;
        regSchduleForm.date.value = data.date;
        regSchduleForm.title.value = data.title;
        regSchduleForm.content.value = data.content;
        regSchduleForm.createDate.value = data.createDate;
        $("#regSchduleForm .btn-delete").style.display = "block";
        $("#regSchduleForm .btn-register").value = "수정";
    } else {
        $("#regSchduleForm .btn-register").value = "등록";
        $("#regSchduleForm .btn-delete").style.display = "none";
    }
}

function closeScheduleForm() {
    regSchduleForm.reset();
    $(".schedule .register").classList.remove("open");
}

function getScheduleSeq() {
    let seq = localStorage.getItem("scheduleSeq");
    if (seq) {
        seq++;
    } else {
        seq = 1;
    }
    localStorage.setItem("scheduleSeq", seq);
    return seq;
}
initSchedule();

//board
let currentPage = 0;
let pageLength = 15;
function initBoard() {

}

function registerBoard() {
    if (!regBoardForm.userName.value) {
        alert("제목을 입력하세요.");
        regBoardForm.userName.focus();
        return;
    }
    if (!regBoardForm.title.value) {
        alert("제목을 입력하세요.");
        regBoardForm.title.focus();
        return;
    }
    if (!regBoardForm.content.value) {
        alert("내용을 입력하세요.");
        regBoardForm.content.focus();
        return;
    }

    const formData = new FormData(regBoardForm);
    const data = {};
    formData.forEach(function (val, key) {
        data[key] = val;
    });
    const seq = data.seq;
    registerBoardData(data);
    alert("등록되었습니다.");
    if(seq){
        setBoard(currentPage);
    }else{
        setBoard(0);
    }
    
    closeBoardForm();
}

function registerBoardData(data) {
    let board = JSON.parse(localStorage.getItem("board"));
    if (board == null) {
        board = [];
    }
    if (data.seq) {
        for (const idx in board) {
            if (board[idx].seq == data.seq) {
                board[idx] = data;
                break;
            }
        }
    } else {
        data.seq = getBoardSeq();
        data.createDate = new Date().toLocaleDateString();
        console.log(data);

        board.push(data);
    }
    localStorage.setItem("board", JSON.stringify(board));
}

function deleteBoard() {
    if (confirm("정말 삭제하시겠습니까?")) {
        const seq = regBoardForm.seq.value;
        const board = JSON.parse(localStorage.getItem("board"));
        for (const idx in board) {
            if (board[idx].seq == seq) {
                board.splice(idx, 1);
            }
        }
        localStorage.setItem("board", JSON.stringify(board));
        closeBoardForm();
        setBoard(currentPage);
        alert("삭제되었습니다.");
    }
}

function openBoardForm(data) {
    $(".board .register").classList.add("open");
    if (data) {
        regBoardForm.seq.value = data.seq;
        regBoardForm.userName.value = data.userName;
        regBoardForm.title.value = data.title;
        regBoardForm.content.value = data.content;
        regBoardForm.createDate.value = data.createDate;
        $("#regBoardForm input[name=userName]").readOnly=true;
        $("#regBoardForm .btn-delete").style.display = "block";
        $("#regBoardForm .btn-register").value = "수정";
    } else {
        $("#regBoardForm input[name=userName]").readOnly=false;
        $("#regBoardForm .btn-register").value = "등록";
        $("#regBoardForm .btn-delete").style.display = "none";
    }
}

function closeBoardForm() {
    regBoardForm.reset();
    $(".board .register").classList.remove("open");
}

function getBoardSeq() {
    let seq = localStorage.getItem("boardSeq");
    if (seq) {
        seq++;
    } else {
        seq = 1;
    }
    localStorage.setItem("boardSeq", seq);
    return seq;
}

function setBoard(page) {
    currentPage = page;
    const list = retrieveBoardData();
    if(list){
        list.reverse();
        const trList = [];
        const start = page * pageLength;
        let end = page * pageLength + pageLength;
        if (end > list.length) {
            end = list.length;
        }
        for (let idx = start; idx < end; idx++) {
            const data = list[idx];
            const trBoard = document.createElement("tr");
            const tdSeq = document.createElement("td");
            const tdTitle = document.createElement("td");
            const tdUserName = document.createElement("td");
            const tdCreateDate = document.createElement("td");
    
            tdSeq.innerText = data.seq;
            tdTitle.innerText = data.title;
            tdUserName.innerText = data.userName;
            tdCreateDate.innerText = data.createDate;
            trBoard.appendChild(tdSeq);
            trBoard.appendChild(tdTitle);
            trBoard.appendChild(tdUserName);
            trBoard.appendChild(tdCreateDate);
            trBoard.addEventListener("click", () => {
                openBoardForm(data);
            });
            trList.push(trBoard);
        }
        $(".board tbody").replaceChildren(...trList);
    
        let pageCount = parseInt(list.length / pageLength);
        if(list.length % pageLength > 0){
            pageCount++;
        }
        let startPage = parseInt(page / 10) * 10;
        let lastPage = startPage + 10;
        if(lastPage > pageCount){
            lastPage = pageCount;
        }
        const liList = [];
        if(startPage != 0 ){//first page;
            const li = document.createElement("li");
            const pageLink = document.createElement("a");
            pageLink.href = `javascript:setBoard(0)`;
            pageLink.innerText = "<<";
            li.appendChild(pageLink);
            liList.push(li);
        }
        if(startPage != 0 ){//prev page group;
            const li = document.createElement("li");
            const pageLink = document.createElement("a");
            pageLink.href = `javascript:setBoard(${startPage-10})`;
            pageLink.innerText = "<";
            li.appendChild(pageLink);
            liList.push(li);
        }
        for (let i = startPage; i < lastPage; i++) {
            const li = document.createElement("li");
            const pageLink = document.createElement("a");
            pageLink.href = `javascript:setBoard(${i})`;
            pageLink.innerText = i+1;
            if(i == page){
                pageLink.classList.add("current");
            }
            li.appendChild(pageLink);
            liList.push(li);
        }
        if(lastPage != pageCount){//next page group;
            const li = document.createElement("li");
            const pageLink = document.createElement("a");
            pageLink.href = `javascript:setBoard(${startPage+10})`;
            pageLink.innerText = ">";
            li.appendChild(pageLink);
            liList.push(li);
        }
        if(lastPage != pageCount){// last page;
            const li = document.createElement("li");
            const pageLink = document.createElement("a");
            pageLink.href = `javascript:setBoard(${pageCount-1})`;
            pageLink.innerText = ">>";
            li.appendChild(pageLink);
            liList.push(li);
        }
        $(".board table tfoot ul").replaceChildren(...liList);
    }
}

function retrieveBoardData() {
    return JSON.parse(localStorage.getItem("board"));
}



function insertData(max) {
    localStorage.removeItem("board");
    localStorage.removeItem("boardSeq");
    for (let idx = 0; idx < max; idx++) {
        registerBoardData({ title: "공통제목" + idx, content: "공통내용" + idx, createDate: new Date().toLocaleDateString(), userName: "작성자" + idx });
    }
}
setBoard(0);








startTransitionIn();


















































// function selector(str, isAll) {
//     if (isAll) {
//         return document.querySelectorAll(str);
//     } else {
//         return document.querySelector(str);
//     }
// }

// function greeting() {
//     alert("방문을 환영합니다.");
// }

// function changeContent(event) {
//     event.target.nextElementSibling.innerHTML = "얖얖!!";
// }

// function inputName(event) {
//     const name = prompt("이름을 입력하세요.");
//     event.target.nextElementSibling.innerHTML = name;
// }

// function toggleLayout() {
//     for (const ele of selector("hr", true)) {
//         ele.classList.toggle("thick");
//     }
// }

// function changeStyle(event) {
//     const target = event.target.nextElementSibling;
//     const style = prompt("스타일을 입력하세요.\n 입력방법은 bg:색상, color:색상, size:숫자");
//     const arr = style.split(",");
//     for (const item of arr) {
//         const itemArr = item.split(":");
//         console.log(itemArr);
//         if (itemArr[0].indexOf("bg") > -1) {
//             target.style.backgroundColor = itemArr[1];
//         }
//         if (itemArr[0].indexOf("color") > -1) {
//             target.style.color = itemArr[1];
//         }
//         if (itemArr[0].indexOf("size") > -1) {
//             target.style.width = itemArr[1] + "px";
//             target.style.height = itemArr[1] + "px";
//         }
//     }
// }