/**
 * E2E Test: Complete Booking Flow
 * Covers TC-BOOK-01, TC-PAY-01, TC-UAT-01
 */

describe('Complete Appointment Booking Flow', () => {
  beforeEach(() => {
    // Login as patient
    cy.visit('/auth/login?role=patient')
    cy.get('input[type="email"]').type('patient@test.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/patient')
  })

  it('should complete booking flow from search to payment', () => {
    // Step 1: Search for doctor
    cy.visit('/patient/discover')
    cy.get('input[placeholder*="Search"]').type('Cardiologist')
    cy.get('button').contains('Book Appointment').first().click()

    // Step 2: Select date and time
    cy.url().should('include', '/patient/booking')
    cy.get('button').contains('Today').click()
    cy.get('button').contains('10:00').click()
    cy.get('button').contains('Continue').click()

    // Step 3: Review payment
    cy.get('text').should('contain', 'Payment Summary')
    cy.get('text').should('contain', 'Platform Fee')
    
    // Step 4: Complete payment
    cy.get('button').contains('Pay').click()
    
    // Step 5: Verify confirmation
    cy.url().should('include', '/patient/appointments')
    cy.get('text').should('contain', 'Appointment Confirmed')
  })
})

