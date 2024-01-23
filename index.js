const express = require('express');
const { handleErrors } = require('./utils/errorHandler');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const { getCornwallLiveArticles, getCornishTimesArticles } = require('./utils/articleExtractor');

const app = express();
const port = 3000;

app.use(cors())

// Root endpoint
app.get('/', (req, res) => {
    res.json('This is a news API');
});

const swaggerDocument = YAML.load('./swagger.yaml');


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define the newspapers array
const newspapers = [
    {
        name: 'cornwalllive',
        address: 'https://www.cornwalllive.com/all-about/truro',
        base: '',
        getArticles: getCornwallLiveArticles,
    },
    {
        name: 'cornishtimes',
        address: 'https://www.cornish-times.co.uk/news/999',
        base: 'https://www.cornish-times.co.uk',
        getArticles: getCornishTimesArticles,
    },
];


// Route to get news from both cornwalllive and cornishtimes
app.get('/news', async (req, res) => {
    try {
        // Fetch articles from cornwalllive
        const cornwallLiveArticles = await newspapers[0].getArticles(newspapers[0].address);

        // Fetch articles from cornishtimes
        const cornishTimesArticles = await newspapers[1].getArticles(newspapers[1].address, newspapers[1].base);

        // Combine articles from both sources
        const allArticles = [...cornwallLiveArticles, ...cornishTimesArticles];

        // Send combined articles as response
        res.json(allArticles);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching articles' });
    }
});

// Route to get news articles for a specific newspaper
app.get('/news/:newspaperName', async (req, res) => {
    const newspaperName = req.params.newspaperName.toLowerCase();
    const newspaper = newspapers.find(news => news.name === newspaperName);

    if (!newspaper) {
        res.status(404).json({ error: 'Newspaper not found' });
        return;
    }

    try {
        // Fetch articles from the specified newspaper
        // Make sure to pass the base URL for newspapers that require it
        const articles = await newspaper.getArticles(newspaper.address, newspaper.base);

        res.json({
            newspaper: newspaper.name,
            articles: articles,
        });
    } catch (error) {
        handleErrors(error, res);
    }
});




// Route to get a specific article for a newspaper
app.get('/news/:newspaperName/:articleIndex', async (req, res) => {
    const newspaperName = req.params.newspaperName.toLowerCase();
    const articleIndex = parseInt(req.params.articleIndex);

    const newspaper = newspapers.find(news => news.name === newspaperName);

    if (!newspaper) {
        res.status(404).json({ error: 'Newspaper not found' });
        return;
    }

    try {
        const articles = await newspaper.getArticles(newspaper.address, newspaper.base); // Include the base property
        const article = articles[articleIndex];

        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }

        res.json({ newspaper: newspaper.name, article });
    } catch (error) {
        handleErrors(error, res);
    }
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
