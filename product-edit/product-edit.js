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

checkLogin();
addAllElements();
addAllEvents();
fetchAndDisplayProductDetails(); // Make sure this is called with the correct product ID

function addAllElements() {
    createNavbar();
    addOptionsToSelectBox();
}

// addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {
    imageInput.addEventListener("change", handleImageUpload);
    submitButton.addEventListener("click", handleSubmit);
    categorySelectBox.addEventListener("change", handleCategoryChange);
}

async function fetchAndDisplayProductDetails() {
    const path = window.location.pathname;
    console.log(path);
    const id = path.split('/').pop();
    //id값 인트형으로 형변환
    const newId = parseInt(id);

    try {
        const productDetails = await Api.get(`/products/${newId}`);
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

//수정
async function handleSubmit(e) {
    console.log("handleSubmit called");
    e.preventDefault();

    const path = window.location.pathname;
    console.log(path);
    const id = path.split('/').pop();
    //id값 인트형으로 형변환
    const newId = parseInt(id);

    const name = nameInput.value;
    const categoryId = categorySelectBox.value;
    const description = descriptionInput.value;
    let imageFile = imageInput.files[0];
    const stock = parseInt(stockInput.value);
    const price = parseInt(priceInput.value);
    const userId = sessionStorage.getItem("userId"); // Or however you're getting the userId
    let images = ""; // Assume no new image by default

    // 입력 칸이 비어 있으면 진행 불가
    if (
        !userId ||
        !name ||
        !categoryId ||
        !description ||
        !stock ||
        !price
    ) {
        return alert("빈 칸 및 0이 없어야 합니다.");
    }

    if (imageFile.size > 3e6) {
        return alert("사진은 최대 2.5MB 크기까지 가능합니다.");
    }

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
            userId,
            name,
            categoryId,
            description,
            images,
            stock,
            price,
        };
        console.log(updateData);

        await Api.patch(`/products`,newId ,updateData);

        console.log(categoryId);
        console.log(newId);


        alert(`정상적으로 ${name} 제품이 수정되었습니다.`);
        window.location.href = `/products/category/${categoryId}`;

        // 폼 초기화
        registerProductForm.reset();
        fileNameSpan.innerText = "";
        categorySelectBox.style.color = "black";
        categorySelectBox.style.backgroundColor = "white";

    } catch (err) {
        console.error(err);
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

