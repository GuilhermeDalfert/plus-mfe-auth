import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AuthCard from "../../src/components/AuthCard";

describe("AuthCard", () => {
  it("renders the title as an h1", () => {
    render(
      <AuthCard title="ENTRAR">
        <p>conteudo</p>
      </AuthCard>
    );
    const heading = screen.getByRole("heading", { level: 1, name: "ENTRAR" });
    expect(heading).toBeInTheDocument();
  });

  it("renders children inside the card", () => {
    render(
      <AuthCard title="CADASTRAR">
        <button>meu-botao</button>
      </AuthCard>
    );
    expect(screen.getByRole("button", { name: "meu-botao" })).toBeInTheDocument();
  });
});
