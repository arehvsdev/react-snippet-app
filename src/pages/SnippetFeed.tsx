import AuthLayout from "../layouts/AuthLayout";

const SnippetFeed = () => {
    return (
        <AuthLayout>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Snippet Feed</h1>
                <p>Here you can see snippets from other users.</p>
                {/* Placeholder for snippet list */}
            </div>
        </AuthLayout>
    );
};

export default SnippetFeed;
