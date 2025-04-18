describe("로그인", () => {
  beforeEach(() => {
    cy.visit("/login")
  })

  it("로그인 폼의 유효성 검사", () => {
    // 빈 폼 제출 시 유효성 검사
    cy.get('button[type="submit"]').click()
    cy.contains("올바른 이메일 주소를 입력해주세요").should("be.visible")
    cy.contains("비밀번호를 입력해주세요").should("be.visible")

    // 잘못된 이메일 형식 입력
    cy.get('input[name="email"]').type("test")
    cy.get('button[type="submit"]').click()
    cy.contains("올바른 이메일 주소를 입력해주세요").should("be.visible")

    // 올바른 이메일 형식 입력
    cy.get('input[name="email"]').clear().type("test@example.com")
    cy.contains("올바른 이메일 주소를 입력해주세요").should("not.exist")
    
    // 비밀번호 입력
    cy.get('input[name="password"]').type("123456")
    cy.contains("비밀번호를 입력해주세요").should("not.exist")
  })

  it("잘못된 로그인 시도", () => {
    // 존재하지 않는 계정으로 로그인 시도
    cy.get('input[name="email"]').type("nonexistent@example.com")
    cy.get('input[name="password"]').type("invalidpassword")
    cy.get('button[type="submit"]').click()
    
    // 에러 메시지 확인
    cy.contains("이메일 또는 비밀번호가 올바르지 않습니다").should("be.visible")
  })

  it("회원가입 링크 이동", () => {
    cy.contains("회원가입").click()
    cy.url().should("include", "/register")
  })

  it("성공적인 로그인", () => {
    // 먼저 테스트 사용자를 생성
    const testUser = {
      name: "테스트사용자",
      email: `test${Date.now()}@example.com`,
      password: "123456",
    }

    // 회원가입
    cy.visit("/register")
    cy.get('input[name="name"]').type(testUser.name)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    // 로그인 페이지로 이동 확인
    cy.url().should("include", "/login")
    
    // 생성한 계정으로 로그인
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('button[type="submit"]').click()
    
    // 대시보드로 이동 확인
    cy.url().should("include", "/dashboard")
  })
}) 