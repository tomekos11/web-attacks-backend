const bcrypt = require('bcryptjs')
const userService = require('../services/userService.ts')

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("Trwa próba logowania...", { username });

    // Pobranie użytkownika
    const user = await userService.getUserByUsername(username);
    if (!user) {
      console.error('Nie znaleziono użytkownika', { username });
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    // Porównanie hasła
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.error('Nieprawidłowe hasło dla użytkownika', { username });
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    // Sesja
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userNumber = user.userNumber;
    req.session.isAdmin = user.role === 'admin';

    // Odpowiedź
    res.json({ message: 'Zalogowano pomyślnie', user });
  } catch (err) {
    console.error('Błąd podczas logowania:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

const checkAdmin = (req, res) => {
  res.status(200).json({ message: req.session.isAdmin })
}

module.exports = {
  login,
  checkAdmin,
}
