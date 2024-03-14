import { addCommas, checkAdmin, createNavbar } from "../../useful-functions.js";
import * as Api from "../../api.js";

// 요소(element), input 혹은 상수
const usersCount = document.querySelector("#usersCount");
const adminCount = document.querySelector("#adminCount");
const usersContainer = document.querySelector("#usersContainer");
const modal = document.querySelector("#modal");
const modalBackground = document.querySelector("#modalBackground");
const modalCloseButton = document.querySelector("#modalCloseButton");
const deleteCompleteButton = document.querySelector("#deleteCompleteButton");
const deleteCancelButton = document.querySelector("#deleteCancelButton");

let pageNumber = 0;  // 현재 페이지 번호
const pageSize = 20;  // 한 페이지에 보여줄 아이템의 수

checkAdmin();
addAllElements();
addAllEvents();

// 요소 삽입 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllElements() {
  createNavbar();
  insertUsers();
  createPagination();
  fetchAllUsers();
}

// 여러 개의 addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {
  modalBackground.addEventListener("click", closeModal);
  modalCloseButton.addEventListener("click", closeModal);
  document.addEventListener("keydown", keyDownCloseModal);
  deleteCompleteButton.addEventListener("click", deleteUserData);
  deleteCancelButton.addEventListener("click", cancelDelete);
}

// 페이지 로드 시 실행, 삭제할 회원 id를 전역변수로 관리함
let userIdToDelete;
async function insertUsers() {
  const users = await Api.get(`/users?page=${pageNumber}&size=${pageSize}`);

  const usersData = users.content;
  usersContainer.innerHTML = '';
  console.log(users);
  // 총 요약에 활용
  // const summary = {
  //   usersCount: 0,
  //   adminCount: 0,
  // };

  for (const user of usersData) {
    const { id, email, name, type, createdAt } = user;
    const date = new Date(createdAt);
    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);

    // summary.usersCount += 1;
    //
    // if (type.includes('Admin')) {
    //   summary.adminCount += 1;
    // }

    usersContainer.insertAdjacentHTML(
      "beforeend",
      `
        <div class="columns orders-item" id="user-${id}">
          <div class="column is-2">${formattedDate}</div>
          <div class="column is-2">${email}</div>
          <div class="column is-2">${name}</div>
          <div class="column is-2">
            <div class="select" >
              <select id="roleSelectBox-${id}">
                <option 
                  class="has-background-link-light has-text-link"
                  ${type.includes('User') === false ? "selected" : ""} 
                  value="User">
                  일반사용자
                </option>
                <option 
                  class="has-background-danger-light has-text-danger"
                  ${type.includes('Admin') === true ? "selected" : ""} 
                  value="Admin">
                  관리자
                </option>
              </select>
            </div>
          </div>
          <div class="column is-2">
            <button class="button" id="deleteButton-${id}" >회원정보 삭제</button>
          </div>
        </div>
      `
    );

    // 요소 선택
    const roleSelectBox = document.querySelector(`#roleSelectBox-${id}`);
    const deleteButton = document.querySelector(`#deleteButton-${id}`);

    // 권한관리 박스에, 선택되어 있는 옵션의 배경색 반영
    const index = roleSelectBox.selectedIndex;
    roleSelectBox.className = roleSelectBox[index].className;

    // 이벤트 - 권한관리 박스 수정 시 바로 db 반영
    roleSelectBox.addEventListener("change", async () => {
      const newRole = roleSelectBox.value;
      const data = { roles: newRole };

      // 선택한 옵션의 배경색 반영
      const index = roleSelectBox.selectedIndex;
      roleSelectBox.className = roleSelectBox[index].className;

      // api 요청
      await Api.patch(`/users`,id, data);
    });

    // 이벤트 - 삭제버튼 클릭 시 Modal 창 띄우고, 동시에, 전역변수에 해당 주문의 id 할당
    deleteButton.addEventListener("click", () => {
      userIdToDelete = id;
      openModal();
    });
  }

  // 총 요약에 값 삽입

}

// db에서 회원정보 삭제
async function deleteUserData(e) {
  e.preventDefault();

  try {
    await Api.delete("/users", userIdToDelete);

    // 삭제 성공
    alert("회원 정보가 삭제되었습니다.");

    // 삭제한 아이템 화면에서 지우기
    const deletedItem = document.querySelector(`#user-${userIdToDelete}`);
    deletedItem.remove();

    // 전역변수 초기화
    userIdToDelete = "";

    closeModal();
  } catch (err) {
    alert(`회원정보 삭제 과정에서 오류가 발생하였습니다: ${err}`);
  }
}

// Modal 창에서 아니오 클릭할 시, 전역 변수를 다시 초기화함.
function cancelDelete() {
  userIdToDelete = "";
  closeModal();
}

// Modal 창 열기
function openModal() {
  modal.classList.add("is-active");
}

// Modal 창 닫기
function closeModal() {
  modal.classList.remove("is-active");
}

// 키보드로 Modal 창 닫기
function keyDownCloseModal(e) {
  // Esc 키
  if (e.keyCode === 27) {
    closeModal();
  }
}

async function createPagination() {

  const totalUsers = await Api.get("/users");
  console.log("페이징"+totalUsers);

  const totalPages = totalUsers.totalPages; // 'totalPages' 키에 접근

  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = ''; // 기존의 페이지네이션 버튼을 초기화합니다.

  for(let i = 0; i < totalPages; i++) {
    const button = document.createElement('button');
    button.innerText = i + 1;
    button.addEventListener('click', function() {
      pageNumber = i;
      insertUsers();
    });
    paginationContainer.appendChild(button);
  }
}

async function fetchAllUsers() {
  let isLastPage = false;
  let number = 0;
  const size = 100; // 원하는 페이지 크기 설정
  let allUsers = [];
  const summary = {
    usersCount: 0,
    adminCount: 0,
  };

  while (!isLastPage) {
    const response = await Api.get(`/users?page=${number}&size=${size}`);
    // API 응답 구조에 따라 데이터와 '마지막 페이지 여부'를 확인
    // 예시에서는 response.data가 사용자 배열이고, response.lastPage로 마지막 페이지 여부를 판단한다고 가정
    allUsers = allUsers.concat(response.content);
    isLastPage = response.last; // 실제 API 응답에 따라 조정 필요

    number++; // 다음 페이지로
  }

  for (const user of allUsers) {
    const { type } = user;
    summary.usersCount += 1;

    if (type.includes('Admin')) {
      summary.adminCount += 1;
    }
  }

  usersCount.innerText = addCommas(summary.usersCount);
  adminCount.innerText = addCommas(summary.adminCount);

}
