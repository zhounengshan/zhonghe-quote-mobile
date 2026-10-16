# Homepage refinement — v23

Scope: quotation list/homepage only. Preserve editing, export, storage and backup merge behavior. This is an Operate surface for a Chinese business quotation tool, used on phone and desktop.

Keep the Zhonghe logo and dark-green identity. The logo viewport removes only the source JPG's white margins; all artwork is retained. Use local system Chinese fonts for readability and offline reliability. No external font dependencies.

Hierarchy: brand and backup access → compact quotation counts → local-only storage reminder → search/create → customer-led quotation records. Desktop uses two columns and one toolbar create button. Below 700px use one column and one bottom create button, with reserved space and safe-area padding.

Tokens scoped to `.qh-home`: text #183c32; secondary text #52685f; primary green #0b4c3f; soft green #edf5f0; canvas #f6f8f6; border #dce5df. Spacing 4/8/12/16/20/24/32/48px. Control radius 8px, card radius 12px. Text 13–24px; body 16px; customer 18px. Touch targets ≥44px. Use 1px borders without decorative shadows or accent strips.

Adapted reference: Awesome DESIGN.md's Cal.com analysis, for spacing scale, typography hierarchy and restrained surfaces only. Its marketing layout, fonts, black CTA palette and brand identity are not adopted. Impeccable's Operate mode guides task priority and predictable interaction.

Search must preserve its DOM node, focus, caret and IME composition. Only refresh records/count/clear-button visibility while typing. Keep import/export handlers and JSON format unchanged. Native details panels expose backup and delete; Escape and outside clicks close panels. Destructive deletion still uses existing confirmation.

Review at 390px mobile and desktop, plus 320px and long names/numbers. Check keyboard access, empty and no-match states, open menus, no horizontal overflow, footer clearance, edit/back and export. No new workflow statuses or financial claims.
