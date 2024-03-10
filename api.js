
    // VM 벡엔드 도메인으로
 //const baseUrl = 'http://34.64.187.23:8080';
 //const baseUrl =  'http://kdt-cloud-1-team03.elicecoding.com:8080'
   // 기본 호스트 주소를 localhost:8080으로 변경
 const baseUrl = 'http://127.0.0.1:8080';


async function get(endpoint, params = "") {

  try{
   const apiUrl = params ? `${baseUrl}${endpoint}/${params}` : `${baseUrl}${endpoint}`;
   console.log(`%cGET 요청: ${apiUrl} `, "color: #a25cd1;");
   console.log(`%cGET 요청: ${endpoint} `, "color: #a25cd3;");
   console.log(`%cGET 요청: ${params} `, "color: #a25cd5;");

  // 토큰이 있으면 Authorization 헤더를 포함, 없으면 포함하지 않음
  const token = sessionStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};


  const res = await fetch(apiUrl, { headers });

  // 응답 코드가 4XX 계열일 때 (400, 403 등)
  if (!res.ok) {
    const errorContent = await res.json();
    const { reason } = errorContent;

    throw new Error(reason);
  }

  const result = await res.json();
  return result;
}
catch{}
}

async function post(endpoint, data) {

     const apiUrl = `${baseUrl}${endpoint}`;
      console.trace('Current Call Stack: get ');
    console.log(`%cpost 요청: ${apiUrl} `, "color: #a25cd1;");

    const bodyData = JSON.stringify(data);
  console.log(`%cPOST 요청 데이터: ${bodyData}`, "color: #296aba;");

  // 토큰이 있으면 Authorization 헤더를 포함, 없으면 포함하지 않음
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    };

    console.log(token);
    console.log(headers);

  const res = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: bodyData,
  });

  // 응답 코드가 4XX 계열일 때 (400, 403 등)
  if (!res.ok) {
    const errorContent = await res.json();
    const { reason } = errorContent;

    throw new Error(reason);
  }

  const result = await res.json();

  return result;
}


// api 로 PATCH 요청 (/endpoint/params 로, JSON 데이터 형태로 요청함)
async function patch(endpoint, params = "", data) {

   const apiUrl = params ? `${baseUrl}${endpoint}/${params}` : `${baseUrl}${endpoint}`;
    console.trace('Current Call Stack: get ');
   console.log(`%cGET 요청: ${apiUrl} `, "color: #a25cd1;");



  const bodyData = JSON.stringify(data);
  console.log(`%cPATCH 요청: ${apiUrl}`, "color: #059c4b;");
  console.log(`%cPATCH 요청 데이터: ${bodyData}`, "color: #059c4b;");

  const res = await fetch(apiUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: bodyData,
  });

  // 응답 코드가 4XX 계열일 때 (400, 403 등)
  if (!res.ok) {
    const errorContent = await res.json();
    const { reason } = errorContent;

    throw new Error(reason);
  }

  const result = await res.json();

  return result;
}

// 아래 함수명에 관해, delete 단어는 자바스크립트의 reserved 단어이기에,
// 여기서는 우선 delete 대신 del로 쓰고 아래 export 시에 delete로 alias 함.
async function del(endpoint, params = "") {
  const apiUrl = params ? `${baseUrl}${endpoint}/${params}` : `${baseUrl}${endpoint}`;
  console.trace('현재 호출 스택: del ');
  console.log(`%cDEL 요청: ${apiUrl} `, "color: #a25cd1;");

  console.log(`DELETE 요청 ${apiUrl}`, "color: #059c4b;");

  // 토큰이 있으면 Authorization 헤더를 포함, 없으면 포함하지 않음
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  console.log(token);
  console.log(headers);

  const res = await fetch(apiUrl, {
    method: "DELETE",
    headers,
  });

  // 응답 코드가 4XX 계열일 때 (400, 403 등)
  if (!res.ok) {
    const errorContent = await res.json();
    const { reason } = errorContent;
    throw new Error(reason);
  }

}

// 아래처럼 export하면, import * as Api 로 할 시 Api.get, Api.post 등으로 쓸 수 있음.
export { get, post, patch, del as delete };

console.log("hello world");