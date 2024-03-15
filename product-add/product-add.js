import { addImageToS3 } from "../../aws-s3.js";
import * as Api from "../../api.js";
import { checkLogin, randomId, createNavbar } from "../../useful-functions.js";

// 요소(element)들과 상수들
const nameInput = document.querySelector("#nameInput");
const categorySelectBox = document.querySelector("#categorySelectBox");
const descriptionInput = document.querySelector(
  "#descriptionInput"
);
const imageInput = document.querySelector("#imageInput");
const stockInput = document.querySelector("#stockInput");
const priceInput = document.querySelector("#priceInput");
const submitButton = document.querySelector("#submitButton");
const registerProductForm = document.querySelector("#registerProductForm");

checkLogin();
addAllElements();
addAllEvents();

// html에 요소를 추가하는 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllElements() {
  createNavbar();
  addOptionsToSelectBox();
}

// addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {
  imageInput.addEventListener("change", handleImageUpload);
  submitButton.addEventListener("click", handleSubmit);
  categorySelectBox.addEventListener("change", handleCategoryChange);
  // addKeywordButton.addEventListener("click", handleKeywordAdd);
}

// 제품 추가 - 사진은 AWS S3에 저장, 이후 제품 정보를 백엔드 db에 저장.
async function handleSubmit(e) {
  e.preventDefault();

  const name = nameInput.value;
  const categoryId = categorySelectBox.value;
  const description = descriptionInput.value;
  const file = imageInput.files[0];
  const stock = parseInt(stockInput.value);
  const price = parseInt(priceInput.value);
  const userId = sessionStorage.getItem("userId");
  let images = ''; // 기본 값으로 빈 문자열 설정


  // 입력 칸이 비어 있으면 진행 불가
  if (
    !userId ||
    !name ||
    !categoryId ||
    !description ||
      !file ||
      !stock ||
    !price
  ) {
    return alert("빈 칸 및 0이 없어야 합니다.");
  }

        if (file.size > 3e6) {
            return alert("사진은 최대 2.5MB 크기까지 가능합니다.");
        }


  // S3 에 이미지가 속할 폴더 이름은 카테고리명으로 함.
  const index = categorySelectBox.selectedIndex;
  const categoryName = categorySelectBox[index].text;

  console.log("index is ", index);
  console.log("category Name is ",categoryName);
  console.log("imageInput is ",imageInput);

  try {
  // Ensure that the input element is not null
     if (file) {
        console.log(file);
        console.log(file.name);
        images = await addImageToS3(file, categoryName);
        console.log("images ", images);
   }
    const data = {
      userId,
      name,
      categoryId,
      description,
      images,
      stock,
      price,
    };
    console.log(data);
    console.trace('Current Call Stack: get ');
    await Api.post("/products", data);

    alert(`정상적으로 ${name} 제품이 등록되었습니다.`);
    window.location.href = `/products/category/${categoryId}`;


      // 폼 초기화
    registerProductForm.reset();
    fileNameSpan.innerText = "";
    // keywordsContainer.innerHTML = "";
    categorySelectBox.style.color = "black";
    categorySelectBox.style.backgroundColor = "white";
    // searchKeywords = [];
  } catch (err) {
    console.log(err.stack);

    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }

}

// 사용자가 사진을 업로드했을 때, 파일 이름이 화면에 나타나도록 함.
function handleImageUpload() {
  const file = imageInput.files[0];
  if (file) {
    fileNameSpan.innerText = file.name;
  } else {
    fileNameSpan.innerText = "";
  }
}

// 선택할 수 있는 카테고리 종류를 api로 가져와서, 옵션 태그를 만들어 삽입함.
async function addOptionsToSelectBox() {
  const categories = await Api.get("/categories");
  console.log(categories);
  categories.forEach((category) => {
    // 객체 destructuring
    const { id, title, themeClass } = category;

    categorySelectBox.insertAdjacentHTML(
      "beforeend",
      `
      <option value=${id} class="notification ${themeClass}"> ${title} </option>`
    );
  });
}

// 카테고리 선택 시, 선택박스에 해당 카테고리 테마가 반영되게 함.
function handleCategoryChange() {
  const index = categorySelectBox.selectedIndex;

  categorySelectBox.className = categorySelectBox[index].className;
}
console.log({nameInput, categorySelectBox, descriptionInput, imageInput, stockInput, priceInput});



