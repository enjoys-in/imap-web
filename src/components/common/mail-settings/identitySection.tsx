export default function IdentitySection() {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-12">Identity and addresses</h1>
  
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Short domain (@pm.me)</h2>
            <p className="text-gray-300 mb-1">
              Upgrade to add a shorter @pm.me address to your account that is easier to share. It stands for "Proton Mail
              me" or "Private Message me".
            </p>
            <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
              Learn more
            </a>
  
            <div className="mt-6">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-md hover:bg-gray-900 transition-colors">
                <span className="text-blue-400 text-sm">✉️</span>
                <span>Activate enjoys06@pm.me</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  