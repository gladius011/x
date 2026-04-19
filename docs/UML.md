# VMA Calculator — UML Diagrams

> All diagrams below are written in **PlantUML** syntax. You can render them at
> [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml) or with the
> VS Code extension **"PlantUML"** (`jebbs.plantuml`).

---

## Table of Contents

1. [Use Case Diagram](#1-use-case-diagram)
2. [Class Diagram (Backend)](#2-class-diagram--backend)
3. [Entity-Relationship Diagram (Database)](#3-entity-relationship-diagram--database)
4. [Sequence Diagram — Register](#4-sequence-diagram--register)
5. [Sequence Diagram — Login](#5-sequence-diagram--login)
6. [Sequence Diagram — Guest VMA Calculation](#6-sequence-diagram--guest-vma-calculation)
7. [Sequence Diagram — Authenticated VMA Test (Save)](#7-sequence-diagram--authenticated-vma-test-save)
8. [Sequence Diagram — Password Reset](#8-sequence-diagram--password-reset)
9. [Component Diagram (Architecture)](#9-component-diagram--architecture)
10. [Activity Diagram — Test Flow](#10-activity-diagram--test-flow)

---

## 1. Use Case Diagram

```plantuml
@startuml UseCaseDiagram
left to right direction
skinparam actorStyle awesome
skinparam packageStyle rectangle

actor "Guest" as Guest
actor "Authenticated\nUser" as AuthUser

rectangle "VMA Calculator Application" {

  ' ── Guest use cases ──
  usecase "Select Test Type\n(Cooper / Demi-Cooper)" as UC_SelectTest
  usecase "Enter Performance Data" as UC_EnterData
  usecase "Calculate VMA\n(without saving)" as UC_CalcVMA
  usecase "View Calculation\nResult & Steps" as UC_ViewCalc
  usecase "Sign Up" as UC_Signup
  usecase "Log In" as UC_Login
  usecase "Forgot Password" as UC_ForgotPW

  ' ── Authenticated use cases ──
  usecase "Calculate & Save\nVMA Test" as UC_SaveTest
  usecase "View My Results\n(list / filter / search)" as UC_MyResults
  usecase "View Test Detail" as UC_TestDetail
  usecase "Delete My Test" as UC_DeleteTest
  usecase "View My Dashboard\n(stats & charts)" as UC_Dashboard
  usecase "Export My Results\n(CSV)" as UC_Export
  usecase "View My Profile" as UC_Profile
  usecase "Log Out" as UC_Logout
  usecase "Reset Password" as UC_ResetPW
}

Guest --> UC_SelectTest
Guest --> UC_EnterData
Guest --> UC_CalcVMA
Guest --> UC_ViewCalc
Guest --> UC_Signup
Guest --> UC_Login
Guest --> UC_ForgotPW

AuthUser --> UC_SelectTest
AuthUser --> UC_EnterData
AuthUser --> UC_SaveTest
AuthUser --> UC_MyResults
AuthUser --> UC_TestDetail
AuthUser --> UC_DeleteTest
AuthUser --> UC_Dashboard
AuthUser --> UC_Export
AuthUser --> UC_Profile
AuthUser --> UC_Logout
AuthUser --> UC_ResetPW

UC_CalcVMA .> UC_EnterData : <<include>>
UC_SaveTest .> UC_EnterData : <<include>>
UC_SaveTest .> UC_CalcVMA : <<extend>>
UC_TestDetail .> UC_MyResults : <<include>>
UC_ResetPW .> UC_ForgotPW : <<include>>

@enduml
```

---

## 2. Class Diagram (Backend)

```plantuml
@startuml ClassDiagram
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #f8fafc
  BorderColor #334155
  ArrowColor #334155
}

package "Models" {
  class UserModel {
    +createTable(): Promise<void>
    +create(username, email, password): Promise<User>
    +findByEmail(email): Promise<User|null>
    +findByUsername(username): Promise<User|null>
    +findByEmailOrUsername(identifier): Promise<User|null>
    +findById(id): Promise<User|null>
    +verifyPassword(plain, hash): Promise<boolean>
    +updatePassword(userId, newPassword): Promise<void>
    +createResetToken(userId, token): Promise<void>
    +findValidResetToken(token): Promise<ResetToken|null>
    +markTokenUsed(tokenId): Promise<void>
  }

  class TestModel {
    +createTable(): Promise<void>
    +create(data): Promise<Test>
    +findAll(filters): Promise<Test[]>
    +findByUserId(userId, filters): Promise<Test[]>
    +findById(id): Promise<Test|null>
    +delete(id): Promise<Test|null>
    +count(filters): Promise<number>
    +countByUserId(userId, filters): Promise<number>
    +getStats(): Promise<Stats>
    +getStatsByUserId(userId): Promise<Stats>
    +findAllForExport(filters): Promise<Test[]>
  }
}

package "Controllers" {
  class AuthController {
    +register(req, res, next): Promise<void>
    +login(req, res, next): Promise<void>
    +logout(req, res): void
    +me(req, res, next): Promise<void>
    +forgotPassword(req, res, next): Promise<void>
    +resetPassword(req, res, next): Promise<void>
  }

  class TestController {
    +create(req, res, next): Promise<void>
    +getAll(req, res, next): Promise<void>
    +getById(req, res, next): Promise<void>
    +delete(req, res, next): Promise<void>
    +exportCSV(req, res, next): Promise<void>
    +getStats(req, res, next): Promise<void>
    +getUserTests(req, res, next): Promise<void>
  }
}

package "Middleware" {
  class Auth {
    +generateToken(user): string
    +requireAuth(req, res, next): void
    +optionalAuth(req, res, next): void
  }

  class Validation {
    +validateTestInput(req, res, next): void
  }

  class ErrorHandler {
    +errorHandler(err, req, res, next): void
    +notFound(req, res, next): void
  }
}

package "Services" {
  class EmailService {
    -getClient(): MailjetClient|null
    +sendEmail(options): Promise<result>
    +sendWelcomeEmail(user): Promise<void>
    +sendPasswordResetEmail(user, token): Promise<void>
  }
}

package "Utils" {
  class VMACalculator {
    +TEST_DURATIONS: {cooper: 720, demi-cooper: 360}
    +validateInputs(params): {valid, errors}
    +calculateVMA(params): {vma, effectiveTimeSeconds, steps}
    +classifyLevel(vma): {level, label, color}
    +validateForm(data): {valid, errors}
  }
}

package "Config" {
  class Database {
    +pool: pg.Pool
  }
}

' ── Relationships ──
AuthController --> UserModel : uses
AuthController --> Auth : uses generateToken
AuthController --> EmailService : sends emails
TestController --> TestModel : uses
TestController --> VMACalculator : calculates VMA
TestController --> Auth : requireAuth / optionalAuth
UserModel --> Database : queries
TestModel --> Database : queries
EmailService --> "Mailjet API" : sends via

@enduml
```

---

## 3. Entity-Relationship Diagram (Database)

```plantuml
@startuml ERDiagram
skinparam linetype ortho

entity "users" as users {
  * **id** : SERIAL <<PK>>
  --
  * username : VARCHAR(100) <<UNIQUE>>
  * email : VARCHAR(255) <<UNIQUE>>
  * password_hash : VARCHAR(255)
  * created_at : TIMESTAMPTZ
  * updated_at : TIMESTAMPTZ
}

entity "tests" as tests {
  * **id** : SERIAL <<PK>>
  --
  * first_name : VARCHAR(100)
  * last_name : VARCHAR(100)
  * age : INTEGER [1..149]
  * gender : VARCHAR(20) {male|female|other}
    weight : DECIMAL(5,2)
  * test_type : VARCHAR(20) {cooper|demi-cooper}
  * distance_meters : DECIMAL(10,2)
  * stop_time_seconds : DECIMAL(10,2)
  * walking_time_seconds : DECIMAL(10,2)
  * effective_time_seconds : DECIMAL(10,2)
  * vma : DECIMAL(6,2)
  * level : INTEGER [1..5]
  * level_label : VARCHAR(50)
    calculation_steps : TEXT[]
    user_id : INTEGER <<FK>>
  * created_at : TIMESTAMPTZ
  * updated_at : TIMESTAMPTZ
}

entity "password_reset_tokens" as tokens {
  * **id** : SERIAL <<PK>>
  --
  * user_id : INTEGER <<FK>>
  * token : VARCHAR(255) <<UNIQUE>>
  * expires_at : TIMESTAMPTZ
  * used : BOOLEAN = false
  * created_at : TIMESTAMPTZ
}

users ||--o{ tests : "owns (1:N)"
users ||--o{ tokens : "has reset tokens (1:N)"

@enduml
```

---

## 4. Sequence Diagram — Register

```plantuml
@startuml SequenceRegister
skinparam sequenceArrowThickness 2
skinparam participantPadding 20

actor User as U
participant "React\nFrontend" as FE
participant "Express\nAPI" as API
participant "AuthController" as AC
participant "UserModel" as UM
database "PostgreSQL" as DB
participant "EmailService" as ES

U -> FE : Fill signup form\n(username, email, password)
FE -> API : POST /api/auth/register
API -> AC : register(req, res)
AC -> AC : Validate input\n(length, format, uppercase, number)

alt Validation fails
  AC --> FE : 400 {errors: [...]}
  FE --> U : Show validation errors
end

AC -> UM : findByEmail(email)
UM -> DB : SELECT * FROM users WHERE email = $1
DB --> UM : null (not found)

AC -> UM : findByUsername(username)
UM -> DB : SELECT * FROM users WHERE username = $1
DB --> UM : null (not found)

AC -> UM : create({username, email, password})
UM -> UM : bcrypt.hash(password, 12)
UM -> DB : INSERT INTO users ...
DB --> UM : user row
UM --> AC : user

AC -> AC : generateToken(user) → JWT

AC ->> ES : sendWelcomeEmail(user) [async, non-blocking]
ES -> "Mailjet" : POST send v3.1

AC --> FE : 201 {user, token}
FE -> FE : localStorage.setItem('vma-token', token)\nsetUser(user)
FE --> U : Redirect to Home page

@enduml
```

---

## 5. Sequence Diagram — Login

```plantuml
@startuml SequenceLogin
actor User as U
participant "React\nFrontend" as FE
participant "Express\nAPI" as API
participant "AuthController" as AC
participant "UserModel" as UM
database "PostgreSQL" as DB

U -> FE : Enter email/username + password
FE -> API : POST /api/auth/login\n{identifier, password}
API -> AC : login(req, res)

AC -> UM : findByEmailOrUsername(identifier)
UM -> DB : SELECT * FROM users\nWHERE email = $1 OR username = $1
DB --> UM : user (with password_hash)

alt User not found
  AC --> FE : 401 {error: "Invalid credentials"}
end

AC -> UM : verifyPassword(password, user.password_hash)
UM -> UM : bcrypt.compare()

alt Password incorrect
  AC --> FE : 401 {error: "Invalid credentials"}
end

AC -> AC : generateToken(user) → JWT
AC --> FE : 200 {user, token}
FE -> FE : localStorage.setItem('vma-token', token)\nsetUser(user)
FE --> U : Redirect to Home page

@enduml
```

---

## 6. Sequence Diagram — Guest VMA Calculation

```plantuml
@startuml SequenceGuestCalc
actor Guest as G
participant "React\nFrontend" as FE
participant "Express\nAPI" as API
participant "Auth\nMiddleware" as MW
participant "TestController" as TC
participant "VMA\nCalculator" as VMA

G -> FE : Select test type\n→ Fill form\n→ Submit
FE -> API : POST /api/tests\n{testType, firstName, ... distanceMeters, ...}\n(no Authorization header)

API -> MW : optionalAuth(req)
MW -> MW : No Bearer token found
MW -> MW : req.user = null
MW -> TC : next()

TC -> VMA : validateInputs(params)
VMA --> TC : {valid: true}

TC -> VMA : calculateVMA(params)
VMA --> TC : {vma, effectiveTimeSeconds, steps}

TC -> VMA : classifyLevel(vma)
VMA --> TC : {level, label, color}

note over TC : req.user is null\n→ DO NOT save to DB

TC --> FE : 200 {\n  saved: false,\n  message: "Sign up to save!",\n  data: {vma, level, steps, ...}\n}

FE --> G : Show VMA result\n+ "Sign up to save your results!" CTA

@enduml
```

---

## 7. Sequence Diagram — Authenticated VMA Test (Save)

```plantuml
@startuml SequenceAuthTest
actor User as U
participant "React\nFrontend" as FE
participant "Express\nAPI" as API
participant "Auth\nMiddleware" as MW
participant "TestController" as TC
participant "VMA\nCalculator" as VMA
participant "TestModel" as TM
database "PostgreSQL" as DB

U -> FE : Select test type\n→ Fill form\n→ Submit
FE -> API : POST /api/tests\n+ Authorization: Bearer <token>\n{testType, firstName, ...}

API -> MW : optionalAuth(req)
MW -> MW : jwt.verify(token) → decoded
MW -> MW : req.user = {id, username, email}
MW -> TC : next()

TC -> VMA : validateInputs(params)
VMA --> TC : {valid: true}

TC -> VMA : calculateVMA(params)
VMA --> TC : {vma, effectiveTimeSeconds, steps}

TC -> VMA : classifyLevel(vma)
VMA --> TC : {level, label, color}

note over TC : req.user exists\n→ SAVE to DB

TC -> TM : create({...data, userId: req.user.id})
TM -> DB : INSERT INTO tests (..., user_id)\nRETURNING *
DB --> TM : saved test row
TM --> TC : test

TC --> FE : 201 {\n  saved: true,\n  data: {id, vma, level, ...}\n}

FE --> U : Show result\n+ "View Details" + "All Results" links

@enduml
```

---

## 8. Sequence Diagram — Password Reset

```plantuml
@startuml SequencePasswordReset
actor User as U
participant "React\nFrontend" as FE
participant "Express\nAPI" as API
participant "AuthController" as AC
participant "UserModel" as UM
database "PostgreSQL" as DB
participant "EmailService" as ES

== Step 1: Request Reset ==

U -> FE : Enter email → Submit
FE -> API : POST /api/auth/forgot-password\n{email}
API -> AC : forgotPassword(req, res)
AC -> UM : findByEmail(email)
UM -> DB : SELECT * FROM users WHERE email = $1
DB --> UM : user

AC -> AC : crypto.randomBytes(32) → resetToken
AC -> UM : createResetToken(userId, resetToken)
UM -> DB : INSERT INTO password_reset_tokens\n(user_id, token, expires_at = NOW() + 1h)

AC ->> ES : sendPasswordResetEmail(user, token) [async]
ES -> "Mailjet" : POST send v3.1\n(link: /reset-password/<token>)

AC --> FE : 200 {message: "If that email exists..."}
FE --> U : "Check your email"

== Step 2: Reset Password ==

U -> FE : Click link in email\n→ /reset-password/:token\n→ Enter new password
FE -> API : POST /api/auth/reset-password\n{token, password}
API -> AC : resetPassword(req, res)

AC -> UM : findValidResetToken(token)
UM -> DB : SELECT * FROM password_reset_tokens\nWHERE token=$1 AND used=false\nAND expires_at > NOW()
DB --> UM : resetRecord

AC -> UM : updatePassword(userId, newPassword)
UM -> UM : bcrypt.hash(newPassword, 12)
UM -> DB : UPDATE users SET password_hash = $1

AC -> UM : markTokenUsed(tokenId)
UM -> DB : UPDATE password_reset_tokens SET used = true

AC --> FE : 200 {message: "Password reset successfully"}
FE --> U : "Go to Login" button

@enduml
```

---

## 9. Component Diagram (Architecture)

```plantuml
@startuml ComponentDiagram
skinparam componentStyle rectangle

package "Frontend — React + Vite + TailwindCSS" {
  [Pages] as Pages
  [Components] as Comps
  [Context\n(Auth + Theme)] as Ctx
  [API Service] as APISvc
  [Utils\n(VMA, PDF)] as FEUtils

  note right of Pages
    TestSelection, TestForm,
    Results, TestDetail,
    Dashboard, Profile,
    Login, Signup,
    ForgotPassword, ResetPassword
  end note

  note right of Comps
    Header, Footer,
    ProtectedRoute,
    LevelBadge, Toast,
    LoadingSpinner, ErrorMessage
  end note
}

package "Backend — Node.js + Express" {
  [Routes] as Routes
  [Middleware\n(Auth, Validation,\nErrorHandler)] as MW
  [Controllers\n(Auth, Test)] as Ctrl
  [Models\n(User, Test)] as Models
  [Services\n(EmailService)] as Svc
  [Utils\n(VMA Calculator)] as BEUtils
}

database "PostgreSQL" as DB {
  [users]
  [tests]
  [password_reset_tokens]
}

cloud "External Services" {
  [Mailjet API] as Mailjet
}

' ── Connections ──
Pages --> Ctx : useAuth()
Pages --> APISvc : api.xxx()
Comps --> Ctx : useAuth()\nuseTheme()
APISvc --> Routes : HTTP + JWT

Routes --> MW : auth checks
MW --> Ctrl : validated request
Ctrl --> Models : DB operations
Ctrl --> BEUtils : VMA calculations
Ctrl --> Svc : send emails
Models --> DB : SQL queries
Svc --> Mailjet : SMTP v3.1

@enduml
```

---

## 10. Activity Diagram — Test Flow

```plantuml
@startuml ActivityDiagram
start

:User opens VMA Calculator;
:Select test type\n(Cooper 12min / Demi-Cooper 6min);
:Fill in runner info\n(name, age, gender, weight);
:Enter performance data\n(distance, stop time, walking time);

:Submit form;

:API validates inputs;

if (Validation passes?) then (yes)
  :Calculate VMA\n= (distance / 1000) / (effectiveTime / 3600);
  :Classify fitness level\n(1-5: Very Low → Excellent);

  if (User is logged in?) then (yes)
    :Save test to database\n(with user_id);
    :Return result + saved = true;
    :Display result\n+ "View Details"\n+ "All Results";
  else (no — guest)
    :Return result + saved = false;
    :Display result\n+ "Sign up to save your results!" CTA;
  endif

else (no)
  :Return validation errors;
  :Highlight invalid fields;
endif

stop

@enduml
```

---

## How to Render These Diagrams

### Option 1: VS Code Extension
1. Install the **PlantUML** extension (`jebbs.plantuml`)
2. Open this `.md` file
3. Place your cursor inside a `plantuml` code block
4. Press `Alt+D` to preview

### Option 2: Online
1. Go to **https://www.plantuml.com/plantuml/uml**
2. Paste any `@startuml ... @enduml` block
3. Click "Submit" to render

### Option 3: Export to PNG/SVG
```bash
# Install PlantUML (requires Java)
sudo apt install plantuml

# Render all diagrams from this file
plantuml -tpng docs/UML.md     # generates PNG images
plantuml -tsvg docs/UML.md     # generates SVG images
```

---

*VMA Calculator — Developed by Maryam Karim*
*© 2026*
