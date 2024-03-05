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

//checkUrlParams("category");
addAllElements();
addAllEvents();

// html에 요소를 추가하는 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllElements() {
  //createNavbar();
  addProductItemsToContainer();
}

// addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {}

async function addProductItemsToContainer() {
  const { categoryId } = getUrlParams();
  console.log(categoryId);
  const products = await Api.get(`/products/category/${categoryId}`);

  for (const product of products) {
    // 객체 destructuring
    const { id, name, price, stock, description, images, createdAt, updatedAt} =
      product;
    const imageUrl = await getImageUrl(images);
    const random = randomId();

    productItemContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="message media product-item" id="a${random}">
        <div class="media-left">
          <figure class="image">
            <img
              src="${imageUrl}"
              alt="제품 이미지"
            />
          </figure>
        </div>
        <div class="media-content">
          <div class="content">
            <p class="title">
              ${name}
             
            </p>
            <p class="description">${description}</p>
            <p class="price">${addCommas(price)}원</p>
          </div>
        </div>
      </div>
      `
    );

    const productItem = document.querySelector(`#a${random}`);
    productItem.addEventListener(
      "click",
      navigate(`/product/detail?id=${id}`)  // 이게 뭔지 모르겠다.. 왜 poroduct폴더안의 detail이 없는데
      // 어떻게 product-detail 폴더의 product-detail .html 로 열리는 걸까 
    );
  }
}
