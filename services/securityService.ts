import { dbService } from "./dbService.js"


export const getSecurity = async () => {
    const db = dbService
    return db.all('SELECT * FROM security')
}

export const setSecurity = async (name, isActive) => {
    const db = dbService;
    await db.run(
        'UPDATE security SET isActive = ? WHERE name = ?',
        [isActive ? 1 : 0, name]
    );
};