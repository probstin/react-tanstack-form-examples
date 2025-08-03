import cors from 'cors';
import express from 'express';

const app = express();
const PORT = 3001;

app.use(cors());

const countries = [
    { id: 1, label: 'United States' },
    { id: 2, label: 'Canada' },
    { id: 3, label: 'Mexico' },
    { id: 4, label: 'Germany' },
    { id: 5, label: 'Japan' },
];

const resorts = [
    { id: 101, label: 'Blue Mountain Resort' },
    { id: 102, label: 'Aspen Snowmass' },
    { id: 103, label: 'Whistler Blackcomb' },
    { id: 104, label: 'Zermatt Resort' },
    { id: 105, label: 'Niseko United' },
];

// Return all countries (no filter needed)
app.get('/api/pick-lists/countries', (req, res) => {
    res.json(countries);
});

// Return resorts filtered by ?q=
app.get('/api/pick-lists/resorts', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const filtered = q
        ? resorts.filter((r) => r.label.toLowerCase().includes(q))
        : resorts;

    res.json(filtered);
});

app.listen(PORT, () => {
    console.log(`API server is running at http://localhost:${PORT}`);
});
