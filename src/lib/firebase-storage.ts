import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { getStorageBucket } from "./firebase";

export async function uploadAdminImage(
  file: File,
  folder: "stores" | "promotions",
  id?: string
) {
  const extension = file.name.split(".").pop();

  const filename = id
    ? `${id}.${extension}`
    : `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const storageRef = ref(
    getStorageBucket(),
    `${folder}/${filename}`
  );

  await uploadBytes(storageRef, file);

  return getDownloadURL(storageRef);
}