type MainContentProps = {
  children?: React.ReactNode
}

const MainContent = ({ children }: MainContentProps) => (
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
    {children ?? (
      <section className="text-center py-16">
        <div className="inline-block mb-6">
          <div className="w-12 h-12 bg-brand rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">SA</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
          Welcome to SnippetApp
        </h1>
        <p className="text-lg text-body mb-8 max-w-2xl mx-auto">
          Create, organize, and share your code snippets with ease. Build a library of reusable code for your projects.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <button className="px-8 py-3 border-2 border-brand text-brand font-semibold rounded-lg hover:bg-neutral-secondary transition-colors">
            Learn More
          </button>
        </div>
      </section>
    )}
  </main>
)

export default MainContent
