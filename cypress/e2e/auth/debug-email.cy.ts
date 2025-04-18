describe("이메일 필드 디버깅", () => {
  it("이메일 필드 테스트", () => {
    cy.visit("/register")
    cy.get('input[name="email"]').clear().type("test")
    cy.get('button[type="submit"]').click()
    
    // 스크린샷 캡처
    cy.screenshot("email-validation-error")
    
    // 페이지의 모든 텍스트 로깅
    cy.get("body").then(($body) => {
      console.log("페이지 내용:", $body.text())
    })
  })
}) 