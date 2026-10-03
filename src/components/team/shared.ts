// Fired after the signed-in member saves their own profile, so the header
// reloads their name.
export const PROFILE_UPDATED_EVENT = "profile-updated";

export type TeamMember = {
    id: string;
    name: string;
    role: string;
    email: string | null;
    accessRole: "SCRUM_MASTER" | "MEMBER";
    isActive: boolean;
    skills: {
        id: string;
        skill: string;
    }[];
};

// A public holiday or leave entry, as GET /api/time-off returns it.
export type TimeOffEntry = {
    id: string;
    type: "LEAVE" | "PUBLIC_HOLIDAY";
    startDate: string;
    endDate: string;
    note: string | null;
    member: {
        id: string;
        name: string;
        isActive: boolean;
    };
};
