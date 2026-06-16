import { render, fireEvent, screen } from "@testing-library/react";
import { MapView } from "../src/components/map/MapView";
import { StrappProvider } from "../src/lib/strapp/store";

describe("MapView", () => {
  it("renders without crashing", () => {
    render(
      <StrappProvider>
        <MapView />
      </StrappProvider>,
    );
    expect(screen.getByText(/Tap map to add/i)).toBeInTheDocument();
  });
});
