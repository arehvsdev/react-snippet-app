import AuthLayout from "../layouts/AuthLayout";

const CreateSnippet = () => {
    return (
        <AuthLayout>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Create Snippet</h1>
                <p>Here you can create a new code snippet.</p>
                {/* Placeholder for snippet form */}
            </div>
        </AuthLayout>
    );
};

export default CreateSnippet;
