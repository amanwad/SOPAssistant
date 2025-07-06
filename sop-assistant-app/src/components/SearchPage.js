import React, { useState } from 'react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const response = await fetch('http://127.0.0.1:8000/search/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page-container">
      <div className="search-card">
        <h2 className="search-title">Search Uploaded Documents</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            className="search-input"
          />
          <button type="submit" className="search-btn" disabled={loading || !query.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        <div className="search-results">
          {results.length > 0 ? (
            <ul className="results-list">
              {results.map((result, idx) => (
                <li key={idx} className="search-result-item">
                  <pre className="result-text">{result.answer || JSON.stringify(result, null, 2)}</pre>
                </li>
              ))}
            </ul>
          ) : (
            !loading && <div className="no-results">No results yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 