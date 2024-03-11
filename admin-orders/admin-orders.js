import { addCommas, checkAdmin, createNavbar } from "../useful-functions.js";
import * as Api from "../api.js";
// import {
//   title
// } from "../../../../../../../../Library/Application Support/JetBrains/IntelliJIdea2023.3/javascript/extLibs/http_sdk.amazonaws.com_js_aws-sdk-2.410.0";

// 요소(element), input 혹은 상수
const ordersCount = document.querySelector("#ordersCount");
const prepareCount = document.querySelector("#prepareCount");
const deliveryCount = document.querySelector("#deliveryCount");
const completeCount = document.querySelector("#completeCount");
const ordersContainer = document.querySelector("#ordersContainer");
const modal = document.querySelector("#modal");
const modalBackground = document.querySelector("#modalBackground");
const modalCloseButton = document.querySelector("#modalCloseButton");
const deleteCompleteButton = document.querySelector("#deleteCompleteButton");
const deleteCancelButton = document.querySelector("#deleteCancelButton");

let pageNumber = 0;  // 현재 페이지 번호
const pageSize = 10;  // 한 페이지에 보여줄 아이템의 수

checkAdmin();
addAllElements();
addAllEvents();

// 요소 삽입 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllElements() {
  createNavbar();
  insertOrders();
}

// 여러 개의 addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {
  modalBackground.addEventListener("click", closeModal);
  modalCloseButton.addEventListener("click", closeModal);
  document.addEventListener("keydown", keyDownCloseModal);
  deleteCompleteButton.addEventListener("click", deleteOrderData);
  deleteCancelButton.addEventListener("click", cancelDelete);
}

// 페이지 로드 시 실행, 삭제할 주문 id를 전역변수로 관리함
let orderIdToDelete;
async function insertOrders() {
  const userId = sessionStorage.getItem("userId");
  const orders = await Api.get(`/orders?userId=${userId}&?page=${pageNumber}&size=${pageSize}`);

  const ordersData = orders.content;

  const summary = {
    ordersCount: 0,
    prepareCount: 0,
    deliveryCount: 0,
    completeCount: 0,
  };

  for (const order of ordersData) {
    const { id, totalCost, createdAt, summaryTitle, deliveryState } = order;
    console.log(summaryTitle)
    console.log(deliveryState)
    const date = new Date(createdAt);
    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);

    summary.ordersCount += 1;

    if (deliveryState === "상품 준비중") {
      summary.prepareCount += 1;
    } else if (deliveryState === "상품 배송중") {
      summary.deliveryCount += 1;
    } else if (deliveryState === "배송완료") {
      summary.completeCount += 1;
    }

    ordersContainer.insertAdjacentHTML(
      "beforeend",
      `
        <div class="columns orders-item" id="order-${id}">
          <div class="column is-2">${formattedDate}</div>
          <div class="column is-4 order-summary">${summaryTitle}</div>
          <div class="column is-2">${addCommas(totalCost)}</div>
          <div class="column is-2">
            <div class="select" >
              <select id="statusSelectBox-${id}">
                <option 
                  class="has-background-danger-light has-text-danger"
                  ${deliveryState === "상품 준비중" ? "selected" : ""} 
                  value="상품 준비중">
                  상품 준비중
                </option>
                <option 
                  class="has-background-primary-light has-text-primary"
                  ${deliveryState === "상품 배송중" ? "selected" : ""} 
                  value="상품 배송중">
                  상품 배송중
                </option>
                <option 
                  class="has-background-grey-light"
                  ${deliveryState === "배송완료" ? "selected" : ""} 
                  value="배송완료">
                  배송완료
                </option>
              </select>
            </div>
          </div>
          <div class="column is-2">
            <button class="button" id="deleteButton-${id}" >주문 취소</button>
          </div>
        </div>
      `
    );

    // 요소 선택
    const statusSelectBox = document.querySelector(`#statusSelectBox-${id}`);
    const deleteButton = document.querySelector(`#deleteButton-${id}`);

    // 상태관리 박스에, 선택되어 있는 옵션의 배경색 반영
    const index = statusSelectBox.selectedIndex;
    statusSelectBox.className = statusSelectBox[index].className;

    // 이벤트 - 상태관리 박스 수정 시 바로 db 반영
    statusSelectBox.addEventListener("change", async () => {
      const newStatus = statusSelectBox.value;
      const data = { status: newStatus };

      // 선택한 옵션의 배경색 반영
      const index = statusSelectBox.selectedIndex;
      statusSelectBox.className = statusSelectBox[index].className;

      // api 요청
      await Api.patch("/orders", id, data);
    });

    // 이벤트 - 삭제버튼 클릭 시 Modal 창 띄우고, 동시에, 전역변수에 해당 주문의 id 할당
    deleteButton.addEventListener("click", () => {
      // 배송 상태가 '배송 준비 중'인 경우에만 삭제 모달 창을 열어줍니다.
      if (deliveryState === "상품 준비중") {
        orderIdToDelete = id;
        openModal();
      } else {
        // 다른 상태의 주문은 삭제할 수 없다는 경고 메시지를 표시합니다.
        alert("배송 준비 중인 주문만 삭제할 수 있습니다.");
      }
    });
  }

  // 총 요약 값 삽입
  ordersCount.innerText = addCommas(summary.ordersCount);
  prepareCount.innerText = addCommas(summary.prepareCount);
  deliveryCount.innerText = addCommas(summary.deliveryCount);
  completeCount.innerText = addCommas(summary.completeCount);
}

// db에서 주문정보 삭제
async function deleteOrderData(e) {
  e.preventDefault();

  try {
    await Api.delete("/orders", orderIdToDelete);

    // 삭제 성공
    alert("주문 정보가 삭제되었습니다.");

    // 삭제한 아이템 화면에서 지우기
    const deletedItem = document.querySelector(`#order-${orderIdToDelete}`);
    deletedItem.remove();

    // 전역변수 초기화
    orderIdToDelete = "";

    closeModal();
  } catch (err) {
    alert(`주문정보 삭제 과정에서 오류가 발생하였습니다: ${err}`);
  }
}

// Modal 창에서 아니오 클릭할 시, 전역 변수를 다시 초기화함.
function cancelDelete() {
  orderIdToDelete = "";
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
