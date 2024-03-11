/*
import { addImageToS3 } from "../../aws-s3.js";
import * as Api from "../../api.js";
import { checkLogin, randomId, createNavbar } from "../../useful-functions.js";

// 요소(element)들과 상수들
const nameInput = document.querySelector("#nameInput");
const categorySelectBox = document.querySelector("#categorySelectBox");
const manufacturerInput = document.querySelector("#manufacturerInput");
const descriptionInput = document.querySelector(
    "#descriptionInput"
);

const imageInput = document.querySelector("#imageInput");
const stockInput = document.querySelector("#stockInput");
const priceInput = document.querySelector("#priceInput");
const submitButton = document.querySelector("#submitButton");

checkLogin();
addAllElements();
addAllEvents();

// html에 요소를 추가하는 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllElements() {
    createNavbar();
    addOptionsToSelectBox();
    imageInput.addEventListener("change", handleImageUpload);
    submitButton.addEventListener("click", handleUpdate); // 수정 이벤트 핸들러로 변경
}

// addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {
    imageInput.addEventListener("change", handleImageUpload);
    submitButton.addEventListener("click", handleSubmit);
    categorySelectBox.addEventListener("change", handleCategoryChange);
    // addKeywordButton.addEventListener("click", handleKeywordAdd);
}

// 제품 추가 - 사진은 AWS S3에 저장, 이후 제품 정보를 백엔드 db에 저장.


// 기존의 제품 정보를 불러오는 함수 (예시)
async function loadProductData(productId) {
    const productData = await Api.get(`/products/${id}`);
    // 예시: 데이터 로딩 후 입력 필드에 값 설정
    nameInput.value = productData.name;
    descriptionInput.value = productData.description;
    // 기타 필요한 필드들에 대한 설정
    // 카테고리, 가격, 재고 등을 설정하는 로직 추가
}

// 수정 처리 함수
async function handleUpdate(e) {
    e.preventDefault();

    const name = nameInput.value;
    const description = descriptionInput.value;
    const stock = parseInt(stockInput.value);
    const price = parseInt(priceInput.value);
    const image = imageInput.files[0]; // 이미지가 수정되었는지 확인 필요
    let images; // 이미지 URL을 저장할 변수

    // 입력 검증 로직 추가
    if (!name || !description || !stock || !price) {
        return alert("모든 필드를 채워주세요.");
    }

    if (image) {
        // 이미지가 새로 선택된 경우, S3에 업로드하고 URL을 받아옴
        images = await addImageToS3(image, "your-category-name"); // 'your-category-name'은 실제 카테고리명으로 대체
    } else {
        // 이미지를 새로 선택하지 않은 경우, 기존 이미지 URL을 유지
        images = existingImageUrl; // 기존 이미지 URL을 어떻게 처리할지에 대한 로직 필요
    }

    // try {
    //     const data = {
    //         name,
    //         description,
    //         images,
    //         stock,
    //         price,
    //         // 기타 수정할 데이터
    //     };
    //
    //     await Api.put(`/products/${productId}`, data); // productId는 수정할 제품의 ID
    //
    //     alert("제품 정보가 수정되었습니다.");
    //     window.location.href = "/"; // 수정 후 리다이렉트 될 경로
    // } catch (err) {
    //     console.error(err);
    //     alert("제품 정보 수정 중 오류가 발생했습니다.");
    // }

    const updatedProduct = {
        userId,
        name,
        description,
        price,
        stock,
        categoryId, // Assuming you want to potentially update the category
        images: imageUrl, // Updated image URL or existing one
        // Add other fields as necessary
    };

    try {
        await Api.patch(`/products/${id}`, updatedProduct); // Assuming 'productId' is the ID of the product being edited
        alert("The product has been modified.");
        // Perform any necessary actions after a successful modification, such as reloading the page
        location.reload();
    } catch (error) {
        console.error(error);
        alert("Product modification failed.");
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
        const { id, name, themeClass } = category;

        categorySelectBox.insertAdjacentHTML(
            "beforeend",
            `
      <option value=${id} class="notification ${themeClass}"> ${name} </option>`
        );
    });
}

// 카테고리 선택 시, 선택박스에 해당 카테고리 테마가 반영되게 함.
function handleCategoryChange() {
    const index = categorySelectBox.selectedIndex;

    categorySelectBox.className = categorySelectBox[index].className;
}
console.log({nameInput, categorySelectBox, descriptionInput, imageInput, stockInput, priceInput});

// 초기화 함수에서 수정 모드를 위한 데이터 로딩 로직 추가
async function init() {
    checkLogin();
    addAllElements();
    addAllEvents();
    await loadProductData(productId); // 수정할 제품의 ID를 인자로 전달
}

init(); // 페이지 로드 시 초기화 함수 실행
*/

import { addImageToS3 } from "../../aws-s3.js";
import * as Api from "../../api.js";
import { checkLogin, createNavbar } from "../../useful-functions.js";

// Select DOM elements
const nameInput = document.querySelector("#nameInput");
const categorySelectBox = document.querySelector("#categorySelectBox");
const descriptionInput = document.querySelector("#descriptionInput");
const imageInput = document.querySelector("#imageInput");
const stockInput = document.querySelector("#stockInput");
const priceInput = document.querySelector("#priceInput");
const submitButton = document.querySelector("#submitButton");
const registerProductForm = document.querySelector("#registerProductForm");
const id = "theProductId"; // Replace this with the actual product ID retrieval logic, e.g., from the URL or storage

checkLogin();
addAllElements();
addAllEvents();
fetchAndDisplayProductDetails(id); // Make sure this is called with the correct product ID

function addAllElements() {
    createNavbar();
    addOptionsToSelectBox();
}

function addAllEvents() {
    imageInput.addEventListener("change", handleImageUpload);
    submitButton.addEventListener("click", handleSubmit);
    categorySelectBox.addEventListener("change", handleCategoryChange);
}

async function fetchAndDisplayProductDetails(id) {
    try {
        const productDetails = await Api.get(`/products/${id}`);
        console.log(productDetails);
        nameInput.value = productDetails.name;
        categorySelectBox.value = productDetails.categoryId;
        descriptionInput.value = productDetails.description;
        stockInput.value = productDetails.stock;
        priceInput.value = productDetails.price;
        // Add logic to display the existing product image if applicable
    } catch (error) {
        console.error("Fetching product details failed: ", error);
        alert("Failed to load product details.");
    }
}

async function handleSubmit(e) {
    console.log("handleSubmit called");
    e.preventDefault();

    const name = nameInput.value;
    const categoryId = categorySelectBox.value;
    const description = descriptionInput.value;
    let imageFile = imageInput.files[0];
    const stock = parseInt(stockInput.value);
    const price = parseInt(priceInput.value);
    const userId = sessionStorage.getItem("userId"); // Or however you're getting the userId
    let images = ""; // Assume no new image by default

    // if (!name || !categoryId || !description || isNaN(stock) || isNaN(price)) {
    //     return alert("All fields must be filled correctly.");
    // }
    //
    // if (imageFile && imageFile.size > 3e6) {
    //     return alert("Image must be smaller than 3MB.");
    // }

    // 입력 칸이 비어 있으면 진행 불가
    if (
        !userId ||
        !name ||
        !categoryId ||
        // !manufacturer ||
        !description ||
        !stock ||
        !price
    ) {
        return alert("빈 칸 및 0이 없어야 합니다.");
    }

    if (imageFile.size > 3e6) {
        return alert("사진은 최대 2.5MB 크기까지 가능합니다.");
    }

    // const categoryName = categorySelectBox.options[categorySelectBox.selectedIndex].text;

    // S3 에 이미지가 속할 폴더 이름은 카테고리명으로 함.
    const index = categorySelectBox.selectedIndex;
    const categoryName = categorySelectBox[index].text;

    console.log("index is ", index);
    console.log("category Name is ",categoryName);
    console.log("imageInput is ",imageInput);


    try {

        const imageFile = imageInput.files[0];

        if (imageFile) {
            images = await addImageToS3(imageFile, categoryName);
        }

        const updateData = {
            userId, name, categoryId, description, images, stock, price,
        };
        console.log(updateData);

        await Api.patch(`/products/${id}`, updateData);

        alert(`정상적으로 ${name} 제품이 수정되었습니다.`);
        window.location.href = `/products/category/${categoryId}`;

        // 폼 초기화
        registerProductForm.reset();
        fileNameSpan.innerText = "";
        // keywordsContainer.innerHTML = "";
        categorySelectBox.style.color = "black";
        categorySelectBox.style.backgroundColor = "white";

    } catch (err) {
        console.error(err);
        alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
    }
}

//GPT코드
// function handleImageUpload() {
//     const file = imageInput.files[0];
//     if (file) {
//         // Update the UI to reflect the newly selected file name
//         console.log(`Selected file: ${file.name}`);
//     }
// }

// 사용자가 사진을 업로드했을 때, 파일 이름이 화면에 나타나도록 함.
function handleImageUpload() {
    const file = imageInput.files[0];
    if (file) {
        fileNameSpan.innerText = file.name;
    } else {
        fileNameSpan.innerText = "";
    }
}

async function addOptionsToSelectBox() {
    try {
        const categories = await Api.get("/categories");
        console.log(categories);

        categories.forEach(({ id, name, themeClass }) => {
            const option = new Option(name, id);
            option.className = `notification ${themeClass}`;
            categorySelectBox.add(option);
        });
    } catch (error) {
        console.error("Error fetching categories: ", error);
    }
}

function handleCategoryChange() {
    const selectedIndex = categorySelectBox.selectedIndex;
    categorySelectBox.className = categorySelectBox.options[selectedIndex].className;
}

console.log({nameInput, categorySelectBox, descriptionInput, imageInput, stockInput, priceInput});
