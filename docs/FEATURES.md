# Caramelow product and system requirements

## Product direction

Caramelow is a mobile-first photo-sharing social app inspired by familiar
social-network patterns. People should be able to share moments, follow friends,
and communicate. Ads are allowed only in small, clearly separate placements.
The app should work across iOS and Android.

Ads must never be styled or inserted as regular feed posts, stories, or other
user content. Feed selection and ordering must not be influenced by advertising.

This document distinguishes what the current prototype does from the product
that still needs to be built. It is a feature and system scope, not a claim that
the planned features already exist.

## Current implementation

The repository currently contains an Expo / React Native prototype backed by
device-local AsyncStorage. It is useful for exploring the basic interface, but
it is not yet a shared social network: accounts and content on one phone are
invisible to other devices.

| Area | Current state |
|---|---|
| Account access | Local username/password sign-up and sign-in; demo account is seeded. No remote identity, password reset, email/phone verification, or account recovery. |
| Profiles | Display name, username, post grid, and post/follower/following counts. No bio, profile photo upload, privacy controls, or editable profile. |
| Following | Follow and unfollow users; self-follow is rejected. No follow requests, blocks, or lists of followers/following. |
| Photo posts | Pick and crop one square photo, add a caption, and share it. Feed and profile show posts. No comments, likes, multiple photos, editing, deletion, or server-side media storage. |
| Feed | Chronological posts from the signed-in user's follows and their own posts. No stories tray, pagination, or refresh from a shared backend. |
| Search | Lists users available on the current device. No text search, topic discovery, or recommendations. |
| Stories, reactions, chat, notifications | Not implemented. |
| Advertising | No ad feature is implemented. |

The API-shaped functions in `src/lib/backend.ts` are a local mock, not a
production backend. Password hashing and base64 image storage in AsyncStorage
are prototype-only approaches and must not be reused as production security or
media-storage solutions.

## Product requirements

### 1. Accounts and sign-in

- Register and sign in to a persistent account that is available across devices.
- Support secure password handling through a trusted identity provider or
  equivalent server-side authentication; never store plaintext passwords or
  rely on client-side hashing for production authentication.
- Verify email or phone as appropriate, support password reset and sign-out,
  and provide account recovery and account deletion.
- Make account deletion easy to find in settings and complete in-app: explain
  what will be deleted, require a clear confirmation (and re-authentication
  where appropriate), then start deletion without requiring a support request
  or unnecessary extra steps.
- Keep a stable user ID separate from the changeable username.
- Validate unique usernames and reasonable lengths for usernames, display
  names, bios, captions, and messages.
- Preserve a signed-in session securely on the device and allow a user to
  revoke other sessions.

### 2. Profiles and social graph

- Show a profile photo, display name, username, optional bio, post grid, and
  counts for posts, followers, and following.
- Let people edit their own profile and view another person's profile.
- Support follow/unfollow and searchable follower/following lists.
- Support public and private accounts. Private accounts require an explicit
  follow request and approval before protected posts and stories are visible.
- Let people remove followers, block accounts, and mute accounts. Enforce these
  rules on the backend, not only by hiding UI.
- A blocked user must not be able to see or contact the blocker through normal
  app flows.

### 3. Photo posts and feed

- Create a post from one or more photos, preview and crop media, add a caption,
  and publish it with clear upload progress and retry behavior.
- Show only posts from accounts the user follows and the current user's own
  posts. Do not include recommendations or posts from unfollowed accounts in the
  home feed.
- Do not use an engagement-based, personalized, or otherwise opaque ranking
  algorithm. Users choose between:
  - **Chronological:** all eligible posts ordered newest first.
  - **Unseen first:** eligible posts the user has not viewed appear before
    already-seen posts; order within each group is newest first.
- Make the selected feed order explicit and easy to switch. Persist the
  selection as a user preference.
- Support infinite scroll with paginated loading, rather than fetching the
  entire feed at once. When the user reaches the end of all currently available
  posts, show the message **“All seen for now”**. Keep pull-to-refresh and useful
  loading, empty, and failure states.
- Allow the author to delete a post; editing can be added if it can be done
  without confusing the post's history.
- Support likes and comments, including like/unlike, comment creation/deletion,
  counts, and navigation to the post conversation.
- Show post author, media, caption, and creation time. Respect profile privacy,
  blocks, and deleted content in feed and profile queries.
- Keep media files out of the relational records: upload media to private or
  access-controlled object storage and store durable media metadata and URLs.

### 4. Stories

- Create a photo or short video story with optional text or simple overlays.
- Stories expire after 24 hours by default and are omitted from normal profile
  and feed grids after expiry. The author may delete one earlier.
- Show active stories in a tray, ordered with unseen followed accounts first.
- Open a full-screen story viewer with progress, tap navigation, pause/resume,
  and swipe or close behavior appropriate to a phone.
- Record views for the author, subject to privacy settings.
- Allow viewers to reply privately or send a quick reaction. Deliver the reply
  or reaction into the existing private conversation model; do not expose it as
  a public comment.
- Apply account privacy, audience selection, blocks, and mutes consistently to
  story creation, viewing, replies, and viewer lists.

### 5. Private chat and story reactions

- Provide an inbox with conversation list, last-message preview, unread state,
  and timestamp.
- Start or resume a one-to-one conversation with another allowed account.
- Send and receive text messages; display delivery/read state where supported.
- Support image attachments only after secure media upload and moderation
  requirements are defined.
- Deliver story replies and quick reactions as messages associated with the
  originating story where possible.
- Enforce block, privacy, and message-permission rules server-side. Users need
  controls to report a conversation/message and to mute or block a sender.
- Provide accessible, keyboard-aware composer behavior and handle offline,
  retry, and duplicate-send states.

### 6. Search and discovery

- Search accounts by username and display name, with clear no-results and
  loading states.
- Open profiles and follow/request to follow from results.
- Search and discovery must not alter the home feed's followed-only rule or
  introduce ranked recommendations into it.
- Topic, hashtag, and location discovery are optional follow-on features, not
  required for the first shared release.

### 7. Notifications

- Notify users about relevant events: follow requests and approvals, new
  followers, likes, comments, messages, and story replies/reactions.
- Provide in-app notification history and unread indicators.
- Add push notifications only with user permission and settings to control
  categories and quiet hours.
- Avoid leaking private content in lock-screen previews by default; provide
  privacy-conscious notification settings.

### 8. Safety, privacy, and account controls

- Provide report flows for accounts, posts, comments, stories, and messages.
- Provide block, mute, comment controls, and privacy/audience settings.
- Establish moderation review and enforcement workflows before enabling public
  discovery at scale.
- Collect only data needed for stated purposes; explain those purposes, the
  applicable legal basis, retention, and relevant sharing in a clear privacy
  notice before or when data is collected.
- Provide ways to access, correct, export, restrict, object to, and delete
  personal data as applicable to the user's jurisdiction. Make it possible to
  withdraw consent as easily as it was given when consent is the legal basis.
- Make account deletion easy to find in settings. Explain the consequences,
  require an explicit confirmation to prevent accidental deletion, and begin
  the request without requiring the user to contact support.
- On confirmed deletion, promptly disable access and revoke sessions, then
  delete or irreversibly anonymize the account's personal data and content from
  active systems, including profile data, posts, comments, likes, stories,
  media files, messages where legally and technically appropriate, view
  records, notifications, and linked service-provider records.
- Propagate deletion requests to processors and storage providers. Expire
  backup copies according to a documented backup lifecycle; keep deleted data
  inaccessible and do not restore it to live systems. Tell the user about the
  expected completion timeline.
- Retain data after a deletion request only where a specific legal obligation,
  dispute, fraud-prevention need, or other valid exception requires it. Limit
  retained data to what is necessary, restrict access, document the reason and
  retention period, and delete it when that need ends. Explain applicable
  exceptions to the user.
- Define how shared conversations are handled on deletion: remove or
  de-identify the deleted account's personal identifiers and handle copies
  visible to other participants according to applicable law and the disclosed
  retention policy.
- Apply authorization on every backend read and write. A client must never be
  trusted to enforce content visibility or ownership.
- Define retention and deletion behavior for expired stories, deleted media,
  messages, reports, and backups.

### 8.1 Global privacy and GDPR readiness

GDPR is the EU/EEA data-protection framework; other markets have their own
privacy, consumer-protection, minium age of 18, and electronic-communications
rules. Treat this section as product requirements, not legal advice or a claim
of compliance. Before launch in each market, obtain qualified privacy counsel
and confirm which laws apply to the service, its users, and its processing.

- Maintain an inventory of personal data, purposes, legal bases, recipients,
  processors, storage locations, and retention periods. Keep a record of
  processing activities where required.
- Use purpose limitation and data minimization: do not collect sensitive or
  precise location data unless a defined feature needs it and the collection
  is lawful and clearly explained.
- Present a concise privacy notice at collection, with an accessible full
  notice covering the controller, purposes/legal bases, sharing, international
  transfers, retention, user rights, and how to contact the privacy team or
  relevant regulator.
- Do not bundle optional processing (such as non-essential analytics or
  personalized advertising) into account creation. Where consent is required,
  request it separately, record it, and provide a simple way to withdraw it.
  Essential service processing must have an appropriate legal basis rather
  than being mislabeled as consent.
- Support rights requests through an authenticated, accessible in-app flow and
  an alternative contact route. Verify identity proportionately, track requests
  and deadlines, and provide a reason when a request cannot be fully fulfilled.
- Use written processor agreements and assess providers before sharing data.
  Assess international transfer mechanisms and safeguards before data leaves a
  jurisdiction that restricts transfers.
- Apply privacy by design and default: private-by-default settings where
  appropriate, limited visibility, least-privilege access, encryption in
  transit and at rest, and no personal data in logs or ad identifiers unless
  specifically justified.
- Maintain an incident-response process to investigate, contain, document,
  and notify affected people and regulators within the deadlines required by
  applicable law.
- Assess whether a data-protection impact assessment, privacy representative,
  data-protection officer, or local representative is required before launch
  or when processing changes.
- Determine minimum age and parental-consent requirements separately for each
  target market. Do not knowingly collect children's data without the required
  safeguards and consent; provide age-appropriate notices and controls where
  the service is available to minors.
- Review advertising, analytics, SDKs, and device identifiers against
  applicable privacy and electronic-communications rules. Do not use sensitive
  data or private messages for ad targeting; honor applicable opt-outs and
  consent choices.
- Review the privacy program whenever a new feature, vendor, data use, or
  market is introduced; keep policies, user-facing controls, and actual system
  behavior consistent.

### 9. Advertising

- Ads may appear only in small, visually distinct, clearly labeled areas
  separate from user content, such as a compact banner placement like the
  supplied reference image.
- Never insert ads into the feed as photo posts, stories, or anything that looks
  like a user's content. Do not use sponsored posts or sponsored stories.
- Do not let ad selection, payment, or engagement affect which followed users'
  posts appear or their order.
- Do not show an ad in place of a post, story, message, or notification.
- Keep ad placements limited and non-disruptive on mobile; do not block core
  navigation, posting, or messaging.
- Clearly distinguish advertising from app controls and user-generated content.
- Keep analytics and product measurement separate from ad targeting; collect
  only what is needed and disclose it to users.

## System requirements

### Shared backend and data

Replace the current local mock with a remote service that is the source of truth
for identities, relationships, posts, stories, messages, and notifications.
Keep UI code behind a typed data-access layer, but treat the current
`src/lib/backend.ts` signatures as prototype examples rather than a fixed
production contract.

The service needs durable records and relationships for at least:

| Entity | Minimum data / relationship |
|---|---|
| User | Stable ID, unique username, display name, profile fields, privacy mode, feed-order preference, account state, timestamps. Credentials belong to the identity service, not public profile records. |
| Follow | Follower ID, followed-user ID, state (requested/accepted), timestamps; unique pair and no self-follow. |
| Post | Author ID, caption, visibility, timestamps, deletion state; one post can reference multiple media items. |
| Post view | Viewer ID, post ID, viewed-at timestamp; supports unseen-first ordering and must follow content-visibility rules. |
| Media | Owner/content ID, object-storage key, media type, dimensions/duration, processing state, access policy, timestamps. |
| Like | User ID and post ID, unique pair, timestamp. |
| Comment | Post ID, author ID, text, timestamps, deletion/moderation state. |
| Story | Author ID, media reference, audience, created/expiry timestamps, deletion state. |
| Story view | Story ID, viewer ID, viewed-at timestamp, with privacy and retention rules. |
| Conversation | Participants, conversation state, timestamps; participant membership must be checked for every operation. |
| Message | Conversation ID, sender ID, body or media reference, optional story reference, timestamps, delivery/read state, deletion/moderation state. |
| Notification | Recipient, event type/reference, read state, creation time, delivery state. |
| Report / block / mute | Actor, target/content reference, state or reason, timestamps; access checks must use these records. |

Use database constraints and transactions for uniqueness and relationship
updates. Add indexes for feed retrieval, user lookup, conversation ordering,
unread notifications, and story expiry. Use pagination rather than loading an
unbounded feed or message history.

### Media and processing

- Upload photos/videos directly or through a controlled upload service to
  object storage; do not store base64 media in AsyncStorage or relational rows.
- Validate file type and size, generate thumbnails, and normalize media for
  mobile delivery.
- Use access-controlled URLs or equivalent authorization for private media.
- Define limits for photo dimensions, video duration/size, and upload retries.
- Remove orphaned and deleted media according to the retention policy.

### Realtime and background work

- Provide a reliable delivery mechanism for chat and live notification updates;
  reconnect cleanly and fetch missed events after a disconnect.
- Use background jobs for media processing, story expiration, push delivery,
  and cleanup.
- Treat push notifications as hints to refresh server state, not as the
  authoritative record.

### Security and reliability

- Use encrypted transport and secure credential/session handling.
- Enforce authentication, ownership, participant membership, privacy, and
  block checks on the server for every relevant operation.
- Add rate limits and abuse protections for sign-in, follow actions, comments,
  messages, uploads, and reports.
- Validate and constrain all user-generated input; safely render text and
  restrict uploaded content types.
- Provide observability for errors and service health without logging
  passwords, tokens, private messages, or unnecessary personal data.
- Back up production data and define recovery objectives and operational
  procedures.
- Maintain documented data-retention and deletion jobs across databases,
  object storage, analytics, push providers, and backups; make deletion
  idempotent, auditable without retaining unnecessary personal data, and
  observable when a processor fails to complete it.
- Keep a privacy data map and records of user consent/preferences where
  applicable; ensure account deletion and rights requests propagate across
  connected services.

### Mobile experience

- Support current iOS and Android releases with responsive layouts, safe areas,
  accessible labels, adequate touch targets, and dynamic text where practical.
- Handle permissions, denied access, low connectivity, app backgrounding, and
  interrupted uploads without losing user work.
- Cache feed and profile content appropriately while making stale/offline state
  clear. Do not cache private media beyond the intended access policy.
- Keep lists virtualized and media loading efficient to protect memory and
  battery on lower-end phones.
- Keep platform-specific behavior behind Expo-compatible APIs and configuration.

## Suggested delivery order

### Phase 1 — Shared social foundation

1. Choose and configure the hosted backend, authentication, and production
   environment.
2. Migrate account, profile, follow, and post flows from device-local storage
   to shared persistence.
3. Add secure media upload, profile editing, searchable accounts, and paginated
   chronological feed.
4. Add likes, comments, deletion, and backend-enforced privacy/block rules.
5. Add basic reporting, account controls, and operational error handling.

### Phase 2 — Stories and communication

1. Add story upload, expiry, viewer, audience enforcement, and view records.
2. Add the inbox and reliable one-to-one text messaging.
3. Route story replies and quick reactions into conversations.
4. Add in-app notifications, then optional push notifications with consent.

### Phase 3 — Quality and growth

1. Improve moderation tools, accessibility, performance, offline recovery, and
   automated coverage.
2. Consider optional discovery features such as topics, without changing the
   followed-only home feed contract.
3. Review privacy, retention, support, and capacity before broad launch.

## Release acceptance checklist

- Two accounts on separate devices can register/sign in and see shared,
  authorized content.
- A user can publish a photo post, see it in the correct feed/profile, and
  delete it; private and blocked content is not exposed through API requests.
- Likes and comments persist and update consistently across devices.
- Stories expire at 24 hours, respect their audience, and support private
  replies/reactions.
- Messages survive reconnects, display in the correct conversation, and cannot
  be read or sent by non-participants.
- Search, notifications, upload failures, empty states, and permission denial
  have understandable mobile UX.
- Any advertising is confined to compact, clearly labeled placements and is
  never presented as a regular post or story.
- The home feed contains only followed accounts' and the user's own posts,
  offers chronological and unseen-first ordering, uses paginated infinite
  scroll with an “All seen for now” end-of-feed message, and never uses opaque
  ranking.
- Users can find account deletion in settings, confirm it clearly, and have
  deletion propagated to active systems and processors under a documented
  retention and backup policy, subject only to disclosed legal exceptions.
- Privacy notices, rights-request handling, consent controls where required,
  and market-specific age and transfer requirements are reviewed before
  launch.
- Lint, type checking, and relevant automated tests pass; production services
  have documented monitoring, backups, and account/content deletion behavior.
