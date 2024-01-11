const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML page with form and iframe
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Local Services Search</title>
            <!-- Materialize CSS -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
            <style>
                body { padding: 20px; }
                .search-bar { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h4>Local Services Search</h4>
                <form id="searchForm" class="search-bar">
                    <div class="input-field">
                        <input type="text" id="searchInput" placeholder="Enter search term..." class="validate">
                        <label for="searchInput">Search Term</label>
                    </div>
                    <button type="submit" class="btn waves-effect waves-light">Search</button>
                </form>
                </div>
                <iframe id="resultFrame" style="width:100%; height:600px;"></iframe>

            <script>
                document.getElementById('searchForm').onsubmit = function(event) {
                    event.preventDefault();
                    const searchTerm = document.getElementById('searchInput').value;
                    fetch('/search?q=' + encodeURIComponent(searchTerm))
                        .then(response => response.text())
                        .then(data => {
                            const doc = document.getElementById('resultFrame').contentWindow.document;
                            doc.open();
                            doc.write(data);
                            doc.close();
                        });
                };
            </script>

            <!-- Materialize JavaScript -->
            <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
        </body>
        </html>
    `);
});

// Function to generate the Google Local Services URL
function generateGoogleLocalServicesSearchUrl(searchTerm) {
    const baseUrl = "https://www.google.com/localservices/prolist";
    const params = {
        g2lbs: "AIQllVyzKVKbz4Iuo6WTkSfuZYZMvSFGdungQ3eRn0EASewmSKEgrfzeiA4CJ-w9WkZYCewvqibnvGBB2IJsMRU_WbzqjnsX7CU5gyYCyrF8HZycDYcOQ4t0M-wouLZgT230XGpblAPd",
        hl: "pt-PT",
        gl: "pt",
        cs: "1",
        ssta: "1",
        oq: encodeURIComponent(searchTerm),
        src: "2",
        sa: "X",
        scp: "CgASABoAKgA%3D",
        q: encodeURIComponent(searchTerm),
        ved: "0CAAQ08wJahgKEwiIw5rb8NWDAxUAAAAAHQAAAAAQhAI",
        slp: "MgBAAVIECAIgAIgBAJoBBgoCFxkQAA%3D%3D"
    };
    return `${baseUrl}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`;
}

// Route to handle search requests
app.get('/search', async (req, res) => {
    const searchTerm = req.query.q;
    const url = generateGoogleLocalServicesSearchUrl(searchTerm);

    try {
        const response = await fetch(url);
        const body = await response.text();
        res.send(body);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
