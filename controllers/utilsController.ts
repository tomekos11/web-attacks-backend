import { exec } from 'child_process'

 export const pingHost = (req, res) => {
  const name = req.query.name || 'localhost'
  const command = `cmd /c "ping -n 1 ${name}"`

  exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(error, stdout, stderr)
        console.error(`Błąd: ${error}`)
      return res.status(500).send(`Błąd:\n${stderr}`)
    }
    console.log(stdout)
    res.send(`Wynik:\n${stdout}`)
  })
}
