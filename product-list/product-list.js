import { getImageUrl } from "../../aws-s3.js";
import * as Api from "../../api.js";
import {
  randomId,
  getUrlParams,
  addCommas,
  navigate,
  checkUrlParams,
  createNavbar,
} from "../../useful-functions.js";

// 요소(element), input 혹은 상수
const productItemContainer = document.querySelector("#producItemContainer");

let pageNumber = 0;  // 현재 페이지 번호
const pageSize = 9;  // 한 페이지에 보여줄 아이템의 수
// checkUrlParams("category");
addAllElements();
addAllEvents();

// html에 요소를 추가하는 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllElements() {
  //createNavbar();
  addProductItemsToContainer();
  createPagination();
}

// addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {}



async function addProductItemsToContainer() {

  const path = window.location.pathname;
  const id = path.split('/').pop();
  console.log(pageNumber);
  const products = await Api.get(`/products/category/${id}?page=${pageNumber}&size=${pageSize}`);
  console.log(pageNumber);
  console.log(products);

  if(!products){
    return
  }

  const productData = products.content;  // 'content' 키에 접근
  productItemContainer.innerHTML = '';

  for (const product of productData) {

    // 객체 destructuring
    const { id, name, price, description, images} =
      product;
    const imageUrl = await getImageUrl(images);
    const random = randomId();

    productItemContainer.insertAdjacentHTML(
      "beforeend",
      `
<div class="product-item" id="a${random}">
  <div class="media-left">
    <figure class="image">
      <img src="${imageUrl}" alt="제품 이미지" />
    </figure>
  </div>
  <div class="media-content">
    <div class="content">
      <p class="title">${name}</p>
      <p class="price">${addCommas(price)}원</p>
    </div>
  </div>
</div>
      `
    );



    const productItem = document.querySelector(`#a${random}`);
    productItem.addEventListener(
      "click",
      navigate(`/product/${id}`)
    );
    console.log(id);
  }

}

async function createPagination() {
  const path = window.location.pathname;
  const id = path.split('/').pop();
  const totalProducts = await Api.get(`/products/category/${id}`);

  const totalPages = totalProducts.totalPages; // 'totalPages' 키에 접근

  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = ''; // 기존의 페이지네이션 버튼을 초기화합니다.

  for(let i = 0; i < totalPages; i++) {
    const button = document.createElement('button');
    button.innerText = i + 1;
    button.addEventListener('click', function() {
      pageNumber = i;
      addProductItemsToContainer();
    });

    button.style.marginRight= "5px";
    button.style.padding = "10px 20px";
    button.style.border = "none";
    button.style.outline ="none";
    button.style.fontSize = "16px";
    button.style.fontWeight = "600";
    button.style.color = "white";
    button.style.transition = "all 0.3s ease";
    button.style.boxShadow = "0 4px 6px rgba(255, 121, 180, 0.4)";
    button.style.borderRadius = "25px"
    button.style.cursor = "pointer";
    button.style.backgroundImage = "linear-gradient(to right, #89d4cf 0%, #6fb8df 100%)";


    paginationContainer.appendChild(button);
  }
}
