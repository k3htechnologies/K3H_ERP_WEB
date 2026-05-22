import MarketingContent from "./MarketingContent";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { test, expect, vi } from "vitest";

vi.mock("react-router-dom", () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({
        MarketingContentFolderId: "1",
    }),
}));

vi.mock("@/features/projectMaster/context/ProjectContext", () => ({
    useProject: () => ({
        projectId: 17,
    }),
}));

vi.mock("@/core/hooks/useToast", () => ({
    default: () => ({
        addToast: vi.fn(),
    }),
}));

vi.mock("@/features/menu/hooks/useMenuPermissions", () => ({
    useMenuPermissions: () => ({
        canAction: true,
    }),
}));

vi.mock(
    "@/features/marketingContent/context/MarketingContentListStateContext",
    () => ({
        useMarketingContentListState: () => ({
            listState: {
                MarketingContentFolderId: 1,
            },
        }),
    })
);

vi.mock(
    "@/features/marketingContent/services/MarketingContentService",
    () => ({
        marketingContentService: {
            apiCallPullMarketingContent: vi.fn(() =>
                Promise.resolve({
                    _tag: "Right",
                    right: {
                        Data: [],
                        TotalNumberOfRecord: 0,
                    },
                })
            ),
        },
    })
);

test("title input should accept value", () => {

    render(<MarketingContent />);

    fireEvent.click(screen.getByText("Add"));

    const input = screen.getByPlaceholderText("Enter Title");

    fireEvent.change(input, {
        target: {
            value: "Marketing Document",
        },
    });

    expect(input).toHaveValue("Marketing Document");
});


test("remark textarea should accept value", () => {

    render(<MarketingContent />);

    fireEvent.click(screen.getByText("Add"));

    const textarea = screen.getByPlaceholderText(
        "Enter Remark"
    );

    fireEvent.change(textarea, {
        target: {
            value: "This is test remark",
        },
    });

    expect(textarea).toHaveValue(
        "This is test remark"
    );
});
