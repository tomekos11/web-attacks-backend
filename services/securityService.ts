import { dbService } from "./dbService.js"


export const getSecurity = async () => {
    try {
      const db = await dbService;
      console.log(2)
      const settings = await db.all('SELECT * FROM security_settings');
      return settings
    } catch (err) {
      console.error('DB error in getSecurity:', err);
      return [];
    }
  };

export const setSecurity = async (name, isActive) => {
    const db = dbService;
    await db.run(
        'UPDATE security_settings SET isActive = ? WHERE name = ?',
        [isActive ? 1 : 0, name]
    );
};