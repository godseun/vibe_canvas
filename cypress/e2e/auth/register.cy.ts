describe("회원가입", () => {
  beforeEach(() => {
    cy.visit("/register")
  })

  it("모든 필드가 비어있을 때 유효성 검사", () => {
    cy.get('button[type="submit"]').click()
    cy.contains("이름은 2글자 이상이어야 합니다").should("be.visible")
    cy.contains("올바른 이메일 주소를 입력해주세요").should("be.visible")
    cy.contains("비밀번호는 6자 이상이어야 합니다").should("be.visible")
  })

  it("이름 필드 유효성 검사", () => {
    cy.get('input[name="name"]').type("김")
    cy.get('button[type="submit"]').click()
    cy.contains("이름은 2글자 이상이어야 합니다").should("be.visible")
    
    cy.get('input[name="name"]').clear().type("홍길동")
    cy.contains("이름은 2글자 이상이어야 합니다").should("not.exist")
  })

  it("이메일 필드 유효성 검사", () => {
    const invalidEmails = ["test", "test@", "test@.", "test@.com"]
    
    invalidEmails.forEach((email) => {
      cy.get('input[name="email"]').clear().type(email)
      cy.get('button[type="submit"]').click()
      cy.contains("올바른 이메일 주소를 입력해주세요").should("be.visible")
    })

    cy.get('input[name="email"]').clear().type("test@example.com")
    cy.contains("올바른 이메일 주소를 입력해주세요").should("not.exist")
  })

  it("비밀번호 필드 유효성 검사", () => {
    cy.get('input[name="password"]').type("12345")
    cy.get('button[type="submit"]').click()
    cy.contains("비밀번호는 6자 이상이어야 합니다").should("be.visible")

    cy.get('input[name="password"]').clear().type("123456")
    cy.contains("비밀번호는 6자 이상이어야 합니다").should("not.exist")
  })

  it("비밀번호 확인 필드 유효성 검사", () => {
    cy.get('input[name="password"]').type("123456")
    cy.get('input[name="confirmPassword"]').type("123457")
    cy.get('button[type="submit"]').click()
    cy.contains("비밀번호가 일치하지 않습니다").should("be.visible")

    cy.get('input[name="confirmPassword"]').clear().type("123456")
    cy.contains("비밀번호가 일치하지 않습니다").should("not.exist")
  })

  it("성공적인 회원가입", () => {
    const testUser = {
      name: "홍길동",
      email: `test${Date.now()}@example.com`,
      password: "123456",
    }

    cy.get('input[name="name"]').type(testUser.name)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    // 회원가입 성공 후 로그인 페이지로 리다이렉트
    cy.url().should("include", "/login")
    cy.url().should("include", "registered=true")
  })
}) 