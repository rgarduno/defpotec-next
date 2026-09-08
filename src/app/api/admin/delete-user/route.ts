import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId && !email) {
      return NextResponse.json({ error: "Se requiere userId o email." }, { status: 400 });
    }

    // Dynamic import of firebase-admin submodules to avoid Next.js ESM/CommonJS bundler issues
    const { getApps, initializeApp, cert } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");
    const { getFirestore } = await import("firebase-admin/firestore");

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "defpotec-3bd15";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    let adminApp;
    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminApp = initializeApp({
        projectId,
      });
    }

    const adminAuth = getAuth(adminApp);
    const adminDb = getFirestore(adminApp);

    let targetUid = userId;

    if (!targetUid && email) {
      try {
        const userRecord = await adminAuth.getUserByEmail(email.toLowerCase());
        targetUid = userRecord.uid;
      } catch (e) {
        console.warn("User not found in Auth by email:", email);
      }
    }

    let deletedFromAuth = false;
    if (targetUid) {
      try {
        await adminAuth.deleteUser(targetUid);
        deletedFromAuth = true;
      } catch (err: any) {
        console.warn("Could not delete user from Auth console:", err.message);
      }
    }

    if (targetUid) {
      try {
        await adminDb.collection("users").doc(targetUid).delete();
      } catch (e) {
        console.warn("Could not delete user doc from Firestore:", e);
      }
    }

    return NextResponse.json({
      success: true,
      deletedFromAuth,
      message: deletedFromAuth
        ? "Usuario eliminado al 100% de Firebase Auth y Base de Datos."
        : "Usuario eliminado de la Base de Datos.",
    });
  } catch (error: any) {
    console.error("Error in delete-user API route:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar el usuario." }, { status: 500 });
  }
}
