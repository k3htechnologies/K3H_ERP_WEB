import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SiteFaq from "./SiteFaq";

test("renders the Frequently Asked Questions heading", () => {
    render(<SiteFaq />);
    const headingElement = screen.getByRole("heading", { name: /frequently asked questions/i });
    expect(headingElement).toBeInTheDocument();
});