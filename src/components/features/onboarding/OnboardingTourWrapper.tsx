"use client"

import dynamic from "next/dynamic"

// Import the onboarding tour dynamically with SSR disabled
// This prevents Next.js hydration mismatches because react-joyride requires the browser
export const OnboardingTourWrapper = dynamic(
    () => import("@/components/features/onboarding/OnboardingTour").then(mod => mod.OnboardingTour),
    { ssr: false }
)
