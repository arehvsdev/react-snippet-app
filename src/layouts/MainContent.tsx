type MainContentProps = {
  children?: React.ReactNode
}

const MainContent = ({ children }: MainContentProps) => (
  <main className="app-main">
    {children ?? (
      <section className="main-placeholder">
        <h1>Welcome</h1>
        <p>This is the main content area.</p>
      </section>
    )}
  </main>
)

export default MainContent
