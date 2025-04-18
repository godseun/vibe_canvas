/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

export {}

declare global {
  namespace Cypress {
    interface Chainable {
      // 여기에 커스텀 명령어 타입을 추가할 수 있습니다.
    }
  }
} 