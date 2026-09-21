import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from './firebase';

export { mergeProfiles, resolveProfileForUser } from './profileMerge';

const COLLECTION = 'profiles';

export async function fetchRemoteProfile(uid) {
  const db = getDb();
  if (!db || !uid) return null;
  const snapshot = await getDoc(doc(db, COLLECTION, uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveRemoteProfile(uid, profile) {
  const db = getDb();
  if (!db || !uid) return false;
  await setDoc(doc(db, COLLECTION, uid), { ...profile, ownerUid: uid }, { merge: true });
  return true;
}
