// Importing required modules
const axios = require('axios'); // Axios for making HTTP requests
const cheerio = require('cheerio'); // Cheerio for parsing and manipulating HTML

// Asynchronous function to get articles from Cornwall Live website
async function getCornwallLiveArticles(address) {

    // Making a GET request to the provided address and awaiting the response
    const response = await axios.get(address);
    
    // Storing the HTML content from the response
    const html = response.data;
    
    // Loading the HTML content into Cheerio for parsing
    const $ = cheerio.load(html);

    // Initializing an array to store the articles
    const articles = [];
    
    // Using a selector to find each article and iterating over them
    $('div.teaser-text a.headline', html).each(function () {
        
        // Extracting the article title and trimming any extra whitespace
        const title = $(this).text().trim();
        
        // Extracting the URL (href attribute) of the article
        const url = $(this).attr('href');
        
        // Adding the article's title and URL to the articles array
        articles.push({ title, url });
    });

    // Returning the array of articles
    return articles;
}

// Asynchronous function to get articles from Cornish Times website
async function getCornishTimesArticles(address, base) {

    // Making a GET request to the provided address and awaiting the response
    const response = await axios.get(address);
    
    // Storing the HTML content from the response
    const html = response.data;
    
    // Loading the HTML content into Cheerio for parsing
    const $ = cheerio.load(html);

    // Initializing an array to store the articles
    const articles = [];
    
    // Using a selector to find each article and iterating over them
    $('.Itemstyled__SectionItemWrapper-sc-119v85k-1', html).each(function () {
       
        // Extracting the article title and trimming any extra whitespace
        const title = $(this).find('.title').text().trim();
       
        // Concatenating the base URL with the article's relative URL (href attribute)
        const url = base + $(this).find('a').attr('href');
       
        // Adding the article's title and URL to the articles array
        articles.push({ title, url });
    });

    // Returning the array of articles
    return articles;
}

// Exporting the functions for use in other parts of the application
module.exports = { getCornwallLiveArticles, getCornishTimesArticles };
