'use client';

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function AuthFormsWrapper() {
    return (
        <SignIn
            routing="hash"
            forceRedirectUrl="/dashboard"
            appearance={{
                baseTheme: dark,
                elements: {
                    card: "bg-[#181a24] border border-[#2a2d3d]",
                    headerTitle: "text-white",
                    headerSubtitle: "text-[#8b8fa3]",
                    socialButtonsBlockButton: "bg-[#13141c] border-[#2a2d3d] text-white hover:bg-[#1f212e]",
                    formButtonPrimary: "bg-[#6c5ce7] hover:bg-[#5b4cc4]",
                    footerActionLink: "text-[#6c5ce7] hover:text-[#5b4cc4]",
                    formFieldLabel: "text-[#e8e9ed]",
                    formFieldInput: "bg-[#13141c] border-[#2a2d3d] text-white"
                }
            }}
        />
    );
}
