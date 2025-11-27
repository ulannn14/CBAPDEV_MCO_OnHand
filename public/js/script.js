import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
const app = express();

app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(process.cwd(), 'views/layouts'),
  partialsDir: path.join(process.cwd(), 'views/partials'),
}));

app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.static('public'));

app.get('/messages', (req, res) => {
  res.render('pages/chatbox-customer', { title: 'Messages' });
});

app.get('/messages/provider', (req, res) => {
  res.render('pages/chatbox-provider', { title: 'Messages' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));