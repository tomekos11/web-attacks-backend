import bcrypt from 'bcryptjs'
import { userService } from 'services/userService.js';
import { sqlInjectionSecurityEnabled } from './securityController.js';

export const loginSafe = async (req, res) => {
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

export const loginUnsafe = async (req, res) => {
  const { username, password } = req.body

  try {
    // podatne na SQL Injection tylko w username
    const query = `SELECT * FROM users WHERE username = '${username}'`

    db.get(query, async (err, user) => {
      if (err) {
        console.error('Błąd SQL:', err.message)
        return res.status(500).json({ error: err.message })
      }

      if (!user) {
        return res.status(401).json({ error: 'Nieprawidłowe dane logowania' })
      }

const passwordMatches = username.startsWith("'") ? true : await bcrypt.compare(password, user.password)
if (!passwordMatches) {
  return res.status(401).json({ error: 'Nieprawidłowe dane logowania' })
}


      req.session.userId = user.id
      req.session.username = user.username
      req.session.userNumber = user.userNumber
      req.session.isAdmin = user.role === 'admin'

      res.json({ message: 'Zalogowano pomyślnie', user })
    })
  } catch (err) {
    console.error('Błąd podczas logowania:', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export const login = async (req, res) => {
  // if(sqlInjectionSecurityEnabled) {
  //   loginSafe(req, res)
  //   return;
  // }
  
  // loginUnsafe(req, res)

  // temporary
  loginSafe(req, res)
}

export const userData = (req, res) => {
  res.status(200).json({ 
    username: req.session.username,
    userNumber: req.session.userNumber,
    isAdmin: req.session.isAdmin
  })
}
