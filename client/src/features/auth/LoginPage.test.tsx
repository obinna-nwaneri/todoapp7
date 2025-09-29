import { fireEvent, screen, waitFor } from "../../test-utils";
import { renderWithProviders } from "../../test-utils";

import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("submits credentials", async () => {
    const login = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(<LoginPage />, {
      authOverride: {
        login,
        loading: false,
      },
    });

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "user" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pass" } });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ username: "user", password: "pass" }),
    );
  });
});
