import { storage } from "./src/index";

async function test() {
  try {
    console.log("Ensuring bucket exists...");
    await storage.ensureBucket();

    console.log("\nGenerating presigned PUT URL...");
    const url = await storage.client.presignedPutObject(
      storage.bucketName,
      "imfine.png",
      60
    );
    console.log("Presigned URL:", url);

    const file = Bun.file("imfine.png");
    const response = await fetch(url, {
      method: "PUT",
      body: file,
    });
    console.log("Response:", response);

    console.log(url);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
