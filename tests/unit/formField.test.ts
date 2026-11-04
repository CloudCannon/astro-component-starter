import { describe, expect, it } from "vitest";
import {
  formFieldParts,
  generateFieldId,
  inferAutocomplete,
  toDateInputValue,
} from "../../src/components/utils/formField";

describe("generateFieldId", () => {
  it("returns the provided id untouched when one is supplied", () => {
    expect(generateFieldId("input", "my-custom-id")).toBe("my-custom-id");
  });

  it("derives a stable id from the source when no id is provided", () => {
    expect(generateFieldId("input", null, "Email address")).toBe("input-email-address");
    expect(generateFieldId("select", undefined, "country")).toBe("select-country");
  });

  it("returns the same id for the same source every call", () => {
    expect(generateFieldId("field", null, "Full name")).toBe(
      generateFieldId("field", null, "Full name")
    );
  });

  it("treats an empty-string id as absent", () => {
    expect(generateFieldId("input", "", "Phone")).toBe("input-phone");
  });

  it("falls back to the bare prefix when there is nothing to derive from", () => {
    expect(generateFieldId("input")).toBe("input");
    expect(generateFieldId("input", null, "")).toBe("input");
    expect(generateFieldId("input", null, 42)).toBe("input");
    expect(generateFieldId("input", null, "!!!")).toBe("input");
  });
});

describe("formFieldParts", () => {
  it("prefers the name over the label as the id source", () => {
    const { fieldId } = formFieldParts({ prefix: "input", name: "email", label: "Your email" });

    expect(fieldId).toBe("input-email");
  });

  it("describes the control by its hint and error, in that order", () => {
    const { controlAttributes } = formFieldParts({
      prefix: "input",
      name: "email",
      hint: "We never share it",
      error: "Required",
    });

    expect(controlAttributes["aria-describedby"]).toBe("input-email-hint input-email-error");
    expect(controlAttributes["aria-invalid"]).toBe("true");
  });

  it("leaves the control undescribed and valid when there is no hint or error", () => {
    const { controlAttributes } = formFieldParts({ prefix: "input", name: "email" });

    expect(controlAttributes["aria-describedby"]).toBeUndefined();
    expect(controlAttributes["aria-invalid"]).toBeUndefined();
  });

  it("prefers an explicit autocomplete over the inferred one", () => {
    const { controlAttributes } = formFieldParts({
      prefix: "input",
      name: "email",
      autocomplete: "off",
    });

    expect(controlAttributes.autocomplete).toBe("off");
  });

  it("names an unlabelled field by its placeholder, then its name", () => {
    expect(
      formFieldParts({ prefix: "input", name: "email", placeholder: "Your email" })
        .controlAttributes["aria-label"]
    ).toBe("Your email");
    expect(formFieldParts({ prefix: "input", name: "email" }).controlAttributes["aria-label"]).toBe(
      "email"
    );
  });

  it("leaves a labelled field without an aria-label", () => {
    const { controlAttributes } = formFieldParts({
      prefix: "input",
      name: "email",
      label: "Email",
      placeholder: "you@example.com",
    });

    expect(controlAttributes["aria-label"]).toBeUndefined();
  });

  it("passes the hint and error ids to the shell only when the text exists", () => {
    const { shellAttributes } = formFieldParts({ prefix: "input", name: "email", hint: "  " });

    expect(shellAttributes.hintId).toBeUndefined();
    expect(shellAttributes.errorId).toBeUndefined();
  });
});

describe("inferAutocomplete", () => {
  it("reads the input type first", () => {
    expect(inferAutocomplete("email", "subscriber")).toBe("email");
    expect(inferAutocomplete("tel", "contact")).toBe("tel");
    expect(inferAutocomplete("url", "link")).toBe("url");
  });

  it("reads common name fragments, whatever the separator", () => {
    expect(inferAutocomplete("text", "first_name")).toBe("given-name");
    expect(inferAutocomplete("text", "lastName")).toBe("family-name");
    expect(inferAutocomplete("text", "your-email")).toBe("email");
    expect(inferAutocomplete("text", "postcode")).toBe("postal-code");
  });

  it("does not read a company name as a person's name", () => {
    expect(inferAutocomplete("text", "company_name")).toBe("organization");
    expect(inferAutocomplete("text", "full_name")).toBe("name");
  });

  it("returns undefined rather than guessing", () => {
    expect(inferAutocomplete("password", "password")).toBeUndefined();
    expect(inferAutocomplete("text", "how_did_you_hear")).toBeUndefined();
    expect(inferAutocomplete("text", "")).toBeUndefined();
    expect(inferAutocomplete()).toBeUndefined();
  });
});

describe("toDateInputValue", () => {
  it("keeps a bare YYYY-MM-DD value", () => {
    expect(toDateInputValue("2026-01-01")).toBe("2026-01-01");
  });

  it("drops the time part of an ISO datetime", () => {
    expect(toDateInputValue("2026-01-01T15:30:00")).toBe("2026-01-01");
    expect(toDateInputValue("2026-01-01T15:30:00.000Z")).toBe("2026-01-01");
  });

  it("formats a Date object", () => {
    expect(toDateInputValue(new Date("2026-01-01T15:30:00Z"))).toBe("2026-01-01");
  });

  it("returns undefined for anything a date input cannot use", () => {
    expect(toDateInputValue(undefined)).toBeUndefined();
    expect(toDateInputValue(null)).toBeUndefined();
    expect(toDateInputValue("")).toBeUndefined();
    expect(toDateInputValue("next tuesday")).toBeUndefined();
    expect(toDateInputValue(new Date("nope"))).toBeUndefined();
  });
});
