import { SignIn } from "@clerk/nextjs";
import OmnitrixLogo from "@/components/ui/OmnitrixLogo";

export default function SignInPage() {
    return (
        <main className="min-h-screen bg-omni-bg flex items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className="gradient-orb w-[500px] h-[500px] bg-omni-accent/8 top-0 left-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <OmnitrixLogo size={40} />
                    <span className="text-2xl font-bold text-omni-text tracking-wide">OMNITRIX</span>
                </div>

                {/* Clerk UI */}
                {/* Note: To make phone number optional in Clerk:
                    1. Go to Clerk Dashboard
                    2. Navigate to "User & Authentication" > "Sign-up & sign-in"
                    3. Toggle "Phone number" to optional or disable it
                */}
                <SignIn
                    appearance={{
                        variables: {
                            colorPrimary: "#00FF66",
                            colorBackground: "#0D1526",
                            colorText: "#E8F4FD",
                            colorTextSecondary: "#7A9BB5",
                            colorInputBackground: "#050A14",
                            colorInputText: "#E8F4FD",
                            borderRadius: "0.75rem",
                        },
                    }}
                    fallbackRedirectUrl="/dashboard"
                />
            </div>
        </main>
    );
}
