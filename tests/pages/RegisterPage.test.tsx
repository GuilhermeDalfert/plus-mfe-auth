import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import RegisterPage from "../../src/pages/RegisterPage";
import * as authApi from "../../src/api/auth";
import { USER_ROLES } from "../../src/api/auth";

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

vi.mock("../../src/api/auth", async () => {
  const actual = await vi.importActual<typeof import("../../src/api/auth")>("../../src/api/auth");
  return {
    ...actual,
    register: vi.fn(),
  };
});

const mockedRegister = vi.mocked(authApi.register);

describe("RegisterPage", () => {
  beforeEach(() => {
    mockedRegister.mockReset();
  });

  it("renders all fields and the submit button", () => {
    renderWithRouter(<RegisterPage />);

    expect(screen.getByLabelText("Usuário")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
  });

  it("does not call the api when email is invalid", async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText("Usuário"), "victor");
    await user.type(screen.getByLabelText("E-mail"), "naoeumemail");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("submits with the typed payload and calls onRegister on success", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();
    mockedRegister.mockResolvedValueOnce(undefined);

    renderWithRouter(<RegisterPage onRegister={onRegister} />);
    await user.type(screen.getByLabelText("Usuário"), "victor");
    await user.type(screen.getByLabelText("E-mail"), "v@plus.com");
    await user.type(screen.getByLabelText("Senha"), "secret");
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        username: "victor",
        email: "v@plus.com",
        password: "secret",
        role: USER_ROLES[0],
      });
    });
    await waitFor(() => expect(onRegister).toHaveBeenCalledTimes(1));
  });

  it("shows an error alert when the api rejects", async () => {
    const user = userEvent.setup();
    mockedRegister.mockRejectedValueOnce(new Error("Email ja cadastrado"));

    renderWithRouter(<RegisterPage />);
    await user.type(screen.getByLabelText("Usuário"), "victor");
    await user.type(screen.getByLabelText("E-mail"), "v@plus.com");
    await user.type(screen.getByLabelText("Senha"), "secret");
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Email ja cadastrado");
  });
});
