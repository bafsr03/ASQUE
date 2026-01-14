"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * UserInit Component
 * Automatically syncs the authenticated Clerk user with the Prisma database.
 */
export function UserInit() {
    const { user, isLoaded, isSignedIn } = useUser();
    const initialized = useRef(false);

    useEffect(() => {
        if (isLoaded && isSignedIn && user && !initialized.current) {
            initialized.current = true;
            
            // Check if we already initialized in this session to avoid redundant calls
            const sessionSync = sessionStorage.getItem(`user_synced_${user.id}`);
            if (sessionSync) return;

            console.log("Syncing user with database...");
            
            fetch("/api/user/init", {
                method: "POST",
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    sessionStorage.setItem(`user_synced_${user.id}`, "true");
                    console.log("User sync successful");
                }
            })
            .catch(err => {
                console.error("User sync failed:", err);
                initialized.current = false; // Allow retry
            });
        }
    }, [isLoaded, isSignedIn, user]);

    return null;
}
