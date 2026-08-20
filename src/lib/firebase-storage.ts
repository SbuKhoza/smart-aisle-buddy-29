import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { getAuth } from "firebase/auth";
import { getStorageBucket } from "./firebase";

/**
 * Upload an admin image.
 *
 * Storage rules:
 * - Only authenticated admins can upload
 * - Allowed folders: stores, promotions
 * - Images only
 * - Maximum 5 MB
 */
export async function uploadAdminImage(
  file: File,
  folder: "stores" | "promotions",
  id?: string
) {
  const extension = file.name.split(".").pop() || "jpg";

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

/**
 * Upload a receipt image.
 *
 * Storage path:
 * receipts/{uid}/{fileName}
 *
 * The Storage rules require:
 * request.auth.uid == uid
 *
 * Therefore we use the Firebase Authentication UID
 * rather than trusting an arbitrary UID passed from the UI.
 */
export async function uploadReceiptImage(
  file: File,
  uid: string,
  tripId: string
) {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // The user must be authenticated.
  if (!currentUser) {
    throw new Error(
      "You must be signed in to upload a receipt."
    );
  }

  // The UID supplied by the component must belong to
  // the currently authenticated Firebase user.
  if (currentUser.uid !== uid) {
    throw new Error(
      "The authenticated user does not match the receipt owner."
    );
  }

  const extension = file.name.split(".").pop() || "jpg";

  const filename = `${tripId}-${Date.now()}.${extension}`;

  const storageRef = ref(
    getStorageBucket(),
    `receipts/${currentUser.uid}/${filename}`
  );

  await uploadBytes(storageRef, file);

  return getDownloadURL(storageRef);
}