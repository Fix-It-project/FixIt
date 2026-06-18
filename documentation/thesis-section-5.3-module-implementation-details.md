5.3 Module Implementation Details

5.3.1 AI/ML Module and Recommendation Engine

The AI/ML module was implemented as an independent Python microservice responsible for technician recommendation and multimodal preprocessing. Its main purpose is to transform an unstructured maintenance request into a ranked list of candidate technicians using semantic matching, geographic filtering, and trust-aware scoring. In architectural terms, this module separates computationally intensive recommendation logic from the main Node.js application, which keeps the transactional API focused on authentication, booking, and administrative workflows.

The recommendation engine uses Python with FastAPI and Pydantic for the API layer, SQLAlchemy for database access, and a hybrid recommendation pipeline built from content-based and collaborative components. At application startup, the FastAPI lifespan hook loads the required user, technician, and booking data from the database, prepares the feature pipeline, and builds the recommendation engines before serving requests. This initialization strategy avoids repeated model preparation during user requests and reduces per-request latency once the service is online.

When a recommendation request reaches POST /api/recommend, the service first infers the likely service category from the user’s problem description, then filters technicians geographically within the requested radius using the Haversine formula. It next computes a content-based relevance score, combines it with collaborative signals derived from historical booking behavior, and applies the MarketTrust weighting so that highly reliable technicians are favored over equally relevant but less consistent alternatives. The final response returns the top-ranked technicians together with match metadata, the cold-start indicator, and the engine variant that produced the result.

Code example:

    class TechnicianMatch(BaseModel):
        technician_id: Any
        name: str
        category: str
        match_score: float = Field(..., ge=0, le=1)
        distance_km: float = Field(..., ge=0)
        market_trust_score: float = Field(..., ge=0, le=1)
        base_hourly_rate: Optional[int] = None

This response schema illustrates an important design decision: the AI module does not return an unstructured blob, but a strongly typed contract that can be consumed safely by downstream services. Pydantic is therefore used not only for validation, but also to formalize the output boundary between the recommendation engine and the application stack that depends on it.

5.3.2 Node.js AI Gateway (Orchestration Layer)

The Node.js AI gateway acts as the orchestration layer between the mobile client and the Python recommendation service. Rather than allowing the mobile application to call the recommendation engine directly, the gateway centralizes validation, multimodal payload handling, and model orchestration. This keeps client integration simpler and allows the AI flow to evolve without exposing internal service boundaries to the frontend.

The gateway is implemented in Node.js with Express. Its /api/ai/diagnose route accepts text, image, and audio inputs together with GPS coordinates, performs request validation, and forwards the request to the local AI agent flow. In the current implementation, that agent interacts with the recommendation service through the get_technician_recommendation tool path, allowing the gateway to coordinate large-language-model reasoning with deterministic recommendation output. Once the tool result is returned, the gateway normalizes the payload into a consistent JSON structure before sending it back to the mobile application.

Code example:

    router.post("/api/ai/diagnose", async (req, res) => {
      const { text, image, audio, latitude, longitude, userId } = req.body;
      const serviceOrder = await getAIServiceOrder({
        text,
        imageBase64: image,
        audioBuffer: audio ? Buffer.from(audio, "base64") : null,
        latitude,
        longitude,
        userId,
      });

      res.json({ success: true, data: serviceOrder });
    });

This route shows that the gateway is intentionally thin. It validates the request, delegates orchestration to the AI client, and returns a stable success envelope. The key architectural point is that the orchestration complexity is hidden behind a single HTTP boundary, so the mobile frontend does not need to understand whether the final answer came from direct API logic, a model tool call, or a fallback path.

The normalized response format is especially important because the mobile application expects a unified service_order object regardless of which internal AI path produced it. That design reduces coupling between the client and the underlying experimentation inside the recommendation and diagnosis stack.

5.3.3 Shared Technology Stack and Implementation Pattern

Beyond the AI-specific components, the main application is implemented as a TypeScript monorepo. This structure was chosen to keep the mobile application, admin dashboard, backend API, and shared utilities in a single coordinated workspace while still preserving clear module boundaries. The monorepo contains an Express backend for core business workflows, an Expo React Native mobile application for homeowners and technicians, a React and Vite admin dashboard for moderation and analytics, and shared workspace packages that centralize environment configuration, error handling, and reusable types. This arrangement reduces duplication between applications and makes it easier to maintain shared contracts across the system.

Supabase serves as the primary backend platform for authentication and persisted application data. It provides the authentication foundation used by the user and technician flows and also acts as the main persistence layer for application entities such as users, technicians, orders, addresses, and supporting workflow records. By using Supabase as a common infrastructure layer, the implementation avoids scattering storage concerns across unrelated services and keeps the operational data model centralized.

Type safety and validation are treated as first-class architectural concerns throughout the system. On the backend, Zod-based DTO validation is applied at the HTTP boundary so that request bodies, query parameters, and route parameters are checked before entering the business layer. On the frontend, schema parsing and typed API clients are used to normalize server responses before UI components consume them. Centralized state management is used only where shared runtime state is genuinely required, such as authentication context, user session data, and location state. Together, these practices reduce ambiguity at system boundaries and help ensure that each layer receives data in a predictable shape.

The backend follows a layered, modular, domain-oriented implementation pattern. Rather than organizing the server around technical utility folders alone, major business capabilities are implemented as modules such as authentication, orders, technician scheduling, and administration. Within each module, responsibilities are divided across routes, controllers, services, and repositories. Routes define the available HTTP endpoints and compose middleware such as authentication and validation. Controllers handle transport-level concerns, including extraction of validated request data, delegation to application services, and construction of HTTP responses. Services contain the actual business logic, enforce workflow rules, and coordinate behavior across multiple entities or repositories. Repositories encapsulate Supabase queries and provider-specific implementation details so that higher layers are not tightly coupled to storage or vendor behavior.

This separation of responsibilities is important for both maintainability and testability. Because controllers remain thin, they can be tested primarily for response mapping and error propagation. Because business rules live in services, service tests can focus directly on workflow correctness without having to simulate full HTTP execution. Because database access is isolated in repositories, provider-specific logic can be changed with a smaller impact on the rest of the system. The result is an architecture in which each layer has a narrow and understandable role.

The same implementation pattern is applied consistently across the main backend domains. In authentication, the layered structure supports account creation, sign-in, blocked-account checks, and session handling. In the orders module, it supports complex lifecycle transitions, role-restricted actions, payment branching, and audit tracking. In technician scheduling, it supports availability templates, holiday exceptions, and booking-aware constraints. In administration, it supports dashboard aggregation, moderation actions, and operational read models. This consistency is significant because it reduces conceptual overhead: once the structure of one module is understood, the others follow the same architectural logic.

Another important characteristic of this pattern is that request validation happens before controller logic executes. Incoming requests are validated against DTO schemas at the boundary, and invalid requests are rejected early. As a result, services operate on normalized input instead of raw transport data, which reduces defensive duplication inside the business layer. In practice, this means that validation errors, business-rule violations, and persistence concerns are handled at distinct architectural levels rather than becoming intermixed in the same functions.

5.3.4 Detailed Example Module: Authentication

Authentication is the clearest deep example of the project’s implementation pattern because it combines request validation, user-session management, cross-role checks, persistence of domain records, and provider-specific integration with Supabase Auth. The module is responsible for account registration and sign-in, session refresh and sign-out, password reset, Google OAuth onboarding completion, blocked-account enforcement, and a separate administrator authentication path used by the admin dashboard.

The main implementation files of this module are organized by role. auth.routes.ts defines the HTTP surface, applies DTO validation and authentication middleware, and delegates to controller handlers. auth.controller.ts extracts validated request data, invokes service methods, and returns the response payload with minimal additional logic. auth.service.ts contains the actual authentication rules and orchestration, including registration, sign-in gating, blocked-user enforcement, refresh-session revalidation, and OAuth profile completion. auth.repository.ts isolates direct Supabase Auth interaction and translates low-level provider failures into application-facing errors. Related shared infrastructure supports this module without belonging to it directly: DTO schemas are defined in shared DTO files, requireUserAuth protects authenticated routes, validate(...) guards request boundaries, and the shared application error model standardizes failure handling across the API.

The route layer demonstrates how little logic is kept at the transport boundary.

Code example:

    router.post("/signup", validate({ body: SignUpBodySchema }), authController.signUp);
    router.post("/signin", validate({ body: SignInBodySchema }), authController.signIn);
    router.get("/me", requireUserAuth, authController.getCurrentUser);
    router.post("/oauth/complete", requireUserAuth, validate({ body: OAuthCompleteBodySchema }), authController.oauthComplete);
    router.post("/refresh", validate({ body: RefreshTokenBodySchema }), authController.refreshToken);

This snippet shows that routing is used primarily to compose boundary concerns. Schema validation is applied declaratively, authentication middleware is attached where required, and the controller receives only well-formed requests. The route file therefore stays simple even though the service logic behind it is substantial.

The service layer owns the actual policy. In particular, it coordinates repository calls and enforces rules that cannot be expressed through DTO validation alone.

Code example:

    async signIn(data: SignInData) {
      const result = await authRepository.signIn(data);
      const userRecord = await usersRepository.getUserByEmail(data.email);

      if (!userRecord) {
        await Promise.resolve(authRepository.signOut(result.session?.access_token ?? "")).catch(() => undefined);
        throw AppError.forbidden("No user account found for this email", { token: "not_user_account" });
      }

      if ((userRecord as { blocked?: boolean }).blocked) {
        throw AppError.forbidden("Your account has been blocked. Contact support for assistance.", {
          fields: { accountStatus: "blocked" },
        });
      }

      return { user: result.user, session: result.session };
    }

This service snippet demonstrates why thin controllers are valuable. Sign-in is not merely a credential check. The flow must reject cross-role login attempts and stop blocked homeowners from obtaining a session, which requires coordination between the authentication repository and domain repositories. Those rules belong in the service layer, where they can be tested independently of HTTP transport concerns.

The authentication module also shows the value of repository abstraction. auth.repository.ts wraps direct Supabase calls such as signUp, signInWithPassword, getUser, and refreshSession, while mapping provider-specific errors into the shared error model. As a result, the service layer remains focused on domain rules rather than external error strings or vendor response formats.

Several implemented tests reinforce this design. Service tests verify that successful sign-up creates both user and address records, that sign-in rejects technician emails on the homeowner path, that blocked homeowners cannot sign in, and that refresh logic re-checks blocked status before renewing a session. Repository tests verify translation of Supabase sign-in and refresh-token errors. On the administrator side, tests verify that invalid admin credentials are rejected and that the session cookie is configured correctly for secure cross-site deployment settings, including the SameSite=None case required by deployed admin clients.

5.3.5 Orders Module

The orders module is the core business workflow of the platform. It manages order submission, technician acceptance and decline, inspection and quotation, completion confirmation, payment initiation, payment webhooks, rescheduling, and event-history tracking. Although its internal surface is broader than that of the authentication module, it follows the same layered structure. The route layer separates homeowner and technician actions, lifecycle controllers remain thin, the lifecycle service orchestrates state transitions and side effects, and repositories persist and retrieve order state from the database.

The main complexity of this module lies in lifecycle control. Order creation must validate booking-slot constraints and resolve the correct homeowner address. Later actions must respect both the acting role and the current order status. Payment logic must branch between card and cash flows. Notifications and order-history entries must be emitted at the correct transitions so that both the user interface and the administrative dashboard can reconstruct what happened over time. The service layer therefore functions as a workflow coordinator rather than a simple CRUD wrapper.

Code example:

    router.post(
      "/technician/orders/:id/accept",
      requireTechnicianAuth,
      validate({ params: OrderIdParamsSchema }),
      techAccept,
    );

    router.post(
      "/user/orders/:id/card-session",
      requireUserAuth,
      validate({ params: OrderIdParamsSchema }),
      userCreateCardSession,
    );

Even this small route sample shows the architectural pattern clearly. User and technician actions are separated at the route boundary, authentication is role-specific, and DTO validation is enforced before the controller runs. The route layer therefore defines the allowed workflow surface, while the service layer decides whether a requested transition is valid in the current domain state.

Representative tests for the orders module include successful order submission with an explicit destination address, automatic resolution of a user’s single active address when no destination is supplied, rejection when no active address exists, rejection of invalid fixed-slot times, payment card-session handling, webhook idempotency behavior, and notification dispatch during key order transitions. These tests are important because the module coordinates persistence, payment state, and user-visible side effects at the same time.

5.3.6 Technician Calendar Module

The technician calendar module manages scheduling and availability. It supports public calendar reads, booked-slot reads, recurring availability templates, and one-off exceptions such as holidays. Although smaller than the orders module, it is an instructive example of how business invariants are enforced before repository writes are allowed.

Its most important rules are implemented in the service layer. Dates are normalized before use, past dates are rejected, slot hours are restricted to the project’s fixed scheduling model, duplicate holiday exceptions are prevented, and a holiday cannot be created if active bookings already exist for that day. Recurring availability templates are implemented with idempotent upsert behavior, which simplifies frontend interaction and reduces unnecessary conflict handling.

Code example:

    private async ensureHolidayConstraints(technicianId: string, date: string, excludeId?: string) {
      const entries = await technicianCalendarRepository.getEntriesByTechnicianId(technicianId, { from: date, to: date });
      const hasHoliday = entries.some((e) => !excludeId || e.id !== excludeId);
      if (hasHoliday) throw { status: 409, message: "A holiday/exception already exists for this day." };

      const activeOrdersCount = await ordersRepository.getActiveOrdersCountForDate(technicianId, date);
      if (activeOrdersCount > 0) throw { status: 409, message: "There are active bookings on this day." };
    }

This snippet shows a recurring design principle in the project: field-level validation is not enough when a rule depends on existing domain state. Here the service must inspect both the calendar repository and the orders repository before deciding whether the write is legal. Centralizing that invariant check in the service layer keeps the scheduling model consistent regardless of which client triggers the change.

The corresponding tests verify rejection of past dates, rejection of invalid slot hours, rejection of duplicate exceptions, rejection of holiday creation when bookings already exist, and 404 handling for missing calendar entries or availability templates. These scenarios confirm that the module protects schedule integrity rather than merely storing calendar rows.

5.3.7 Admin Module

The admin module applies the same layered architecture to operational and moderation functions. Its responsibilities include a dedicated admin authentication path, dashboard analytics, technician verification and rejection, homeowner and technician blocking flows, and administrative read models for orders, homeowners, and technicians. In effect, the module combines analytical aggregation with direct moderation actions.

At the boundary, dedicated admin middleware isolates administrator access from homeowner and technician authentication paths. Controllers remain thin and primarily wrap service calls into HTTP responses. The service layer performs moderation actions such as technician verification, rejection, blocking, and unblocking, while also orchestrating best-effort side effects such as push notifications after moderation events. The repository layer supplies aggregate queries for dashboard metrics and detailed read models for list, detail, and history screens.

This module is significant because it shows that the same design pattern scales beyond end-user transactions. In the authentication module, services coordinate account and session rules. In the admin module, services coordinate moderation rules and analytics composition. The architectural consistency across these modules reduces conceptual overhead when adding new administrative capabilities.

Implemented tests for the admin module cover dashboard summary aggregation behavior, technician verification and rejection flows, homeowner blocking logic, technician blocking and unblocking logic, and controller-level response-shape and error-propagation behavior. These tests are especially useful because the admin surface combines direct state mutation with derived analytics, both of which must remain stable as the dashboard evolves.

5.3.8 Frontend Module Example: Mobile AI Chat and Recommendation Flow

At the frontend level, one of the most important implemented modules is the mobile AI chat and recommendation flow in the Expo React Native application. This module is significant because it sits directly on top of the AI gateway and recommendation stack described earlier, while also demonstrating how the frontend is structured around typed API boundaries, centralized state, and feature-scoped logic.

The mobile frontend uses Expo Router and React Native for navigation and rendering, Axios for HTTP transport, Zod for response normalization, and local stores for authentication and location state. Within the AI feature, useChatbotController coordinates user text, image, and audio input, requests location permission, submits multimodal requests to the AI gateway, and updates the chat timeline with both assistant messages and recommended technicians. The API layer then normalizes the backend response into a single predictable shape before the UI consumes it.

Code example:

    const serviceOrder =
      raw?.data?.service_order ?? raw?.service_order ?? raw?.serviceOrder;

    const normalized = {
      success: raw?.success ?? true,
      data: {
        service_order: serviceOrder ?? null,
        assistant_message: assistantMessage ?? undefined,
      },
    };

    return safeParseResponse(diagnoseResponseSchema, normalized, "diagnoseIssue");

This frontend snippet illustrates a different but equally important form of boundary protection. Because AI and gateway responses may contain embedded JSON or slightly different field locations, the client first normalizes the raw payload and then validates it against a Zod schema. The result is that presentation components do not need to understand backend variation; they receive a single DiagnoseResponse contract and can render the AI result safely. This mirrors the backend philosophy of thin transport layers and explicit validation, but applies it on the client side.

5.3.9 Main Test Scenarios Across Modules

Across the system, testing was structured to match the implementation layers. Controller tests were used to confirm response mapping, status codes, cookie behavior, and error propagation through Express middleware. Service tests verified business rules, orchestration logic, and cross-repository coordination. Repository tests were added where data mapping or provider-error translation was significant, particularly in authentication flows that depend on Supabase Auth. For modules with lifecycle-heavy behavior, selective scenario-style tests were used to validate real workflows rather than isolated helper functions alone.

The implemented tests therefore focus on four recurring concerns: validation correctness, enforcement of business rules, safety of state transitions, and separation between transport concerns and domain logic. In practical terms, this means testing not only whether a request succeeds, but whether the system rejects invalid state changes, preserves role boundaries, and emits the correct side effects under real workflow conditions. This testing strategy aligns closely with the layered design of the implementation and helps ensure that the architecture remains reliable as the project grows.
