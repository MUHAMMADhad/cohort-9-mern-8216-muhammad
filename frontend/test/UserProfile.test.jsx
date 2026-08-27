import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserProfile from "../src/components/UserProfile.jsx";

const user = { id: 4, name: "Jane Doe", email: "jane@example.com" };

describe("UserProfile", () => {
  test("renders profile details and initials", () => {
    render(
      <UserProfile user={user} onClose={jest.fn()} onLogout={jest.fn()} />,
    );

    expect(
      screen.getByRole("dialog", { name: "Your Profile" }),
    ).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getAllByText("jane@example.com")).toHaveLength(2);
    expect(screen.getByText("#4")).toBeInTheDocument();
  });

  test("closes from the button, backdrop, and Escape key", async () => {
    const userEventInstance = userEvent.setup();
    const onClose = jest.fn();
    const { container } = render(
      <UserProfile user={user} onClose={onClose} onLogout={jest.fn()} />,
    );

    await userEventInstance.click(
      screen.getByRole("button", { name: "Close profile" }),
    );
    await userEventInstance.click(container.firstChild);
    await userEventInstance.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test("forwards logout and renders fallback user details", async () => {
    const userEventInstance = userEvent.setup();
    const onLogout = jest.fn();
    render(<UserProfile onClose={jest.fn()} onLogout={onLogout} />);

    expect(screen.getByText("Notes user")).toBeInTheDocument();
    expect(screen.getAllByText("Not provided")).toHaveLength(2);
    await userEventInstance.click(
      screen.getByRole("button", { name: "Log out" }),
    );
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
