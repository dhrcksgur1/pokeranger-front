import { randomId } from "./useful-functions.js";

// AWS S3 설정
const s3BucketName = "pokeranger-image-storage";
const bucketRegion = "ap-northeast-2"; // 한국은 항상 ap-northeast-2임.
const IdentityPoolId = "ap-northeast-2:d415ca97-fadd-41fe-b0ec-c10b5b4bf7e9";

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
  }),
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: s3BucketName },
});



// 이미지를 S3에 업로드하는 함수
async function addImageToS3(file, album) {
    console.log("aws로 넘왔습니다");

    try {
    if (!file)
    {
        console.log("file is null");
    }

  var fileName = file.name;
  var albumPhotosKey = encodeURIComponent(album) + "/";

  var photoKey = albumPhotosKey + fileName;

    console.log(photoKey);

  // Use S3 ManagedUpload class as it supports multipart uploads
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: s3BucketName,
      Key: photoKey,
      Body: file,
    },
    });

    console.log(upload);

      try {
            var promise = upload.promise();
            console.log(promise);

            promise.then(
                  function (data) {
                      console.log(data);
                       alert("There was an error uploading your photo: ", err.message);
                  },
                  function (err) {
                    return alert("There was an error uploading your photo: ", err.message);
                  }
                );
      }catch(err)
      {
         throw new Error(`111 __S3에 이미지를 업로드하는 중에 오류가 발생했습니다.\n${err.message}`);
      }


 } catch (err) {
    throw new Error(`S3에 이미지를 업로드하는 중에 오류가 발생했습니다.\n${err.message}`);
  }

//    // 고유한 이미지 파일 주소 생성
//    const fileName = randomId() + "_" + file.name;
//    console.log(fileName);
//    const albumPhotosKey = encodeURIComponent(album) + "/";
//    console.log(albumPhotosKey);
//    const photoKey = albumPhotosKey + fileName;
//    console.log(photoKey);
//
//
//    // S3에 업로드
//    const upload = s3.upload({
//      Bucket: s3BucketName,
//      Key: photoKey,
//      Body: file,
//    });
//
//    console.log(upload);
//
//    const uploadedFile = await upload.promise();
//    console.log(uploadedFile);
//    const fileKey = uploadedFile.Key;
//    console.log(fileKey);
//
//    console.log(`AWS S3에 정상적으로 이미지가 업로드되었습니다.\n파일 위치: ${fileKey}`);
//
//    return fileKey;
//  } catch (err) {
//    throw new Error(`S3에 이미지를 업로드하는 중에 오류가 발생했습니다.\n${err.message}`);
//  }
}

// 업로드한 사진의 URL 생성
function getImageUrl(imageKey) {
  const imageUrl = new Promise((resolve) => {
    const params = {
      Bucket: s3BucketName,
      Key: imageKey,
      Expires: 60,
    };

    s3.getSignedUrl("getObject", params, (_, url) => {
      resolve(url);
    });
  });

  return imageUrl;
}

export { addImageToS3, getImageUrl };
