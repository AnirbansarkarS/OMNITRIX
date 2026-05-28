import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <main className="min-h-screen bg-omni-bg flex items-center justify-center relative overflow-hidden">
            <div className="gradient-orb w-[500px] h-[500px] bg-purple-500/8 top-0 left-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-omni-accent flex items-center justify-center shadow-omni-accent">
                        <span className="text-omni-bg font-bold text-sm">OX</span>
                    </div>
                    <span className="text-2xl font-bold text-omni-text tracking-wide">OMNITRIX</span>
                </div>

                {/* Note: To make phone number optional in Clerk:
                    1. Go to Clerk Dashboard
                    2. Navigate to "User & Authentication" > "Sign-up & sign-in"
                    3. Toggle "Phone number" to optional or disable it
                    4. Or configure unsafeMetadata fields in dashboard
                */}
                <SignUp
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
                />
            </div>
        </main>
    );
}
