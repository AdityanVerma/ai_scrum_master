import { NextResponse } from "next/server";
import { activateSprint } from "@/lib/db/activate-sprint";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(
    _request: Request,
    context: RouteContext,
) {
    try {
        const { id } = await context.params;

        const sprint = await activateSprint(id);

        return NextResponse.json({
            success: true,
            data: sprint,
        });
    } catch (error) {
        console.error("Failed to activate sprint:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to activate sprint.",
            },
            { status: 400 },
        );
    }
}