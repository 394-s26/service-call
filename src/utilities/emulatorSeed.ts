import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const TEST_PROVIDER = {
  name: "Jane's Electric",
  businessName: "Jane's Electric",
  category: "quick_fixes",
  categories: ["quick_fixes"],
  rating: 4.9,
  reviewCount: 25,
  inspectionFee: 50,
  available: true,
  location: "Brooklyn, NY",
  distanceMiles: 2.1,
  imageUrl: "https://example.com/img.jpg",
  specialties: ["Wiring"],
  latitude: 40.6782,
  longitude: -73.9442,
};

export async function seedEmulatorProviders(): Promise<void> {
  const ref = doc(db, "providers", "prov-1");
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, TEST_PROVIDER);
}
