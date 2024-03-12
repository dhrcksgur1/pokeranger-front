import { getImageUrl } from "../../aws-s3.js";
import * as Api from "../../api.js";
import {
  getUrlParams,
  addCommas,
  checkUrlParams,
    navigate,
  createNavbar,
} from "../../useful-functions.js";
import { addToDb, putToDb } from "../../indexed-db.js";

// 요소(element), input 혹은 상수
const productImageTag = document.querySelector("#productImageTag");
const manufacturerTag = document.querySelector("#manufacturerTag");
const titleTag = document.querySelector("#titleTag");
const detailDescriptionTag = document.querySelector("#detailDescriptionTag");
const addToCartButton = document.querySelector("#addToCartButton");
const purchaseButton = document.querySelector("#purchaseButton");

//수정삭제 추가
const editProductButton = document.querySelector("#editProductButton");
const deleteProductButton = document.querySelector("#deleteProductButton");

let getProductRegisterUserId;

// checkUrlParams("id");
addAllElements();
addAllEvents();

// html에 요소를 추가하는 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllElements() {
  createNavbar();
  insertProductData();
}

// addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {}


//삭제후에 페이지 리로드
window.addEventListener('pageshow', (event) => {
  // Check if there's a flag indicating we should reload the page
  if (sessionStorage.getItem('shouldReload') === 'true') {
    sessionStorage.removeItem('shouldReload'); // Clear the flag to avoid reloading again on the next visit
    window.location.reload(); // Reload the page
  }
});

async function insertProductData() {
  const path = window.location.pathname;
  console.log(path);
  const id = path.split('/').pop();
  //id값 인트형으로 형변환
  const newId = parseInt(id);
  const product = await Api.get(`/products/${newId}`);

console.log(newId);
  // 객체 destructuring
  const {
    userId,
    name,
    description,
     userName,
    images,
    // isRecommended,
    price,
  } = product;
  const imageUrl = await getImageUrl(images);

  console.log(userId,name,description,images,userName);

  getProductRegisterUserId=userId;

  productImageTag.src = imageUrl;
  titleTag.innerText = name;
  detailDescriptionTag.innerText = description;
  priceTag.innerText = `${addCommas(price)}원`;
  manufacturerTag.innerText = userName;

  // if (isRecommended) {
  //   titleTag.insertAdjacentHTML(
  //     "beforeend",
  //     '<span class="tag is-success is-rounded">추천</span>'
  //   );
  // }

  addToCartButton.addEventListener("click", async () => {
    try {
      await insertDb(product);

      alert("장바구니에 추가되었습니다.");
    } catch (err) {
      // Key already exists 에러면 아래와 같이 alert함
      if (err.message.includes("Key")) {
        alert("이미 장바구니에 추가되어 있습니다.");
      }

      console.log(err);
    }
  });

  purchaseButton.addEventListener("click", async () => {
    try {
      await insertDb(product);

      window.location.href = "/order";
    } catch (err) {
      console.log(err);

      //insertDb가 에러가 되는 경우는 이미 제품이 장바구니에 있던 경우임
      //따라서 다시 추가 안 하고 바로 order 페이지로 이동함
      window.location.href = "/order";
    }
  });

//수정 버튼
//   editProductButton.addEventListener("click", async () => {
//
//
//     const editItem = document.querySelector(`#a${newId}`);
//     editItem.addEventListener(
//         "click",
//         window.location.href = "/product/edit/{newId}";
//
//     );
//
//     try {
//       alert("제품이 수정되었습니다.");
//       // 삭제 성공 후 필요한 작업 수행, 예: 제품 목록 페이지로 이동
//       // window.location.href = `/products/${newId}`;
//     } catch (error) {
//       alert("제품 수정에 실패했습니다.");
//     }
//   });

  editProductButton.addEventListener("click", async () => {
    const getUserId = sessionStorage.getItem('userId');
    if(getUserId !== getProductRegisterUserId){
      console.log(getProductRegisterUserId);
      console.log(getUserId);

      return alert("작성자가 아닙니다");
    }
    const editItem = document.querySelector(`#a${newId}`);
    if (editItem) { // editItem이 존재하는지 확인
      editItem.addEventListener("click", (event) => {
        event.preventDefault(); // 기본 이벤트를 방지
      });
    } else {
      console.error('Edit item not found');
    }
      window.location.href = `/product/edit/${id}`;
  });


// 삭제 버튼 이벤트 리스너
  deleteProductButton.addEventListener("click", async () => {
    if(getProductRegisterUserId !== sessionStorage.getItem('userId')){
      return alert("작성자가 아닙니다");
    }
    try {
      await Api.delete(`/products/${id}`);
      alert("제품이 삭제되었습니다.");
      // 삭제 성공 후 필요한 작업 수행, 예: 제품 목록 페이지로 이동
      // window.location.href = `/products/category/${categoryId}`;
      sessionStorage.setItem('shouldReload', 'true');
      window.history.back();

    } catch (error) {
      alert("제품 삭제에 실패했습니다.");
    }
  });

}

async function insertDb(product) {
  // 객체 destructuring
  const { id: id, price } = product;

  // 장바구니 추가 시, indexedDB에 제품 데이터 및
  // 주문수량 (기본값 1)을 저장함.
  await addToDb("cart", { ...product, quantity: 1 }, id);

  // 장바구니 요약(=전체 총합)을 업데이트함.
  await putToDb("order", "summary", (data) => {
    // 기존 데이터를 가져옴
    const count = data.productsCount;
    const total = data.productsTotal;
    const ids = data.ids;
    const selectedIds = data.selectedIds;

    // 기존 데이터가 있다면 1을 추가하고, 없다면 초기값 1을 줌
    data.productsCount = count ? count + 1 : 1;

    // 기존 데이터가 있다면 가격만큼 추가하고, 없다면 초기값으로 해당 가격을 줌
    data.productsTotal = total ? total + price : price;

    // 기존 데이터(배열)가 있다면 id만 추가하고, 없다면 배열 새로 만듦
    data.ids = ids ? [...ids, id] : [id];

    // 위와 마찬가지 방식
    data.selectedIds = selectedIds ? [...selectedIds, id] : [id];
  });
}
