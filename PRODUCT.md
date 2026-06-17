# Product

## Register

product

## Users

Three roles use SafeWork daily, each with a distinct context:

- **Field workers (Operarios):** Submit permit requests for upcoming high-risk tasks. Often on a shared tablet on the plant floor — poor lighting, gloves possible, time pressure.
- **Safety supervisors / Prevencionistas de Riesgos:** The critical user. Reviews pending permits, authorizes or rejects with their signature, monitors active permits in real time, and closes them on completion. Decisions here have direct safety consequences.
- **Admins:** Configure the system — users, roles, plants, permit templates. Run compliance reports for audits and regulatory bodies. Primarily desktop, less time-critical.

Current deployment: Chilean industrial fishing industry (Camanchaca Pesca Sur S.A.), Planta Coronel. Spanish-language interface throughout.

## Product Purpose

SafeWork is a multi-tenant SaaS platform for managing Permisos de Trabajo — the regulated authorization workflow that controls high-risk industrial tasks (hot work, confined space entry, work at height, electrical isolation, etc.).

The core loop: workers request → supervisors authorize with required signatures → admins monitor compliance and generate regulatory reports. Success means zero incidents, full permit closure within time limits, and a clean audit trail for inspectors.

## Brand Personality

Professional · Modern · Vigilant

Reference: Stripe Dashboard and Retool — data-dense, every element earns its place, nothing decorative, unconditional trustworthiness. The interface disappears into the task.

Anti-references:
- Generic startup dashboards (cheerful gradients, illustration-heavy empty states, playful micro-copy — tone conflicts with safety-critical stakes)
- Legacy ERP systems (cluttered, opaque, built for the software's logic rather than the user's workflow)
- Consumer apps (casual color palettes, animations designed to delight rather than communicate state)

## Design Principles

1. **Status at a glance.** A supervisor scanning 15 active permits needs permit state (active / pending / critical / closed) readable in under 2 seconds on a phone in direct sunlight. Color coding and iconography carry meaning; text confirms.

2. **Precision that earns trust.** Supervisors authorize physical work based on what this screen shows. Every data point needs a clear label and unambiguous state. Ambiguity is a liability, not a design choice.

3. **The tool disappears into the task.** Standard affordances throughout. No invented interactions. A Prevencionista who hasn't used the interface in a week should not have to rediscover anything.

4. **Mobile-first, not mobile-limited.** The permit request and approval flows must work reliably on a glove-able tablet in a noisy plant. Compliance reports and admin configuration are desktop-primary. Both are first-class surfaces.

5. **Compliance is the product.** Required signatures, mandatory fields, time limits, and audit trails are not constraints to work around — they are the core value proposition. The design must make regulatory compliance feel effortless, not bureaucratic.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum across all surfaces
- Mobile-first layout; minimum 44px touch targets throughout
- Status indicators (active, pending, critical, closed) must meet contrast requirements for bright outdoor/industrial lighting — never rely on color alone; always pair with icon and label
- Bold, unmistakable visual treatment for critical and expiring permits — these are safety alerts
- Reduced motion support (plant floor staff may run on older shared hardware)
