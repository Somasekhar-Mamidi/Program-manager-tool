import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MeetingPrepCard } from "./page";
import { IntentBlock } from "@/types";

describe("MeetingPrepCard Component", () => {
    test("should cleanly render and prevent modification tools when isReadOnly is active", () => {
        const mockMeeting: IntentBlock = {
            id: "historical-meeting-1",
            date: "2024-11-01",
            objective: "Q4 Roadmap Review",
            outputDefinition: "Approved roadmap",
            estimatedEffort: "medium",
            type: "work",
            status: "completed",
            microSteps: [],
            createdAt: 12345
        };

        // Act: Render the React component strictly inside our automated testing environment
        render(<MeetingPrepCard meeting={mockMeeting} isReadOnly={true} />);

        // Assert: 
        // 1. Text properly renders
        expect(screen.getByText("Q4 Roadmap Review")).toBeTruthy();

        // 2. The standard input box for adding new questions shouldn't even exist in read-only mode
        // Based on the typical DeepWork UI constraints for read-only meetings
        const addQuestionInput = screen.queryByPlaceholderText(/Add a question/i);
        expect(addQuestionInput).toBeNull();
    });
});
