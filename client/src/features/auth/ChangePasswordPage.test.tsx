import { fireEvent, screen, waitFor } from "../../test-utils";
import { renderWithProviders } from "../../test-utils";

import { ChangePasswordPage } from "./ChangePasswordPage";

describe("ChangePasswordPage", () => {
  it("submits change password request", async () => {
    const changePassword = vi.fn().mockResolvedValue(undefined);
    window.alert = vi.fn();

    renderWithProviders(<ChangePasswordPage />, {
      authOverride: {
        isAuthenticated: true,
        changePassword,
      },
    });

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "old" } });
    fireEvent.change(screen.getAllByLabelText(/new password/i)[0], { target: { value: "newpassword" } });
    fireEvent.change(screen.getAllByLabelText(/new password/i)[1], {
      target: { value: "newpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() =>
      expect(changePassword).toHaveBeenCalledWith({
        old_password: "old",
        new_password: "newpassword",
        new_password_confirm: "newpassword",
      }),
    );
  });
});
