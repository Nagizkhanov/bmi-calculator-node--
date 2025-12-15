const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Парсим данные формы и раздаём статику из папки public
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET /  -> главная страница с формой (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST /calculate-bmi  -> считаем BMI и переходим на красивый result.html
app.post('/calculate-bmi', (req, res) => {
  const weight = parseFloat(req.body.weight);
  const height = parseFloat(req.body.height);

  // Валидация
  if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
    return res.send(`
      <div style="font-family: system-ui; text-align: center; padding: 40px; background: #ffebee; min-height: 100vh;">
        <h1 style="color:#c62828; margin-bottom: 10px;">Ошибка ввода</h1>
        <p style="color:#b71c1c; margin-bottom: 20px;">
          Вес и рост должны быть положительными числами.
        </p>
        <a href="/" style="
          display:inline-block;
          padding:10px 20px;
          background:#667eea;
          color:white;
          text-decoration:none;
          border-radius:8px;
        ">Вернуться к форме</a>
      </div>
    `);
  }

  // Расчёт BMI
  const bmi = weight / (height * height);

  let category;
  let color;

  if (bmi < 18.5) {
    category = 'Недовес';
    color = '#2196f3'; // синий
  } else if (bmi < 25) {
    category = 'Норма';
    color = '#4caf50'; // зелёный
  } else if (bmi < 30) {
    category = 'Избыточный вес';
    color = '#ffb300'; // жёлто-оранжевый
  } else {
    category = 'Ожирение';
    color = '#f44336'; // красный
  }

  // Редирект на result.html с параметрами в URL
  res.redirect(
    `/result.html?bmi=${bmi.toFixed(1)}&category=${encodeURIComponent(
      category
    )}&color=${encodeURIComponent(color)}`
  );
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
