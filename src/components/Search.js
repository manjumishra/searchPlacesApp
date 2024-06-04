import React, { useState, useEffect } from "react";
import "./search.css";
import axios from "axios";

const Search = () => {
    const [query, setQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [limit, setLimit] = useState(5);
    const [perPage, setPerPage] = useState(3);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [shortCutFocus, setShortCutFocus] = useState(false);

    useEffect(() => {
        const handleShortcut = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                document.getElementById('search-box').focus();
            }
        };
        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, []);

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            setLoading(true);
            setError('');
            const apiUrl = process.env.REACT_APP_API_URL;
            const apiKey = process.env.REACT_APP_API_KEY;
            console.log("process.env.REACT_APP_API_URL..", apiKey)
            try {
                const response = await axios.get(apiUrl, {
                    params: {
                        namePrefix: query,
                        limit,
                        offset: (currentPage - 1) * limit
                    },
                    // params: { countryIds: 'IN', namePrefix: 'del', limit: '5' },
                    headers: {
                        'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
                        'x-rapidapi-key': apiKey
                    }
                });
                if (response.data.data.length === 0) {
                    setError('No result found');
                } else {
                    setPlaces(response.data.data);
                    setTotalResults(response.data.metadata.totalCount);
                    console.log("placess....", response.data.metadata)
                }
            } catch (err) {
                setError('Error fetching data');
                console.log("process.env.REACT_APP_API_URL..", process.env.REACT_APP_API_URL)

            } finally {
                setLoading(false);
            }
        }
    };

    const handleLimitChange = (e) => {
        const value = Number(e.target.value);
        if (value > 10) {
            alert('Maximum limit is 10');
            return;
        }
        setLimit(value);
    };

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        handleSearch({ key: 'Enter' });
    };
    const focusSearchInput = () => {
        setShortCutFocus(true)
    };
    return (
        <div className="search">
            <div className="search-container">
                <input
                    id="search-box"
                    type="text"
                    className="search-box"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    placeholder="Search for places..."
                />
                <span className="keyboard" onClick={focusSearchInput} id={shortCutFocus ? "keyboardfocused" : ""} >Ctrl+/</span>
            </div>
            {loading ? (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Place Name</th>
                                <th>Country</th>
                            </tr>
                        </thead>
                        <tbody>
                            {places.length === 0 && !error ? (
                                <tr>
                                    <td colSpan="3">Start searching</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="3">{error}</td>
                                </tr>
                            ) : (
                                places.slice(0, perPage).map((place, index) => (
                                    <tr key={index}>
                                        <td>{index + 1 + (currentPage - 1) * limit}</td>
                                        <td>{place.name}</td>
                                        <td>
                                            <img src={`https://flagsapi.com/${place.countryCode}/shiny/24.png`} alt={place.country} />
                                            {place.country}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {places.length > 0 && (
                        <div className="pagination-container">
                            <div className="pagination">
                                {[...Array(Math.ceil(totalResults / limit)).keys()].map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page + 1)}
                                        className={currentPage === page + 1 ? 'active' : ''}
                                    >
                                        {page + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="per-page">
                                <label>Results per page:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={limit}
                                    onChange={handleLimitChange}
                                />
                                <label>Show per page:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Search;