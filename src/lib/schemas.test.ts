import { expect, test, describe } from "bun:test";
import { CalendarStateSchema } from "./schemas";

describe("Data Integrity (Zod Schemas)", () => {
    test("CalendarStateSchema should gracefully inject default arrays if missing from corrupted JSON", () => {
        // Arrange
        const corruptedJSON = {
            // Missing intents, charters, goals. Only providing garbage keys.
            randomUnusedKey: "malicious string"
        };
        
        // Act
        // Because Zod `default([])` is set, parsing an empty subset generates completely safe defaults.
        const result = CalendarStateSchema.safeParse(corruptedJSON);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.intents).toEqual([]);
            expect(result.data.goals).toEqual([]);
            expect(result.data.charters).toEqual([]);
            expect(result.data.daySummaries).toEqual({});
        }
    });

    test("CalendarStateSchema should correctly parse valid intent objects and strip out invalid properties", () => {
        const payload = {
            intents: [
                {
                    id: "intent-123",
                    date: "2024-11-01",
                    objective: "Write code",
                    outputDefinition: "PR submitted",
                    createdAt: 123456789,
                    hackedField: "bypassing type safety" // Should be ignored by zod
                }
            ]
        };

        const result = CalendarStateSchema.safeParse(payload);
        
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.intents.length).toBe(1);
            expect(result.data.intents[0].createdAt).toBe(123456789);
            // Zod strips unrecognized keys by default
            // @ts-ignore
            expect(result.data.intents[0].hackedField).toBeUndefined(); 
        }
    });
    
    test("CalendarStateSchema should reject invalid types preventing application crashes", () => {
        const badPayload = {
            goals: [
                {
                    // Missing ID entirely
                    title: "Broken Goal",
                    targetDays: "THIRTY", // Should be a number!
                    completedDates: [],
                    createdAt: 12345
                }
            ]
        };

        const result = CalendarStateSchema.safeParse(badPayload);
        
        // Assert: The Schema correctly caught the string where a number should be,
        // preventing the broken data from entering the React state!
        expect(result.success).toBe(false); 
    });
});
