describe('프로젝트 상세', () => {
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

    // 로그인
    cy.url().should("include", "/login")
    cy.get('form').should('be.visible')
    cy.get('input[name="email"]').should('be.visible').type(testUser.email)
    cy.get('input[name="password"]').should('be.visible').type(testUser.password)
    cy.get('button[type="submit"]').should('be.visible').click()

    // 대시보드로 이동 확인
    cy.url().should("include", "/dashboard")

    // 프로젝트 생성
    cy.contains('button', '새 프로젝트 생성').click()
    const projectName = '테스트 프로젝트'
    const projectDescription = '테스트 프로젝트 설명'
    cy.get('input[id="name"]').type(projectName)
    cy.get('textarea[id="description"]').type(projectDescription)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('프로젝트 상세 페이지로 이동', () => {
    cy.contains('테스트 프로젝트').click()
    cy.url().should('include', '/projects/')
  })

  it('프로젝트 정보가 올바르게 표시됨', () => {
    cy.contains('테스트 프로젝트').click()
    cy.contains('h1', '테스트 프로젝트').should('be.visible')
    cy.contains('테스트 프로젝트 설명').should('be.visible')
  })

  it('프로젝트 멤버 정보가 표시됨', () => {
    cy.contains('테스트 프로젝트').click()
    cy.contains('프로젝트 멤버').should('be.visible')
    cy.contains('테스트사용자').should('be.visible')
    cy.contains('OWNER').should('be.visible')
  })

  it('목록으로 버튼 클릭 시 대시보드로 이동', () => {
    cy.contains('테스트 프로젝트').click()
    cy.contains('button', '목록으로').click()
    cy.url().should('include', '/dashboard')
  })
}) 