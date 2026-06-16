import { render, screen } from "@testing-library/react";
import { ClientModal } from "../src/components/shared/ClientModal";
import { StrappProvider } from "../src/lib/strapp/store";

describe("ClientModal", () => {
  it("renders modal with required fields", () => {
    render(
      <StrappProvider>
        <ClientModal open={true} onSave={jest.fn()} onCancel={jest.fn()} />
      </StrappProvider>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
