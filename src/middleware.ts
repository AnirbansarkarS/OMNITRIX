import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/viewer(.*)",
    "/upload(.*)",
    "/export(.*)",
    "/generate(.*)",
]);

export default clerkMiddleware((auth, req) => {
    // Only protect page routes, not API routes
    if (isProtectedRoute(req) && !req.nextUrl.pathname.startsWith("/api")) {
        auth().protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
