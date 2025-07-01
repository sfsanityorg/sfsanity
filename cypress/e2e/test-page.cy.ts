import { describe, it } from "mocha"
import { cy } from "cypress"

describe("Test Page", () => {
  it("should load the test page successfully", () => {
    cy.visit("/test")
    cy.contains("Test Page").should("be.visible")
    cy.contains("App is working!").should("be.visible")
  })

  it("should display current timestamp", () => {
    cy.visit("/test")
    cy.contains("Timestamp:").should("be.visible")
    cy.contains("Environment: Client").should("be.visible")
  })
})
