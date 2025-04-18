describe("로그아웃", () => {
  beforeEach(() => {
    // 테스트 사용자 생성 및 로그인
    const testUser = {
      name: "테스트사용자",
      email: `test${Date.now()}@example.com`,
      password: "123456",
    }

    // 회원가입
    cy.visit("/register")
    cy.get('input[name="name"]').should('be.visible').type(testUser.name)
    cy.get('input[name="email"]').should('be.visible').type(testUser.email)
    cy.get('input[name="password"]').should('be.visible').type(testUser.password)
    cy.get('input[name="confirmPassword"]').should('be.visible').type(testUser.password)
    cy.get('button[type="submit"]').should('be.visible').click()

    // 로그인 페이지로 이동 확인 및 로그인 폼이 표시될 때까지 대기
    cy.url().should("include", "/login")
    cy.get('form').should('be.visible')

    // 로그인
    cy.get('input[name="email"]').should('be.visible').type(testUser.email)
    cy.get('input[name="password"]').should('be.visible').type(testUser.password)
    cy.get('button[type="submit"]').should('be.visible').click()

    // 대시보드로 이동 확인
    cy.url().should("include", "/dashboard")
    
    // 페이지 내용 로깅
    cy.document().then((doc) => {
      cy.log('Page HTML:', doc.body.innerHTML)
    })
    
    // 세션 상태 확인
    cy.window().its('localStorage').then((localStorage) => {
      cy.log('LocalStorage:', localStorage)
    })

    // 네비게이션 바가 표시될 때까지 대기
    cy.get('nav', { timeout: 10000 }).should('exist')
  })

  it("네비게이션 바에 로그아웃 버튼이 표시됨", () => {
    cy.get('nav').within(() => {
      cy.get('button').contains('로그아웃').should('be.visible')
    })
  })

  it("로그아웃 버튼 클릭 시 로그인 페이지로 리다이렉트", () => {
    cy.get('button').contains('로그아웃').click()
    cy.url().should("include", "/login")
    cy.get('form').should('be.visible')
  })

  it("로그아웃 후 보호된 페이지 접근 시 로그인 페이지로 리다이렉트", () => {
    cy.get('button').contains('로그아웃').click()
    cy.url().should("include", "/login")
    cy.get('form').should('be.visible')

    cy.visit("/dashboard")
    cy.url().should("include", "/login")
    cy.get('form').should('be.visible')
  })

  it("로그아웃 후 네비게이션 바가 보이지 않음", () => {
    cy.get('button').contains('로그아웃').click()
    cy.url().should("include", "/login")
    cy.get('nav').should("not.exist")
  })
}) 