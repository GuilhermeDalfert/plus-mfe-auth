import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "../../src/pages/LoginPage";
import * as authApi from "../../src/api/auth";

vi.mock("../../src/api/auth", async () => {
  const actual = await vi.importActual<typeof import("../../src/api/auth")>("../../src/api/auth");
  return {
    ...actual,
    login: vi.fn(),
  };
});

const mockedLogin = vi.mocked(authApi.login);

describe("LoginPage", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    localStorage.clear();
  });

  it("renders email, password fields and submit button", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("does not call the api when email is invalid", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "naoeumemail");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("calls login with the typed credentials, persists tokens and invokes onLogin", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    mockedLogin.mockResolvedValueOnce({
      accessToken: "access-xyz",
      refreshToken: "refresh-xyz",
      expiresIn: 3600,
      user: { id: "1", username: "u", email: "a@b.com", role: "ADMIN" },
    });

    render(<LoginPage onLogin={onLogin} />);
    await user.type(screen.getByLabelText("E-mail"), "a@b.com");
    await user.type(screen.getByLabelText("Senha"), "secret");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({ email: "a@b.com", password: "secret" });
    });
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith("access-xyz");
    });
    expect(localStorage.getItem("token")).toBe("access-xyz");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-xyz");
  });

  it("shows an error alert when the api rejects", async () => {
    const user = userEvent.setup();
    mockedLogin.mockRejectedValueOnce(new Error("Credenciais invalidas"));

    render(<LoginPage />);
    await user.type(screen.getByLabelText("E-mail"), "a@b.com");
    await user.type(screen.getByLabelText("Senha"), "wrong");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Credenciais invalidas");
  });
});
