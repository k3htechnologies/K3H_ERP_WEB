import MarketingContentFolder from "./MarketingContentFolder";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { test, expect, vi } from "vitest";

vi.mock("react-router-dom", () => ({
    useNavigate: () => vi.fn(),
}));


vi.mock("@/features/projectMaster/context/ProjectContext", () => ({
    useProject: () => ({
        projectId: 17,
    }),
}));


vi.mock("@/core/hooks/useToast", () => ({
    useToast: () => ({
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
                page: 1,
                sortInfo: null,
                searchTerm: "",
            },
            updateListState: vi.fn(),
            clearMarketingContentContext: vi.fn(),
        }),
    })
);


vi.mock(
    "@/features/marketingContent/services/MarketingContentFolderService",
    () => ({
        marketingContentFolderService: {
            apiCallPullMarketingContentFolder: vi.fn(() =>
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

test("render Marketing Content Folder component", () => {
    render(<MarketingContentFolder />);

    expect(screen.getByText("Add")).toBeInTheDocument();
});