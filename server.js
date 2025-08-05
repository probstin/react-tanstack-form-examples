import cors from 'cors';
import express from 'express';

const app = express();
const PORT = 3001;

app.use(cors());

const countries = [
    { id: 1, label: 'United States', value: 'USA' },
    { id: 2, label: 'Canada', value: 'CAN' },
    { id: 3, label: 'Mexico', value: 'MEX' },
    { id: 4, label: 'Germany', value: 'GER' },
    { id: 5, label: 'Japan', value: 'JAP' },
];

const resorts = [
    { id: 101, label: 'Blue Mountain Resort', value: 'BMR' },
    { id: 102, label: 'Aspen Snowmass', value: 'AS' },
    { id: 103, label: 'Whistler Blackcomb', value: 'WB' },
    { id: 104, label: 'Zermatt Resort', value: 'ZR' },
    { id: 105, label: 'Niseko United', value: 'NU' },
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
