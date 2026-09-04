export function BlankPage() {
  return (
    <>
      <div className="scanlines" aria-hidden="true" />

      <main className="blank-page">
        <a className="blank-page-home" href="/">
          mocha <span>&#8592;</span>
        </a>
      </main>
    </>
  );
}

export function ZephyrPage() {
  return <BlankPage />;
}

export function DocsPage() {
  return <BlankPage />;
}