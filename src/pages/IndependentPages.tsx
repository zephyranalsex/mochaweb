import { PageShell } from "./PageShell";

/**
 * Route stubs that are not real pages yet. Every page that used to live here
 * (premium, commands, help, terms, privacy, refunds) now has its own file.
 */
export function BlankPage() {
  return (
    <PageShell
      eyebrow="Mocha / page"
      title="Nothing here yet."
      intro="This route exists, but it has not been given a page body."
      sticker="paperclip"
      crumbs={[{ href: "/", label: "Home" }, { label: "Page" }]}
    >
      <div className="blank-page">
        <p>
          If you landed here from a link, that link points at a page that has not been written. The real destinations
          are below.
        </p>
        <div className="blank-page-links">
          <a className="arrow-link" href="/">
            home
          </a>
          <a className="arrow-link" href="/commands">
            command index
          </a>
          <a className="arrow-link" href="/docs">
            documentation
          </a>
          <a className="arrow-link" href="/help">
            support
          </a>
        </div>
      </div>
    </PageShell>
  );
}

export function ZephyrPage() {
  return <BlankPage />;
}
