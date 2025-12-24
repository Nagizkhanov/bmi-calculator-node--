console.log('SERVER FILE:', __filename);
require('dotenv').config();

const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ================= PAGES =================

// BMI page
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// User dashboard page
app.get('/user', (req, res) => {
  res.sendFile(path.resolve('public/user.html'));
});

// ================= BMI LOGIC =================
app.post('/calculate-bmi', (req, res) => {
  const weight = parseFloat(req.body.weight);
  const height = parseFloat(req.body.height);

  if (!weight || !height || weight <= 0 || height <= 0) {
    return res.send('Invalid input');
  }

  const bmi = weight / (height * height);

  let category = '';
  let color = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#2196f3';
  } else if (bmi < 25) {
    category = 'Normal';
    color = '#4caf50';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#ff9800';
  } else {
    category = 'Obese';
    color = '#f44336';
  }

  res.redirect(
    `/result.html?bmi=${bmi.toFixed(1)}&category=${encodeURIComponent(
      category
    )}&color=${encodeURIComponent(color)}`
  );
});

// ================= API ROUTE =================
app.get('/api/user-data', async (req, res) => {
  try {
    // Random User
    const userRes = await axios.get('https://randomuser.me/api/');
    const u = userRes.data.results[0];

    const user = {
      firstName: u.name.first,
      lastName: u.name.last,
      gender: u.gender,
      age: u.dob.age,
      picture: u.picture.large,
      city: u.location.city,
      country: u.location.country
    };

    // Country
    const countryRes = await axios.get(
      `https://restcountries.com/v3.1/name/${user.country}`
    );
    const c = countryRes.data[0];
    const currencyCode = Object.keys(c.currencies)[0];

    const country = {
      name: c.name.common,
      capital: c.capital ? c.capital[0] : 'N/A',
      currency: currencyCode,
      flag: c.flags.svg
    };

    // Exchange
    const exchangeRes = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/${currencyCode}`
    );

    const exchange = {
      usd: exchangeRes.data.conversion_rates.USD,
      kzt: exchangeRes.data.conversion_rates.KZT
    };

    // News
    const newsRes = await axios.get(
      `https://newsapi.org/v2/everything?q=${country.name}&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
    );

    const news = newsRes.data.articles.map(a => ({
      title: a.title,
      url: a.url
    }));

    res.json({ user, country, exchange, news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'API error' });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});