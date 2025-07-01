import { describe, beforeEach, it } from "cypress"
import { cy } from "cypress"

describe("Dashboard", () => {
  beforeEach(() => {
    // Intercept API calls to prevent real database calls
    cy.intercept("GET", "**/items**", { fixture: "items.json" }).as("getItems")
    cy.visit("/")
  })

  it("should load the dashboard successfully", () => {
    cy.contains("Data Dashboard").should("be.visible")
    cy.contains("Total Items").should("be.visible")
    cy.contains("Status").should("be.visible")
  })

  it("should display loading state initially", () => {
    cy.contains("Loading items...").should("be.visible")
  })

  it("should handle infinite scroll toggle", () => {
    cy.get("#infinite-scroll").should("exist")
    cy.get("#infinite-scroll").click()
    cy.get("#infinite-scroll").should("be.checked")
  })

  it("should display error state when API fails", () => {
    cy.intercept("GET", "**/items**", { statusCode: 500 }).as("getItemsError")
    cy.reload()

    cy.contains("Something went wrong").should("be.visible")
    cy.contains("Try Again").should("be.visible")
  })

  it("should retry on error", () => {
    cy.intercept("GET", "**/items**", { statusCode: 500 }).as("getItemsError")
    cy.reload()

    cy.contains("Try Again").click()
    cy.wait("@getItemsError")
  })

  it("should be responsive on mobile", () => {
    cy.viewport("iphone-6")
    cy.contains("Data Dashboard").should("be.visible")
    cy.get('[data-testid="item-card"]').should("be.visible")
  })
})
